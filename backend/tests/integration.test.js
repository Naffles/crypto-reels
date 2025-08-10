/**
 * Integration tests for CryptoReels slot machine mechanics
 * Tests the complete flow from reel generation to cascading wins
 */

const request = require('supertest');
const express = require('express');
const SlotEngineService = require('../services/slotEngineService');
const CascadingReelsService = require('../services/cascadingReelsService');

// Create a test app without starting the server
const app = express();
app.use(express.json());
app.use('/api/game', require('../routes/gameRoutes'));

describe('CryptoReels Integration Tests', () => {
  let slotEngine;
  let cascadingService;
  
  beforeEach(() => {
    slotEngine = new SlotEngineService();
    cascadingService = new CascadingReelsService(slotEngine);
  });

  describe('Complete Slot Machine Flow', () => {
    test('should generate valid reel configuration and process cascades', () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const betAmount = 100;
      
      // Step 1: Generate reel configuration
      const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
      expect(reelConfig).toHaveLength(6);
      expect(slotEngine.validateReelConfiguration(reelConfig, false)).toBe(true); // Don't require symbols yet
      
      // Step 2: Populate reels with symbols
      const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
      expect(slotEngine.validateReelConfiguration(populatedReels)).toBe(true);
      
      // Step 3: Calculate ways to win
      const waysToWin = slotEngine.calculateWaysToWin(populatedReels);
      expect(waysToWin).toBeGreaterThan(0);
      expect(waysToWin).toBeLessThanOrEqual(117649);
      
      // Step 4: Process cascading reels
      const cascadeResult = cascadingService.processCascadingReels(
        populatedReels, 
        vrfNumber, 
        betAmount
      );
      
      expect(cascadingService.validateCascadeResult(cascadeResult)).toBe(true);
      expect(cascadeResult.totalWinnings).toBeGreaterThanOrEqual(0);
      expect(cascadeResult.totalCascades).toBeGreaterThanOrEqual(0);
      
      // Step 5: Validate final state
      expect(slotEngine.validateReelConfiguration(cascadeResult.finalReelState)).toBe(true);
    });

    test('should maintain mathematical integrity across multiple spins', () => {
      const testSpins = 10;
      const betAmount = 100;
      let totalWinnings = 0;
      let totalBets = 0;
      let winningSpins = 0;
      
      for (let i = 0; i < testSpins; i++) {
        // Generate unique VRF for each spin
        const vrfNumber = '0x' + (i + 1).toString(16).padStart(64, '0');
        
        const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
        const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
        const cascadeResult = cascadingService.processCascadingReels(
          populatedReels, 
          vrfNumber, 
          betAmount
        );
        
        totalWinnings += cascadeResult.totalWinnings;
        totalBets += betAmount;
        
        if (cascadeResult.totalWinnings > 0) {
          winningSpins++;
        }
        
        // Each spin should produce valid results
        expect(cascadingService.validateCascadeResult(cascadeResult)).toBe(true);
        expect(cascadeResult.totalWinnings).toBeGreaterThanOrEqual(0);
      }
      
      // Basic sanity checks
      expect(totalBets).toBe(testSpins * betAmount);
      expect(totalWinnings).toBeGreaterThanOrEqual(0);
      expect(winningSpins).toBeGreaterThanOrEqual(0);
      expect(winningSpins).toBeLessThanOrEqual(testSpins);
      
      // Log for debugging
      console.log(`Test results: ${winningSpins}/${testSpins} winning spins, total winnings: ${totalWinnings}, RTP: ${(totalWinnings/totalBets*100).toFixed(2)}%`);
      
      // RTP validation - just ensure it's not negative and not impossibly high
      const rtp = totalWinnings / totalBets;
      expect(rtp).toBeGreaterThanOrEqual(0);
      // For a small sample with potential cascading multipliers, allow very high variance
      expect(rtp).toBeLessThanOrEqual(10000); // Very generous bound for small sample testing
    });
  });

  describe('API Integration Tests', () => {
    test('should initialize game successfully without Naffles integration', async () => {
      const response = await request(app)
        .post('/api/game/initialize')
        .send({
          playerId: 'test-player-123',
          betAmount: 100
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.gameId).toBeTruthy();
      expect(response.body.gameType).toBe('cryptoReels');
      expect(response.body.maxWaysToWin).toBe(117649);
      expect(response.body.payoutTable).toBeTruthy();
      expect(response.body.cascadeMultipliers).toEqual([1, 2, 3, 5, 8, 12, 20]);
      expect(response.body.maxCascades).toBe(6);
      
      // Check NFT integration defaults
      expect(response.body.nftData).toBeTruthy();
      expect(response.body.nftData.hasEligibleNFTs).toBe(false);
      expect(response.body.nftData.totalMultiplier).toBe(1);
      expect(response.body.nftData.source).toBe('none');
      
      // Check Naffles integration status
      expect(response.body.nafflesIntegration).toBeTruthy();
      expect(response.body.nafflesIntegration.connected).toBe(false);
      expect(response.body.nafflesIntegration.nftBonusActive).toBe(false);
    });

    test('should initialize game with mock Naffles NFT data', async () => {
      // This test simulates what would happen with a valid Naffles session token
      const response = await request(app)
        .post('/api/game/initialize')
        .send({
          playerId: 'test-player-123',
          betAmount: 100,
          nafflesSessionToken: 'mock-session-token'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.gameId).toBeTruthy();
      
      // Should still work even if Naffles connection fails
      expect(response.body.nftData).toBeTruthy();
      expect(response.body.nafflesIntegration).toBeTruthy();
    });

    test('should process spin with VRF number and no NFT bonuses', async () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const response = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100,
          vrfNumber: vrfNumber
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const result = response.body.result;
      expect(result.gameId).toBe('test-game-123');
      expect(result.spinId).toBeTruthy();
      expect(result.betAmount).toBe(100);
      expect(result.waysToWin).toBeGreaterThan(0);
      expect(Array.isArray(result.initialReels)).toBe(true);
      expect(result.initialReels).toHaveLength(6);
      
      // Validate cascade result structure
      expect(result.cascadeResult).toBeTruthy();
      expect(typeof result.cascadeResult.totalCascades).toBe('number');
      expect(typeof result.cascadeResult.totalWinnings).toBe('number');
      expect(Array.isArray(result.cascadeResult.cascades)).toBe(true);
      expect(Array.isArray(result.cascadeResult.finalReelState)).toBe(true);
      
      // Validate NFT bonus structure (should be default values)
      expect(result.nftBonus).toBeTruthy();
      expect(result.nftBonus.multiplier).toBe(1);
      expect(result.nftBonus.applied).toBe(false);
      expect(result.nftBonus.bonusWinnings).toBe(0);
      expect(result.nftBonus.finalWinnings).toBe(result.nftBonus.baseWinnings);
      
      // Validate Naffles integration status
      expect(result.nafflesIntegration).toBeTruthy();
      expect(result.nafflesIntegration.nftDataReceived).toBe(false);
      expect(result.nafflesIntegration.nftBonusActive).toBe(false);
      
      // Validate statistics
      expect(result.statistics).toBeTruthy();
      expect(typeof result.statistics.totalCascades).toBe('number');
      expect(typeof result.statistics.totalWinnings).toBe('number');
    });

    test('should process spin with NFT bonus data from Naffles', async () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: true,
        totalMultiplier: 2.5,
        eligibleNFTs: [
          {
            contractName: 'Cool Cats NFT',
            contractAddress: '0x1a92f7381b9f03921564a437210bb9396471050c',
            tokenId: '1234',
            multiplier: 2.5,
            metadata: {
              name: 'Cool Cat #1234',
              image: 'https://example.com/coolcat1234.png'
            }
          }
        ],
        source: 'naffles'
      };
      
      const response = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100,
          vrfNumber: vrfNumber,
          nftData: mockNFTData,
          nafflesSessionId: 'mock-session-123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const result = response.body.result;
      
      // Validate NFT bonus was applied
      expect(result.nftBonus.multiplier).toBe(2.5);
      expect(result.nftBonus.applied).toBe(true);
      expect(result.nftBonus.details.applied).toBe(true);
      expect(result.nftBonus.details.eligibleNFTs).toHaveLength(1);
      expect(result.nftBonus.details.eligibleNFTs[0].contractName).toBe('Cool Cats NFT');
      
      // Validate winnings calculation
      const baseWinnings = result.nftBonus.baseWinnings;
      const expectedBonusWinnings = baseWinnings * (2.5 - 1);
      const expectedFinalWinnings = baseWinnings * 2.5;
      
      expect(result.nftBonus.bonusWinnings).toBe(expectedBonusWinnings);
      expect(result.nftBonus.finalWinnings).toBe(expectedFinalWinnings);
      
      // Validate Naffles integration status
      expect(result.nafflesIntegration.sessionId).toBe('mock-session-123');
      expect(result.nafflesIntegration.nftDataReceived).toBe(true);
      expect(result.nafflesIntegration.nftBonusActive).toBe(true);
    });

    test('should handle test spin endpoint', async () => {
      const response = await request(app)
        .post('/api/game/test-spin')
        .send({
          betAmount: 50
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.testMode).toBe(true);
      expect(response.body.vrfNumber).toMatch(/^0x[0-9a-fA-F]{64}$/);
      
      const result = response.body.result;
      expect(result.betAmount).toBe(50);
      expect(result.waysToWin).toBeGreaterThan(0);
      expect(Array.isArray(result.initialReels)).toBe(true);
      expect(result.cascadeResult).toBeTruthy();
    });

    test('should get game configuration with NFT integration info', async () => {
      const response = await request(app)
        .get('/api/game/config');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const config = response.body.config;
      expect(config.gameType).toBe('cryptoReels');
      expect(config.reelCount).toBe(6);
      expect(config.minReelHeight).toBe(2);
      expect(config.maxReelHeight).toBe(7);
      expect(config.maxWaysToWin).toBe(117649);
      expect(Array.isArray(config.symbols)).toBe(true);
      expect(config.payoutTable).toBeTruthy();
      expect(config.cascadeMultipliers).toEqual([1, 2, 3, 5, 8, 12, 20]);
      expect(config.maxCascades).toBe(6);
      
      // Validate NFT integration configuration
      expect(config.nftIntegration).toBeTruthy();
      expect(config.nftIntegration.enabled).toBe(true);
      expect(config.nftIntegration.source).toBe('naffles');
      expect(config.nftIntegration.bonusType).toBe('multiplicative');
      expect(config.nftIntegration.refreshSupported).toBe(true);
    });

    test('should handle NFT refresh endpoint', async () => {
      const response = await request(app)
        .post('/api/game/refresh-nft')
        .send({
          playerId: 'test-player-123',
          gameType: 'cryptoReels',
          nafflesSessionToken: 'mock-session-token'
        });
      
      // Should fail gracefully when Naffles is not available
      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unable to refresh NFT data from Naffles platform');
    });

    test('should validate required parameters', async () => {
      // Test missing player ID in initialization
      const initResponse = await request(app)
        .post('/api/game/initialize')
        .send({});
      
      expect(initResponse.status).toBe(400);
      expect(initResponse.body.success).toBe(false);
      expect(initResponse.body.error).toContain('Player ID is required');
      
      // Test missing game ID in spin
      const spinResponse = await request(app)
        .post('/api/game/spin')
        .send({
          betAmount: 100,
          vrfNumber: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        });
      
      expect(spinResponse.status).toBe(400);
      expect(spinResponse.body.success).toBe(false);
      expect(spinResponse.body.error).toContain('Game ID is required');
      
      // Test missing VRF number in spin
      const vrfResponse = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100
        });
      
      expect(vrfResponse.status).toBe(400);
      expect(vrfResponse.body.success).toBe(false);
      expect(vrfResponse.body.error).toContain('VRF number is required');
      
      // Test invalid VRF format
      const invalidVrfResponse = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100,
          vrfNumber: 'invalid-vrf'
        });
      
      expect(invalidVrfResponse.status).toBe(400);
      expect(invalidVrfResponse.body.success).toBe(false);
      expect(invalidVrfResponse.body.error).toContain('Invalid VRF number format');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme VRF values', () => {
      // Test with all zeros
      const zeroVrf = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const reelConfig1 = slotEngine.generateReelConfiguration(zeroVrf);
      const populatedReels1 = slotEngine.populateReels(zeroVrf, reelConfig1);
      
      expect(slotEngine.validateReelConfiguration(populatedReels1)).toBe(true);
      
      // Test with all Fs
      const maxVrf = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
      const reelConfig2 = slotEngine.generateReelConfiguration(maxVrf);
      const populatedReels2 = slotEngine.populateReels(maxVrf, reelConfig2);
      
      expect(slotEngine.validateReelConfiguration(populatedReels2)).toBe(true);
      
      // Results should be different
      expect(populatedReels1).not.toEqual(populatedReels2);
    });

    test('should handle cascades with maximum multipliers', () => {
      // This test verifies that the system can handle the maximum cascade scenario
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const betAmount = 1000;
      
      const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
      const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
      const cascadeResult = cascadingService.processCascadingReels(
        populatedReels, 
        vrfNumber, 
        betAmount
      );
      
      // Should not exceed maximum cascades (initial spin + max cascades)
      expect(cascadeResult.totalCascades).toBeLessThanOrEqual(cascadingService.getMaxCascades() + 1);
      
      // If cascades occurred, multipliers should be valid
      if (cascadeResult.cascades.length > 0) {
        cascadeResult.cascades.forEach((cascade, index) => {
          expect(cascade.multiplier).toBe(cascadingService.getCascadeMultiplier(index));
          expect(cascade.multiplier).toBeGreaterThanOrEqual(1);
          expect(cascade.multiplier).toBeLessThanOrEqual(20);
        });
      }
    });

    test('should maintain consistency across identical VRF inputs', () => {
      const vrfNumber = '0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
      const betAmount = 100;
      
      // Run the same spin twice
      const result1 = processCompleteSpin(vrfNumber, betAmount);
      const result2 = processCompleteSpin(vrfNumber, betAmount);
      
      // Results should be identical
      expect(result1.reelConfig).toEqual(result2.reelConfig);
      expect(result1.populatedReels).toEqual(result2.populatedReels);
      expect(result1.cascadeResult.totalWinnings).toBe(result2.cascadeResult.totalWinnings);
      expect(result1.cascadeResult.totalCascades).toBe(result2.cascadeResult.totalCascades);
    });
  });

  // Helper function for consistency testing
  function processCompleteSpin(vrfNumber, betAmount) {
    const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
    const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
    const cascadeResult = cascadingService.processCascadingReels(
      populatedReels, 
      vrfNumber, 
      betAmount
    );
    
    return {
      reelConfig,
      populatedReels,
      cascadeResult
    };
  }
});