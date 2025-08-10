const express = require('express');
const router = express.Router();
const SlotEngineService = require('../services/slotEngineService');
const CascadingReelsService = require('../services/cascadingReelsService');

// Initialize services
const slotEngine = new SlotEngineService();
const cascadingService = new CascadingReelsService(slotEngine);

// Game initialization endpoint - integrates with Naffles NFT system
router.post('/initialize', async (req, res) => {
  try {
    const { playerId, betAmount = 100, tokenType = 'points', nafflesSessionToken } = req.body;
    
    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: 'Player ID is required'
      });
    }
    
    // Generate a game session ID
    const gameId = `crypto_reels_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let nftData = {
      hasEligibleNFTs: false,
      eligibleNFTs: [],
      totalMultiplier: 1,
      walletCount: 0,
      source: 'none'
    };

    let nafflesSessionId = null;
    let playerBalance = null;

    // Get NFT data from Naffles if session token provided
    if (nafflesSessionToken) {
      try {
        // Call Naffles enhanced wagering API to initialize gaming session with NFT data
        const nafflesResponse = await fetch(`${process.env.NAFFLES_API_URL || 'http://localhost:3001'}/api/wagering/initialize-gaming`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nafflesSessionToken}`
          },
          body: JSON.stringify({
            gameType: 'cryptoReels',
            tokenType,
            betAmount: betAmount.toString(),
            thirdPartyGameId: gameId
          })
        });

        if (nafflesResponse.ok) {
          const nafflesData = await nafflesResponse.json();
          
          // Extract NFT data from Naffles response
          nftData = {
            hasEligibleNFTs: nafflesData.data.nftData.hasEligibleNFTs,
            eligibleNFTs: nafflesData.data.nftData.eligibleNFTs.map(nft => ({
              contractAddress: nft.contractAddress,
              contractName: nft.contractName,
              tokenId: nft.tokenId,
              multiplier: nft.multiplier,
              bonusType: nft.bonusType,
              metadata: nft.metadata,
              chainId: nft.chainId,
              walletAddress: nft.walletAddress
            })),
            totalMultiplier: nafflesData.data.nftData.totalMultiplier,
            walletCount: nafflesData.data.nftData.walletCount,
            scannedAt: nafflesData.data.nftData.scannedAt,
            source: 'naffles'
          };

          nafflesSessionId = nafflesData.data.sessionId;
          playerBalance = nafflesData.data.playerBalance;
        } else {
          console.warn('Failed to initialize Naffles gaming session:', await nafflesResponse.text());
        }
      } catch (nafflesError) {
        console.warn('Failed to connect to Naffles platform, continuing without NFT bonuses:', nafflesError.message);
      }
    }
    
    res.json({
      success: true,
      gameId,
      status: 'initialized',
      gameType: 'cryptoReels',
      betAmount,
      tokenType,
      maxWaysToWin: slotEngine.maxWaysToWin,
      payoutTable: slotEngine.getPayoutTable(),
      cascadeMultipliers: cascadingService.getCascadeMultipliers(),
      maxCascades: cascadingService.getMaxCascades(),
      nftData: nftData,
      nafflesIntegration: {
        connected: nftData.source === 'naffles',
        sessionId: nafflesSessionId,
        playerBalance: playerBalance,
        nftBonusActive: nftData.hasEligibleNFTs,
        totalMultiplier: nftData.totalMultiplier
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Game initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Spin endpoint with full Megaways and cascading mechanics plus NFT bonuses
router.post('/spin', async (req, res) => {
  try {
    const { 
      gameId, 
      betAmount = 100, 
      vrfNumber, 
      nafflesSessionId = null,
      nftData = null 
    } = req.body;
    
    if (!gameId) {
      return res.status(400).json({
        success: false,
        error: 'Game ID is required'
      });
    }
    
    if (!vrfNumber) {
      return res.status(400).json({
        success: false,
        error: 'VRF number is required for fair randomness'
      });
    }
    
    // Validate VRF number format (should be hex string)
    if (!/^0x[0-9a-fA-F]+$/.test(vrfNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid VRF number format'
      });
    }
    
    // Generate initial reel configuration
    const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
    
    // Populate reels with symbols
    const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
    
    // Validate reel configuration
    if (!slotEngine.validateReelConfiguration(populatedReels)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid reel configuration generated'
      });
    }
    
    // Calculate ways to win
    const waysToWin = slotEngine.calculateWaysToWin(populatedReels);
    
    // Process cascading reels (includes initial spin + all cascades)
    const cascadeResult = cascadingService.processCascadingReels(
      populatedReels, 
      vrfNumber, 
      betAmount
    );
    
    // Calculate cascade statistics
    const cascadeStats = cascadingService.calculateCascadeStatistics(cascadeResult);
    
    // Apply NFT multiplier from Naffles-provided data
    const baseWinnings = cascadeResult.totalWinnings;
    let nftMultiplier = 1;
    let nftBonusDetails = {
      applied: false,
      eligibleNFTs: [],
      totalMultiplier: 1,
      bonusWinnings: 0
    };

    if (nftData && nftData.hasEligibleNFTs && nftData.totalMultiplier > 1) {
      nftMultiplier = nftData.totalMultiplier;
      nftBonusDetails = {
        applied: true,
        eligibleNFTs: nftData.eligibleNFTs.map(nft => ({
          contractName: nft.contractName,
          contractAddress: nft.contractAddress,
          tokenId: nft.tokenId,
          multiplier: nft.multiplier,
          metadata: nft.metadata
        })),
        totalMultiplier: nftMultiplier,
        bonusWinnings: baseWinnings * (nftMultiplier - 1),
        source: nftData.source || 'naffles'
      };
    }

    const finalWinnings = baseWinnings * nftMultiplier;
    
    // Prepare response
    const spinResult = {
      gameId,
      spinId: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      betAmount,
      waysToWin,
      initialReels: populatedReels,
      cascadeResult: {
        totalCascades: cascadeResult.totalCascades,
        totalWinnings: cascadeResult.totalWinnings,
        maxMultiplierReached: cascadeResult.maxMultiplierReached,
        cascades: cascadeResult.cascades.map(cascade => ({
          level: cascade.level,
          reelState: cascade.reelState,
          winningCombinations: cascade.winningCombinations,
          multiplier: cascade.multiplier,
          levelPayout: cascade.levelPayout,
          totalPayout: cascade.totalPayout
        })),
        finalReelState: cascadeResult.finalReelState
      },
      nftBonus: {
        multiplier: nftMultiplier,
        baseWinnings: baseWinnings,
        bonusWinnings: nftBonusDetails.bonusWinnings,
        finalWinnings: finalWinnings,
        details: nftBonusDetails,
        applied: nftBonusDetails.applied
      },
      nafflesIntegration: {
        sessionId: nafflesSessionId,
        nftDataReceived: !!nftData,
        nftBonusActive: nftBonusDetails.applied
      },
      statistics: cascadeStats,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      result: spinResult
    });
    
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Game status endpoint
router.get('/status/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId) {
      return res.status(400).json({
        success: false,
        error: 'Game ID is required'
      });
    }
    
    // For now, return basic status - in production this would check actual game state
    res.json({
      success: true,
      gameId,
      status: 'active',
      gameType: 'cryptoReels',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh NFT data endpoint for active sessions
router.post('/refresh-nft', async (req, res) => {
  try {
    const { playerId, gameType = 'cryptoReels', nafflesSessionToken } = req.body;
    
    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: 'Player ID is required'
      });
    }

    if (!nafflesSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Naffles session token is required'
      });
    }

    try {
      // Call Naffles API to refresh NFT data
      const nafflesResponse = await fetch(`${process.env.NAFFLES_API_URL || 'http://localhost:3001'}/api/wagering/refresh-player-nfts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nafflesSessionToken}`
        },
        body: JSON.stringify({
          playerId,
          gameType
        })
      });

      if (nafflesResponse.ok) {
        const refreshedData = await nafflesResponse.json();
        
        res.json({
          success: true,
          nftData: {
            hasEligibleNFTs: refreshedData.data.hasEligibleNFTs,
            eligibleNFTs: refreshedData.data.eligibleNFTs,
            totalMultiplier: refreshedData.data.totalMultiplier,
            refreshedAt: refreshedData.data.refreshedAt
          },
          message: 'NFT data refreshed successfully'
        });
      } else {
        throw new Error('Failed to refresh NFT data from Naffles');
      }
    } catch (nafflesError) {
      console.error('Failed to refresh NFT data:', nafflesError);
      res.status(503).json({
        success: false,
        error: 'Unable to refresh NFT data from Naffles platform',
        details: nafflesError.message
      });
    }
  } catch (error) {
    console.error('NFT refresh error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get game configuration endpoint
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        gameType: 'cryptoReels',
        reelCount: 6,
        minReelHeight: 2,
        maxReelHeight: 7,
        maxWaysToWin: slotEngine.maxWaysToWin,
        symbols: slotEngine.symbolConfig.getAllSymbolIds(),
        payoutTable: slotEngine.getPayoutTable(),
        cascadeMultipliers: cascadingService.getCascadeMultipliers(),
        maxCascades: cascadingService.getMaxCascades(),
        nftIntegration: {
          enabled: true,
          source: 'naffles',
          bonusType: 'multiplicative',
          refreshSupported: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test spin endpoint (for development/testing)
router.post('/test-spin', async (req, res) => {
  try {
    const { betAmount = 100 } = req.body;
    
    // Generate a test VRF number
    const testVrfNumber = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // Use the regular spin logic with test VRF
    const testGameId = `test_game_${Date.now()}`;
    
    // Generate initial reel configuration
    const reelConfig = slotEngine.generateReelConfiguration(testVrfNumber);
    const populatedReels = slotEngine.populateReels(testVrfNumber, reelConfig);
    const waysToWin = slotEngine.calculateWaysToWin(populatedReels);
    
    // Process cascading reels
    const cascadeResult = cascadingService.processCascadingReels(
      populatedReels, 
      testVrfNumber, 
      betAmount
    );
    
    const cascadeStats = cascadingService.calculateCascadeStatistics(cascadeResult);
    
    res.json({
      success: true,
      testMode: true,
      vrfNumber: testVrfNumber,
      result: {
        gameId: testGameId,
        betAmount,
        waysToWin,
        initialReels: populatedReels,
        cascadeResult: {
          totalCascades: cascadeResult.totalCascades,
          totalWinnings: cascadeResult.totalWinnings,
          maxMultiplierReached: cascadeResult.maxMultiplierReached,
          cascades: cascadeResult.cascades,
          finalReelState: cascadeResult.finalReelState
        },
        statistics: cascadeStats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Test spin error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;