/**
 * Test suite for SlotEngineService
 * Tests the 6-reel Megaways slot engine mechanics
 */

const SlotEngineService = require('../services/slotEngineService');

describe('SlotEngineService', () => {
  let slotEngine;
  
  beforeEach(() => {
    slotEngine = new SlotEngineService();
  });

  describe('Reel Configuration Generation', () => {
    test('should generate 6 reels with dynamic heights (2-7 symbols)', () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
      
      expect(reelConfig).toHaveLength(6);
      
      reelConfig.forEach((reel, index) => {
        expect(reel.reelIndex).toBe(index);
        expect(reel.height).toBeGreaterThanOrEqual(2);
        expect(reel.height).toBeLessThanOrEqual(7);
        expect(Array.isArray(reel.symbols)).toBe(true);
        expect(reel.symbols).toHaveLength(0); // Should be empty before population
      });
    });

    test('should generate different reel heights with different VRF numbers', () => {
      const vrfNumber1 = '0x1111111111111111111111111111111111111111111111111111111111111111';
      const vrfNumber2 = '0x2222222222222222222222222222222222222222222222222222222222222222';
      
      const config1 = slotEngine.generateReelConfiguration(vrfNumber1);
      const config2 = slotEngine.generateReelConfiguration(vrfNumber2);
      
      // Configurations should be different (very high probability)
      const heights1 = config1.map(reel => reel.height);
      const heights2 = config2.map(reel => reel.height);
      
      expect(heights1).not.toEqual(heights2);
    });
  });

  describe('Symbol Population', () => {
    test('should populate reels with correct number of symbols', () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const reelConfig = slotEngine.generateReelConfiguration(vrfNumber);
      const populatedReels = slotEngine.populateReels(vrfNumber, reelConfig);
      
      expect(populatedReels).toHaveLength(6);
      
      populatedReels.forEach((reel, index) => {
        expect(reel.symbols).toHaveLength(reel.height);
        expect(reel.reelIndex).toBe(index);
        
        // All symbols should be valid
        reel.symbols.forEach(symbol => {
          expect(slotEngine.getSymbolInfo(symbol)).toBeTruthy();
        });
      });
    });

    test('should generate different symbol combinations with different VRF numbers', () => {
      const vrfNumber1 = '0x1111111111111111111111111111111111111111111111111111111111111111';
      const vrfNumber2 = '0x2222222222222222222222222222222222222222222222222222222222222222';
      
      const config1 = slotEngine.generateReelConfiguration(vrfNumber1);
      const config2 = slotEngine.generateReelConfiguration(vrfNumber2);
      
      const populated1 = slotEngine.populateReels(vrfNumber1, config1);
      const populated2 = slotEngine.populateReels(vrfNumber2, config2);
      
      // Symbol combinations should be different
      const symbols1 = populated1.map(reel => reel.symbols.join(','));
      const symbols2 = populated2.map(reel => reel.symbols.join(','));
      
      expect(symbols1).not.toEqual(symbols2);
    });
  });

  describe('Ways to Win Calculation', () => {
    test('should calculate correct ways to win for different reel heights', () => {
      // Test with known reel heights
      const testReels = [
        { height: 2, symbols: ['btc', 'eth'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 4, symbols: ['btc', 'eth', 'sol', 'nft_common'] },
        { height: 5, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token'] },
        { height: 6, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token', 'blockchain'] },
        { height: 7, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token', 'blockchain', 'wallet'] }
      ];
      
      const waysToWin = slotEngine.calculateWaysToWin(testReels);
      const expectedWays = 2 * 3 * 4 * 5 * 6 * 7; // 2520
      
      expect(waysToWin).toBe(expectedWays);
    });

    test('should not exceed maximum ways to win (117,649)', () => {
      // Test with maximum reel heights (7x7x7x7x7x7 = 117,649)
      const maxReels = Array(6).fill().map(() => ({
        height: 7,
        symbols: Array(7).fill('btc')
      }));
      
      const waysToWin = slotEngine.calculateWaysToWin(maxReels);
      expect(waysToWin).toBe(117649);
    });
  });

  describe('Winning Combinations', () => {
    test('should identify winning combinations correctly', () => {
      // Create a test scenario with known winning combination
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'defi_token', 'nft_common'] },
        { height: 3, symbols: ['btc', 'blockchain', 'wallet'] },
        { height: 3, symbols: ['diamond_hands', 'eth', 'sol'] },
        { height: 3, symbols: ['nft_common', 'defi_token', 'blockchain'] },
        { height: 3, symbols: ['wallet', 'diamond_hands', 'scatter'] }
      ];
      
      const winResult = slotEngine.calculateWinningCombinations(testReels);
      
      expect(winResult.hasWins).toBe(true);
      expect(winResult.combinations.length).toBeGreaterThan(0);
      
      // Should find BTC combination (3 reels)
      const btcWin = winResult.combinations.find(combo => combo.symbol === 'btc');
      expect(btcWin).toBeTruthy();
      expect(btcWin.length).toBe(3);
      expect(btcWin.basePayout).toBe(5); // 3 BTC payout
    });

    test('should handle wild symbols correctly', () => {
      // Test with wild symbols
      const testReels = [
        { height: 2, symbols: ['btc', 'eth'] },
        { height: 2, symbols: ['wild', 'defi_token'] },
        { height: 2, symbols: ['btc', 'blockchain'] },
        { height: 2, symbols: ['diamond_hands', 'eth'] },
        { height: 2, symbols: ['nft_common', 'defi_token'] },
        { height: 2, symbols: ['wallet', 'diamond_hands'] }
      ];
      
      const winResult = slotEngine.calculateWinningCombinations(testReels);
      
      // Should find BTC combination with wild substitution
      const btcWin = winResult.combinations.find(combo => combo.symbol === 'btc');
      expect(btcWin).toBeTruthy();
      expect(btcWin.length).toBe(3); // BTC + Wild + BTC
    });

    test('should require minimum 3 symbols for winning combination', () => {
      // Test with only 2 matching symbols
      const testReels = [
        { height: 2, symbols: ['btc', 'eth'] },
        { height: 2, symbols: ['btc', 'defi_token'] },
        { height: 2, symbols: ['sol', 'blockchain'] }, // No BTC here
        { height: 2, symbols: ['diamond_hands', 'eth'] },
        { height: 2, symbols: ['nft_common', 'defi_token'] },
        { height: 2, symbols: ['wallet', 'diamond_hands'] }
      ];
      
      const winResult = slotEngine.calculateWinningCombinations(testReels);
      
      // Should not find BTC combination (only 2 reels)
      const btcWin = winResult.combinations.find(combo => combo.symbol === 'btc');
      expect(btcWin).toBeFalsy();
    });
  });

  describe('Payout Calculations', () => {
    test('should calculate correct payouts for different symbol combinations', () => {
      expect(slotEngine.calculateSymbolPayout('btc', 3)).toBe(5);
      expect(slotEngine.calculateSymbolPayout('btc', 4)).toBe(25);
      expect(slotEngine.calculateSymbolPayout('btc', 5)).toBe(100);
      expect(slotEngine.calculateSymbolPayout('btc', 6)).toBe(500);
      
      expect(slotEngine.calculateSymbolPayout('eth', 3)).toBe(4);
      expect(slotEngine.calculateSymbolPayout('diamond_hands', 6)).toBe(50);
    });

    test('should return 0 for invalid symbol combinations', () => {
      expect(slotEngine.calculateSymbolPayout('btc', 2)).toBe(0); // Less than 3
      expect(slotEngine.calculateSymbolPayout('invalid_symbol', 3)).toBe(0);
      expect(slotEngine.calculateSymbolPayout('btc', 7)).toBe(0); // More than 6
    });

    test('should calculate total payout correctly', () => {
      const winningCombinations = [
        { symbol: 'btc', length: 3, basePayout: 5, waysCount: 2 },
        { symbol: 'eth', length: 4, basePayout: 20, waysCount: 1 }
      ];
      
      const totalPayout = slotEngine.calculateTotalPayout(winningCombinations, 1);
      const expectedPayout = (5 * 1) + (20 * 1); // 5 + 20 = 25 (no longer multiply by ways)
      
      expect(totalPayout).toBe(expectedPayout);
    });
  });

  describe('Bit Extraction', () => {
    test('should extract bits correctly from VRF number', () => {
      const vrfNumber = '0xFF'; // 11111111 in binary
      
      // Extract first 3 bits (should be 7 = 111)
      const bits1 = slotEngine.extractBits(vrfNumber, 0, 3);
      expect(bits1).toBe(7);
      
      // Extract next 3 bits (should be 7 = 111)
      const bits2 = slotEngine.extractBits(vrfNumber, 3, 3);
      expect(bits2).toBe(7);
      
      // Extract last 2 bits (should be 3 = 11)
      const bits3 = slotEngine.extractBits(vrfNumber, 6, 2);
      expect(bits3).toBe(3);
    });

    test('should handle large VRF numbers', () => {
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Should not throw error and return valid numbers
      const bits1 = slotEngine.extractBits(vrfNumber, 0, 8);
      const bits2 = slotEngine.extractBits(vrfNumber, 100, 8);
      
      expect(typeof bits1).toBe('number');
      expect(typeof bits2).toBe('number');
      expect(bits1).toBeGreaterThanOrEqual(0);
      expect(bits1).toBeLessThan(256);
      expect(bits2).toBeGreaterThanOrEqual(0);
      expect(bits2).toBeLessThan(256);
    });
  });

  describe('Validation', () => {
    test('should validate reel configuration correctly', () => {
      const validConfig = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 4, symbols: ['btc', 'eth', 'sol', 'nft_common'] },
        { height: 2, symbols: ['btc', 'eth'] },
        { height: 7, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token', 'blockchain', 'wallet'] },
        { height: 5, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token'] },
        { height: 6, symbols: ['btc', 'eth', 'sol', 'nft_common', 'defi_token', 'blockchain'] }
      ];
      
      expect(slotEngine.validateReelConfiguration(validConfig)).toBe(true);
    });

    test('should reject invalid reel configurations', () => {
      // Wrong number of reels
      const invalidConfig1 = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] }
      ];
      expect(slotEngine.validateReelConfiguration(invalidConfig1)).toBe(false);
      
      // Invalid height
      const invalidConfig2 = [
        { height: 1, symbols: ['btc'] }, // Height too low
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] }
      ];
      expect(slotEngine.validateReelConfiguration(invalidConfig2)).toBe(false);
      
      // Mismatched symbols length
      const invalidConfig3 = [
        { height: 3, symbols: ['btc', 'eth'] }, // Should have 3 symbols
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'sol'] }
      ];
      expect(slotEngine.validateReelConfiguration(invalidConfig3)).toBe(false);
    });
  });

  describe('Symbol Information', () => {
    test('should return correct symbol information', () => {
      const btcInfo = slotEngine.getSymbolInfo('btc');
      expect(btcInfo).toBeTruthy();
      expect(btcInfo.id).toBe('btc');
      expect(btcInfo.value).toBe(100);
      expect(btcInfo.weight).toBe(15);
      
      const wildInfo = slotEngine.getSymbolInfo('wild');
      expect(wildInfo).toBeTruthy();
      expect(wildInfo.type).toBe('wild');
    });

    test('should return null for invalid symbols', () => {
      const invalidInfo = slotEngine.getSymbolInfo('invalid_symbol');
      expect(invalidInfo).toBeNull();
    });

    test('should return complete payout table', () => {
      const payoutTable = slotEngine.getPayoutTable();
      expect(payoutTable).toBeTruthy();
      expect(payoutTable.btc).toBeTruthy();
      expect(payoutTable.btc[6]).toBe(500);
    });
  });
});