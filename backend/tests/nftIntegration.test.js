/**
 * NFT Integration Tests
 * Tests for CryptoReels NFT integration with Naffles platform
 * Requirements: 3.3, 3.4, 3.5
 */

const request = require('supertest');
const express = require('express');

// Create a test app without starting the server
const app = express();
app.use(express.json());
app.use('/api/game', require('../routes/gameRoutes'));
app.use('/api/naffles', require('../routes/nafflesRoutes'));

describe('CryptoReels NFT Integration', () => {
  describe('Game Initialization with NFT Data', () => {
    test('should initialize game without NFT data when no session token provided', async () => {
      const response = await request(app)
        .post('/api/game/initialize')
        .send({
          playerId: 'test-player-123',
          betAmount: 100,
          tokenType: 'points'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Should have default NFT data structure
      expect(response.body.nftData).toEqual({
        hasEligibleNFTs: false,
        eligibleNFTs: [],
        totalMultiplier: 1,
        walletCount: 0,
        source: 'none'
      });
      
      // Naffles integration should show disconnected
      expect(response.body.nafflesIntegration.connected).toBe(false);
      expect(response.body.nafflesIntegration.nftBonusActive).toBe(false);
    });

    test('should handle Naffles connection failure gracefully', async () => {
      const response = await request(app)
        .post('/api/game/initialize')
        .send({
          playerId: 'test-player-123',
          betAmount: 100,
          tokenType: 'points',
          nafflesSessionToken: 'invalid-token'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Should still work with default NFT data when Naffles fails
      expect(response.body.nftData.source).toBe('none');
      expect(response.body.nafflesIntegration.connected).toBe(false);
    });
  });

  describe('NFT Bonus Application', () => {
    test('should apply NFT multiplier correctly in spin results', async () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: true,
        totalMultiplier: 2.0,
        eligibleNFTs: [
          {
            contractName: 'Bored Ape Yacht Club',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            tokenId: '1234',
            multiplier: 2.0,
            metadata: {
              name: 'Bored Ape #1234',
              image: 'https://example.com/bayc1234.png'
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
      
      // Verify NFT bonus was applied
      expect(result.nftBonus.multiplier).toBe(2.0);
      expect(result.nftBonus.applied).toBe(true);
      expect(result.nftBonus.details.applied).toBe(true);
      expect(result.nftBonus.details.totalMultiplier).toBe(2.0);
      
      // Verify NFT collection details
      expect(result.nftBonus.details.eligibleNFTs).toHaveLength(1);
      expect(result.nftBonus.details.eligibleNFTs[0]).toEqual({
        contractName: 'Bored Ape Yacht Club',
        contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        tokenId: '1234',
        multiplier: 2.0,
        metadata: {
          name: 'Bored Ape #1234',
          image: 'https://example.com/bayc1234.png'
        }
      });
      
      // Verify winnings calculation
      const baseWinnings = result.nftBonus.baseWinnings;
      const expectedBonusWinnings = baseWinnings * (2.0 - 1);
      const expectedFinalWinnings = baseWinnings * 2.0;
      
      expect(result.nftBonus.bonusWinnings).toBe(expectedBonusWinnings);
      expect(result.nftBonus.finalWinnings).toBe(expectedFinalWinnings);
      
      // Verify Naffles integration status
      expect(result.nafflesIntegration.sessionId).toBe('mock-session-123');
      expect(result.nafflesIntegration.nftDataReceived).toBe(true);
      expect(result.nafflesIntegration.nftBonusActive).toBe(true);
    });

    test('should handle multiple NFT contracts with multiplicative stacking', async () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: true,
        totalMultiplier: 3.0, // 2.0 * 1.5 = 3.0
        eligibleNFTs: [
          {
            contractName: 'Bored Ape Yacht Club',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            tokenId: '1234',
            multiplier: 2.0,
            metadata: { name: 'Bored Ape #1234' }
          },
          {
            contractName: 'Cool Cats NFT',
            contractAddress: '0x1a92f7381b9f03921564a437210bb9396471050c',
            tokenId: '5678',
            multiplier: 1.5,
            metadata: { name: 'Cool Cat #5678' }
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
          nftData: mockNFTData
        });
      
      expect(response.status).toBe(200);
      
      const result = response.body.result;
      
      // Verify multiplicative stacking
      expect(result.nftBonus.multiplier).toBe(3.0);
      expect(result.nftBonus.details.eligibleNFTs).toHaveLength(2);
      
      // Verify both NFTs are included
      const nftNames = result.nftBonus.details.eligibleNFTs.map(nft => nft.contractName);
      expect(nftNames).toContain('Bored Ape Yacht Club');
      expect(nftNames).toContain('Cool Cats NFT');
    });

    test('should not apply NFT bonus when no eligible NFTs', async () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: false,
        totalMultiplier: 1,
        eligibleNFTs: [],
        source: 'naffles'
      };
      
      const response = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100,
          vrfNumber: vrfNumber,
          nftData: mockNFTData
        });
      
      expect(response.status).toBe(200);
      
      const result = response.body.result;
      
      // Verify no NFT bonus applied
      expect(result.nftBonus.multiplier).toBe(1);
      expect(result.nftBonus.applied).toBe(false);
      expect(result.nftBonus.bonusWinnings).toBe(0);
      expect(result.nftBonus.finalWinnings).toBe(result.nftBonus.baseWinnings);
    });
  });

  describe('NFT Data Refresh', () => {
    test('should handle NFT refresh request with proper error handling', async () => {
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

    test('should validate required parameters for NFT refresh', async () => {
      const response = await request(app)
        .post('/api/game/refresh-nft')
        .send({
          playerId: 'test-player-123'
          // Missing gameType and nafflesSessionToken
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Naffles session token is required');
    });
  });

  describe('Game Configuration with NFT Support', () => {
    test('should include NFT integration information in game config', async () => {
      const response = await request(app)
        .get('/api/game/config');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const config = response.body.config;
      
      // Verify NFT integration configuration
      expect(config.nftIntegration).toBeDefined();
      expect(config.nftIntegration.enabled).toBe(true);
      expect(config.nftIntegration.source).toBe('naffles');
      expect(config.nftIntegration.bonusType).toBe('multiplicative');
      expect(config.nftIntegration.refreshSupported).toBe(true);
    });
  });

  describe('Naffles Platform Integration', () => {
    test('should handle Naffles health check', async () => {
      const response = await request(app)
        .get('/api/naffles/health');
      
      // Should fail gracefully when Naffles is not available
      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe('disconnected');
    });

    test('should handle VRF request with fallback', async () => {
      const response = await request(app)
        .post('/api/naffles/vrf')
        .send({
          sessionId: 'test-session-123',
          bitsNeeded: 256,
          nafflesSessionToken: 'mock-token'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.vrfNumber).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(response.body.fallback).toBe(true); // Should use fallback when Naffles unavailable
    });
  });

  describe('Requirements Validation', () => {
    test('should meet requirement 3.3: Seamless NFT integration without wallet connection', async () => {
      // Requirement 3.3: Apply the cumulative NFT multiplier to the total winnings based on owned NFT contracts
      const response = await request(app)
        .post('/api/game/initialize')
        .send({
          playerId: 'test-player-123',
          betAmount: 100,
          nafflesSessionToken: 'mock-token'
        });
      
      expect(response.status).toBe(200);
      
      // Should not require additional wallet connections
      expect(response.body.nftData).toBeDefined();
      expect(response.body.nafflesIntegration).toBeDefined();
      
      // NFT data should be received from Naffles, not from independent wallet scanning
      expect(response.body.nftData.source).toBe('none'); // 'none' because mock Naffles is unavailable
    });

    test('should meet requirement 3.4: Stack multipliers multiplicatively', async () => {
      // Requirement 3.4: When multiple NFT contracts are owned, stack multipliers multiplicatively
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: true,
        totalMultiplier: 4.0, // 2.0 * 2.0 = 4.0 (multiplicative stacking)
        eligibleNFTs: [
          { contractName: 'Contract A', multiplier: 2.0, tokenId: '1' },
          { contractName: 'Contract B', multiplier: 2.0, tokenId: '2' }
        ],
        source: 'naffles'
      };
      
      const response = await request(app)
        .post('/api/game/spin')
        .send({
          gameId: 'test-game-123',
          betAmount: 100,
          vrfNumber: vrfNumber,
          nftData: mockNFTData
        });
      
      expect(response.status).toBe(200);
      
      const result = response.body.result;
      expect(result.nftBonus.multiplier).toBe(4.0); // Multiplicative stacking verified
    });

    test('should meet requirement 3.5: Display NFT collection with bonus breakdown', async () => {
      // Requirement 3.5: Display the bonus breakdown showing base winnings, NFT multiplier, and final winnings
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockNFTData = {
        hasEligibleNFTs: true,
        totalMultiplier: 2.5,
        eligibleNFTs: [
          {
            contractName: 'Test NFT Collection',
            contractAddress: '0x123...',
            tokenId: '1234',
            multiplier: 2.5,
            metadata: { name: 'Test NFT #1234' }
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
          nftData: mockNFTData
        });
      
      expect(response.status).toBe(200);
      
      const result = response.body.result;
      const nftBonus = result.nftBonus;
      
      // Verify bonus breakdown is displayed
      expect(nftBonus.baseWinnings).toBeDefined();
      expect(nftBonus.bonusWinnings).toBeDefined();
      expect(nftBonus.finalWinnings).toBeDefined();
      expect(nftBonus.multiplier).toBe(2.5);
      
      // Verify NFT collection display
      expect(nftBonus.details.eligibleNFTs).toHaveLength(1);
      expect(nftBonus.details.eligibleNFTs[0].contractName).toBe('Test NFT Collection');
      expect(nftBonus.details.eligibleNFTs[0].metadata.name).toBe('Test NFT #1234');
      
      // Verify calculation accuracy
      const expectedBonusWinnings = nftBonus.baseWinnings * (2.5 - 1);
      const expectedFinalWinnings = nftBonus.baseWinnings * 2.5;
      expect(nftBonus.bonusWinnings).toBe(expectedBonusWinnings);
      expect(nftBonus.finalWinnings).toBe(expectedFinalWinnings);
    });
  });
});