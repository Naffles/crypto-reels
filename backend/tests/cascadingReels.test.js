/**
 * Test suite for CascadingReelsService
 * Tests the cascading reels mechanics including symbol removal, drop-down, and multipliers
 */

const SlotEngineService = require('../services/slotEngineService');
const CascadingReelsService = require('../services/cascadingReelsService');

describe('CascadingReelsService', () => {
  let slotEngine;
  let cascadingService;
  
  beforeEach(() => {
    slotEngine = new SlotEngineService();
    cascadingService = new CascadingReelsService(slotEngine);
  });

  describe('Winning Symbol Removal', () => {
    test('should remove winning symbols correctly', () => {
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'defi_token', 'nft_common'] },
        { height: 3, symbols: ['btc', 'blockchain', 'wallet'] },
        { height: 3, symbols: ['diamond_hands', 'eth', 'sol'] },
        { height: 3, symbols: ['nft_common', 'defi_token', 'blockchain'] },
        { height: 3, symbols: ['wallet', 'diamond_hands', 'scatter'] }
      ];
      
      const winningCombinations = [
        {
          symbol: 'btc',
          positions: [
            { reel: 0, position: 0 },
            { reel: 1, position: 0 },
            { reel: 2, position: 0 }
          ]
        }
      ];
      
      const modifiedReels = cascadingService.removeWinningSymbols(testReels, winningCombinations);
      
      // BTC symbols should be removed (marked as null)
      expect(modifiedReels[0].symbols[0]).toBeNull();
      expect(modifiedReels[1].symbols[0]).toBeNull();
      expect(modifiedReels[2].symbols[0]).toBeNull();
      
      // Other symbols should remain unchanged
      expect(modifiedReels[0].symbols[1]).toBe('eth');
      expect(modifiedReels[0].symbols[2]).toBe('sol');
      expect(modifiedReels[1].symbols[1]).toBe('defi_token');
    });

    test('should handle multiple winning combinations', () => {
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'eth', 'nft_common'] },
        { height: 3, symbols: ['btc', 'eth', 'wallet'] },
        { height: 3, symbols: ['diamond_hands', 'defi_token', 'sol'] },
        { height: 3, symbols: ['nft_common', 'blockchain', 'blockchain'] },
        { height: 3, symbols: ['wallet', 'diamond_hands', 'scatter'] }
      ];
      
      const winningCombinations = [
        {
          symbol: 'btc',
          positions: [
            { reel: 0, position: 0 },
            { reel: 1, position: 0 },
            { reel: 2, position: 0 }
          ]
        },
        {
          symbol: 'eth',
          positions: [
            { reel: 0, position: 1 },
            { reel: 1, position: 1 },
            { reel: 2, position: 1 }
          ]
        }
      ];
      
      const modifiedReels = cascadingService.removeWinningSymbols(testReels, winningCombinations);
      
      // Both BTC and ETH symbols should be removed
      expect(modifiedReels[0].symbols[0]).toBeNull(); // BTC
      expect(modifiedReels[0].symbols[1]).toBeNull(); // ETH
      expect(modifiedReels[1].symbols[0]).toBeNull(); // BTC
      expect(modifiedReels[1].symbols[1]).toBeNull(); // ETH
      expect(modifiedReels[2].symbols[0]).toBeNull(); // BTC
      expect(modifiedReels[2].symbols[1]).toBeNull(); // ETH
      
      // Remaining symbols should be unchanged
      expect(modifiedReels[0].symbols[2]).toBe('sol');
      expect(modifiedReels[1].symbols[2]).toBe('nft_common');
      expect(modifiedReels[2].symbols[2]).toBe('wallet');
    });
  });

  describe('Symbol Drop-Down Mechanics', () => {
    test('should drop symbols down correctly', () => {
      const testReels = [
        { height: 4, symbols: [null, 'eth', null, 'sol'] }, // Top and middle removed
        { height: 3, symbols: ['btc', null, 'nft_common'] }, // Middle removed
        { height: 3, symbols: [null, null, 'wallet'] } // Top two removed
      ];
      
      const droppedReels = cascadingService.dropSymbolsDown(testReels);
      
      // First reel: eth and sol should drop to bottom, nulls at top
      expect(droppedReels[0].symbols).toEqual([null, null, 'eth', 'sol']);
      
      // Second reel: btc and nft_common should drop to bottom, null at top
      expect(droppedReels[1].symbols).toEqual([null, 'btc', 'nft_common']);
      
      // Third reel: wallet should drop to bottom, nulls at top
      expect(droppedReels[2].symbols).toEqual([null, null, 'wallet']);
    });

    test('should handle reels with no removed symbols', () => {
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['defi_token', 'nft_common', 'blockchain'] }
      ];
      
      const droppedReels = cascadingService.dropSymbolsDown(testReels);
      
      // Symbols should remain unchanged
      expect(droppedReels[0].symbols).toEqual(['btc', 'eth', 'sol']);
      expect(droppedReels[1].symbols).toEqual(['defi_token', 'nft_common', 'blockchain']);
    });

    test('should handle reels with all symbols removed', () => {
      const testReels = [
        { height: 3, symbols: [null, null, null] }
      ];
      
      const droppedReels = cascadingService.dropSymbolsDown(testReels);
      
      // All positions should remain null
      expect(droppedReels[0].symbols).toEqual([null, null, null]);
    });
  });

  describe('New Symbol Generation', () => {
    test('should generate new symbols for empty positions', () => {
      const testReels = [
        { height: 3, symbols: [null, null, 'sol'] },
        { height: 3, symbols: [null, 'eth', 'nft_common'] }
      ];
      
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const vrfOffset = 0;
      
      const newReels = cascadingService.generateNewSymbols(testReels, vrfNumber, vrfOffset);
      
      // Null positions should be filled with new symbols
      expect(newReels[0].symbols[0]).not.toBeNull();
      expect(newReels[0].symbols[1]).not.toBeNull();
      expect(newReels[1].symbols[0]).not.toBeNull();
      
      // Existing symbols should remain unchanged
      expect(newReels[0].symbols[2]).toBe('sol');
      expect(newReels[1].symbols[1]).toBe('eth');
      expect(newReels[1].symbols[2]).toBe('nft_common');
      
      // New symbols should be valid
      newReels.forEach(reel => {
        reel.symbols.forEach(symbol => {
          if (symbol !== null) {
            expect(slotEngine.getSymbolInfo(symbol)).toBeTruthy();
          }
        });
      });
    });

    test('should use different VRF offsets for different symbols', () => {
      const testReels = [
        { height: 2, symbols: [null, null] }
      ];
      
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const newReels1 = cascadingService.generateNewSymbols(testReels, vrfNumber, 0);
      const newReels2 = cascadingService.generateNewSymbols(testReels, vrfNumber, 16);
      
      // Different offsets should produce different symbols (high probability)
      const symbols1 = newReels1[0].symbols;
      const symbols2 = newReels2[0].symbols;
      
      expect(symbols1).not.toEqual(symbols2);
    });
  });

  describe('VRF Bits Calculation', () => {
    test('should calculate VRF bits needed correctly', () => {
      const testReels = [
        { height: 3, symbols: [null, 'eth', null] }, // 2 empty positions
        { height: 2, symbols: [null, 'btc'] }, // 1 empty position
        { height: 3, symbols: ['sol', 'nft_common', 'defi_token'] } // 0 empty positions
      ];
      
      const bitsNeeded = cascadingService.calculateVrfBitsNeeded(testReels);
      
      // 3 empty positions * 8 bits per symbol = 24 bits
      expect(bitsNeeded).toBe(24);
    });

    test('should return 0 for reels with no empty positions', () => {
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 2, symbols: ['defi_token', 'nft_common'] }
      ];
      
      const bitsNeeded = cascadingService.calculateVrfBitsNeeded(testReels);
      expect(bitsNeeded).toBe(0);
    });
  });

  describe('Cascade Multipliers', () => {
    test('should return correct multipliers for different levels', () => {
      expect(cascadingService.getCascadeMultiplier(0)).toBe(1);
      expect(cascadingService.getCascadeMultiplier(1)).toBe(2);
      expect(cascadingService.getCascadeMultiplier(2)).toBe(3);
      expect(cascadingService.getCascadeMultiplier(3)).toBe(5);
      expect(cascadingService.getCascadeMultiplier(4)).toBe(8);
      expect(cascadingService.getCascadeMultiplier(5)).toBe(12);
      expect(cascadingService.getCascadeMultiplier(6)).toBe(20);
    });

    test('should cap multiplier at maximum level', () => {
      // Test beyond maximum cascade level
      expect(cascadingService.getCascadeMultiplier(10)).toBe(20);
      expect(cascadingService.getCascadeMultiplier(100)).toBe(20);
    });

    test('should return all multipliers', () => {
      const multipliers = cascadingService.getCascadeMultipliers();
      expect(multipliers).toEqual([1, 2, 3, 5, 8, 12, 20]);
    });
  });

  describe('Single Cascade Step Simulation', () => {
    test('should simulate cascade step correctly', () => {
      const testReels = [
        { height: 3, symbols: ['btc', 'eth', 'sol'] },
        { height: 3, symbols: ['btc', 'defi_token', 'nft_common'] },
        { height: 3, symbols: ['btc', 'blockchain', 'wallet'] },
        { height: 3, symbols: ['diamond_hands', 'eth', 'sol'] },
        { height: 3, symbols: ['nft_common', 'defi_token', 'blockchain'] },
        { height: 3, symbols: ['wallet', 'diamond_hands', 'scatter'] }
      ];
      
      const winningCombinations = [
        {
          symbol: 'btc',
          positions: [
            { reel: 0, position: 0 },
            { reel: 1, position: 0 },
            { reel: 2, position: 0 }
          ]
        }
      ];
      
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const vrfOffset = 0;
      
      const cascadeStep = cascadingService.simulateCascadeStep(
        testReels, 
        winningCombinations, 
        vrfNumber, 
        vrfOffset
      );
      
      expect(cascadeStep.reelState).toBeTruthy();
      expect(Array.isArray(cascadeStep.winningCombinations)).toBe(true);
      expect(typeof cascadeStep.hasWins).toBe('boolean');
      expect(typeof cascadeStep.vrfBitsUsed).toBe('number');
      expect(cascadeStep.vrfBitsUsed).toBe(24); // 3 symbols * 8 bits
      
      // New symbols should be generated in top positions
      expect(cascadeStep.reelState[0].symbols[0]).not.toBe('btc');
      expect(cascadeStep.reelState[1].symbols[0]).not.toBe('btc');
      expect(cascadeStep.reelState[2].symbols[0]).not.toBe('btc');
      
      // Remaining symbols should have dropped down
      expect(cascadeStep.reelState[0].symbols[1]).toBe('eth');
      expect(cascadeStep.reelState[0].symbols[2]).toBe('sol');
    });
  });

  describe('Full Cascading Process', () => {
    test('should process cascading reels with multiple levels', () => {
      // Create a scenario that will likely cascade multiple times
      const testReels = [
        { height: 4, symbols: ['btc', 'btc', 'eth', 'sol'] },
        { height: 4, symbols: ['btc', 'btc', 'eth', 'defi_token'] },
        { height: 4, symbols: ['btc', 'btc', 'eth', 'nft_common'] },
        { height: 4, symbols: ['diamond_hands', 'wild', 'blockchain', 'wallet'] },
        { height: 4, symbols: ['nft_common', 'defi_token', 'blockchain', 'wallet'] },
        { height: 4, symbols: ['wallet', 'diamond_hands', 'scatter', 'btc'] }
      ];
      
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const betAmount = 100;
      
      const cascadeResult = cascadingService.processCascadingReels(testReels, vrfNumber, betAmount);
      
      expect(cascadeResult.cascades).toBeTruthy();
      expect(Array.isArray(cascadeResult.cascades)).toBe(true);
      expect(cascadeResult.totalCascades).toBeGreaterThanOrEqual(0);
      expect(cascadeResult.totalWinnings).toBeGreaterThanOrEqual(0);
      expect(cascadeResult.finalReelState).toBeTruthy();
      
      // If there are cascades, validate their structure
      if (cascadeResult.cascades.length > 0) {
        cascadeResult.cascades.forEach((cascade, index) => {
          expect(cascade.level).toBe(index);
          expect(cascade.multiplier).toBeGreaterThanOrEqual(1);
          expect(cascade.levelPayout).toBeGreaterThanOrEqual(0);
          expect(cascade.totalPayout).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(cascade.reelState)).toBe(true);
          expect(Array.isArray(cascade.winningCombinations)).toBe(true);
        });
        
        // Total payout should be sum of all level payouts
        const sumOfLevelPayouts = cascadeResult.cascades.reduce((sum, cascade) => sum + cascade.levelPayout, 0);
        expect(cascadeResult.totalWinnings).toBe(sumOfLevelPayouts);
      }
    });

    test('should handle reels with no initial wins', () => {
      const testReels = [
        { height: 3, symbols: ['diamond_hands', 'wallet', 'blockchain'] },
        { height: 3, symbols: ['defi_token', 'nft_common', 'sol'] },
        { height: 3, symbols: ['eth', 'btc', 'scatter'] },
        { height: 3, symbols: ['wallet', 'diamond_hands', 'blockchain'] },
        { height: 3, symbols: ['nft_common', 'defi_token', 'sol'] },
        { height: 3, symbols: ['eth', 'btc', 'scatter'] }
      ];
      
      const vrfNumber = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const betAmount = 100;
      
      const cascadeResult = cascadingService.processCascadingReels(testReels, vrfNumber, betAmount);
      
      expect(cascadeResult.cascades).toHaveLength(0);
      expect(cascadeResult.totalCascades).toBe(0);
      expect(cascadeResult.totalWinnings).toBe(0);
      expect(cascadeResult.finalReelState).toEqual(testReels);
    });

    test('should respect maximum cascade limit', () => {
      const maxCascades = cascadingService.getMaxCascades();
      expect(maxCascades).toBe(6);
      
      // Even if we could theoretically cascade more, it should stop at max
      // This is hard to test deterministically, but we can verify the limit exists
      expect(typeof maxCascades).toBe('number');
      expect(maxCascades).toBeGreaterThan(0);
    });
  });

  describe('Cascade Validation', () => {
    test('should validate cascade results correctly', () => {
      const validResult = {
        cascades: [
          {
            level: 0,
            reelState: [{ height: 3, symbols: ['btc', 'eth', 'sol'] }],
            winningCombinations: [],
            multiplier: 1,
            levelPayout: 100,
            totalPayout: 100
          }
        ],
        finalReelState: [{ height: 3, symbols: ['btc', 'eth', 'sol'] }],
        totalCascades: 1,
        totalWinnings: 100
      };
      
      expect(cascadingService.validateCascadeResult(validResult)).toBe(true);
    });

    test('should reject invalid cascade results', () => {
      expect(cascadingService.validateCascadeResult(null)).toBe(false);
      expect(cascadingService.validateCascadeResult({})).toBe(false);
      expect(cascadingService.validateCascadeResult({ cascades: 'not an array' })).toBe(false);
      
      const invalidResult = {
        cascades: [{ level: 1 }], // Missing required fields
        finalReelState: [],
        totalCascades: 1,
        totalWinnings: 100
      };
      
      expect(cascadingService.validateCascadeResult(invalidResult)).toBe(false);
    });
  });

  describe('Cascade Statistics', () => {
    test('should calculate cascade statistics correctly', () => {
      const cascadeResult = {
        cascades: [
          {
            level: 0,
            reelState: [],
            winningCombinations: [{ symbol: 'btc' }, { symbol: 'eth' }],
            multiplier: 1,
            levelPayout: 100,
            totalPayout: 100
          },
          {
            level: 1,
            reelState: [],
            winningCombinations: [{ symbol: 'sol' }],
            multiplier: 2,
            levelPayout: 200,
            totalPayout: 300
          }
        ],
        finalReelState: [],
        totalCascades: 2,
        totalWinnings: 300
      };
      
      const stats = cascadingService.calculateCascadeStatistics(cascadeResult);
      
      expect(stats.totalCascades).toBe(2);
      expect(stats.totalWinnings).toBe(300);
      expect(stats.averageMultiplier).toBe(1.5); // (1 + 2) / 2
      expect(stats.maxMultiplier).toBe(2);
      expect(stats.cascadeBreakdown).toHaveLength(2);
      expect(stats.cascadeBreakdown[0].level).toBe(0);
      expect(stats.cascadeBreakdown[0].winCount).toBe(2);
      expect(stats.cascadeBreakdown[1].level).toBe(1);
      expect(stats.cascadeBreakdown[1].winCount).toBe(1);
    });

    test('should return null for invalid cascade results', () => {
      const stats = cascadingService.calculateCascadeStatistics(null);
      expect(stats).toBeNull();
    });

    test('should handle empty cascade results', () => {
      const emptyCascadeResult = {
        cascades: [],
        finalReelState: [],
        totalCascades: 0,
        totalWinnings: 0
      };
      
      const stats = cascadingService.calculateCascadeStatistics(emptyCascadeResult);
      
      expect(stats.totalCascades).toBe(0);
      expect(stats.totalWinnings).toBe(0);
      expect(stats.averageMultiplier).toBe(0);
      expect(stats.maxMultiplier).toBe(0);
      expect(stats.cascadeBreakdown).toHaveLength(0);
    });
  });
});