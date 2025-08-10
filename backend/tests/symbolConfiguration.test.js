/**
 * Symbol Configuration Service Tests
 * Tests for crypto-themed symbol system implementation
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

const SymbolConfigurationService = require('../services/symbolConfigurationService');

describe('SymbolConfigurationService', () => {
  let symbolConfig;

  beforeEach(() => {
    symbolConfig = new SymbolConfigurationService();
  });

  describe('Symbol Library Initialization', () => {
    test('should initialize all required crypto-themed symbols', () => {
      // Requirement 2.1: Include crypto-themed symbols: Bitcoin (BTC), Ethereum (ETH), 
      // Solana (SOL), NFT collectibles, DeFi tokens, blockchain blocks, crypto wallets, and diamond hands
      const requiredSymbols = [
        'btc', 'eth', 'sol', 'nft_collectible', 
        'defi_token', 'blockchain_block', 'crypto_wallet', 'diamond_hands'
      ];

      requiredSymbols.forEach(symbolId => {
        const symbol = symbolConfig.getSymbol(symbolId);
        expect(symbol).toBeDefined();
        expect(symbol.id).toBe(symbolId);
        expect(symbol.name).toBeDefined();
        expect(symbol.type).toBe('regular');
      });
    });

    test('should initialize wild symbol as golden crypto coin', () => {
      // Requirement 2.3: Wild symbols (represented by a golden crypto coin) that substitute for all regular symbols
      const wild = symbolConfig.getSymbol('wild');
      
      expect(wild).toBeDefined();
      expect(wild.name).toBe('Golden Crypto Coin');
      expect(wild.type).toBe('wild');
      expect(wild.description).toContain('Substitutes for all regular symbols');
    });

    test('should initialize scatter symbol as NFT marketplace', () => {
      // Requirement 2.4: NFT marketplace symbols as scatters that trigger bonus features
      const scatter = symbolConfig.getSymbol('scatter');
      
      expect(scatter).toBeDefined();
      expect(scatter.name).toBe('NFT Marketplace');
      expect(scatter.type).toBe('scatter');
      expect(scatter.description).toContain('NFT Mint Rush');
    });

    test('should initialize NFT character as premium symbol', () => {
      // Requirement 2.5: Rare NFT characters with higher payout values
      const nftCharacter = symbolConfig.getSymbol('nft_character');
      
      expect(nftCharacter).toBeDefined();
      expect(nftCharacter.name).toBe('NFT Character');
      expect(nftCharacter.type).toBe('nft_premium');
      expect(nftCharacter.value).toBeGreaterThan(100); // Higher than regular symbols
    });

    test('should have proper symbol value hierarchy', () => {
      const symbols = [
        'diamond_hands', 'crypto_wallet', 'blockchain_block', 'defi_token',
        'nft_collectible', 'sol', 'eth', 'btc'
      ];

      for (let i = 1; i < symbols.length; i++) {
        const prevSymbol = symbolConfig.getSymbol(symbols[i-1]);
        const currentSymbol = symbolConfig.getSymbol(symbols[i]);
        
        expect(currentSymbol.value).toBeGreaterThan(prevSymbol.value);
      }
    });
  });

  describe('Symbol Properties and Metadata', () => {
    test('should have complete metadata for all symbols', () => {
      const allSymbols = Object.values(symbolConfig.symbols);
      
      allSymbols.forEach(symbol => {
        expect(symbol.id).toBeDefined();
        expect(symbol.name).toBeDefined();
        expect(symbol.type).toBeDefined();
        expect(typeof symbol.weight).toBe('number');
        expect(symbol.weight).toBeGreaterThan(0);
        expect(symbol.rarity).toBeDefined();
        expect(symbol.description).toBeDefined();
        expect(symbol.imageUrl).toBeDefined();
        expect(symbol.animationData).toBeDefined();
        expect(symbol.soundEffects).toBeDefined();
      });
    });

    test('should have animation data for all symbols', () => {
      // Requirement 2.2: Display high-quality animated graphics for each crypto symbol
      const allSymbols = Object.values(symbolConfig.symbols);
      
      allSymbols.forEach(symbol => {
        expect(symbol.animationData.idle).toBeDefined();
        expect(symbol.animationData.win).toBeDefined();
        expect(symbol.animationData.cascade).toBeDefined();
      });
    });

    test('should have sound effects for all symbols', () => {
      const allSymbols = Object.values(symbolConfig.symbols);
      
      allSymbols.forEach(symbol => {
        expect(symbol.soundEffects.land).toBeDefined();
        expect(symbol.soundEffects.win).toBeDefined();
      });
    });
  });

  describe('Payout Tables', () => {
    test('should have payout tables for all regular symbols', () => {
      const regularSymbols = symbolConfig.getSymbolsByType('regular');
      
      regularSymbols.forEach(symbol => {
        const payoutTable = symbolConfig.getSymbolPayoutTable(symbol.id);
        expect(payoutTable).toBeDefined();
        expect(payoutTable[3]).toBeDefined();
        expect(payoutTable[4]).toBeDefined();
        expect(payoutTable[5]).toBeDefined();
        expect(payoutTable[6]).toBeDefined();
      });
    });

    test('should have increasing payouts for longer combinations', () => {
      const regularSymbols = symbolConfig.getSymbolsByType('regular');
      
      regularSymbols.forEach(symbol => {
        const payoutTable = symbolConfig.getSymbolPayoutTable(symbol.id);
        expect(payoutTable[4]).toBeGreaterThan(payoutTable[3]);
        expect(payoutTable[5]).toBeGreaterThan(payoutTable[4]);
        expect(payoutTable[6]).toBeGreaterThan(payoutTable[5]);
      });
    });

    test('should have higher payouts for higher value symbols', () => {
      const btcPayout = symbolConfig.getSymbolPayout('btc', 6);
      const ethPayout = symbolConfig.getSymbolPayout('eth', 6);
      const diamondPayout = symbolConfig.getSymbolPayout('diamond_hands', 6);
      
      expect(btcPayout).toBeGreaterThan(ethPayout);
      expect(ethPayout).toBeGreaterThan(diamondPayout);
    });

    test('should have premium payouts for NFT characters', () => {
      // Requirement 2.5: Rare NFT characters with higher payout values
      const nftCharacterPayout = symbolConfig.getSymbolPayout('nft_character', 6);
      const bitcoinPayout = symbolConfig.getSymbolPayout('btc', 6);
      
      expect(nftCharacterPayout).toBeGreaterThan(bitcoinPayout);
    });
  });

  describe('Special Symbol Behaviors', () => {
    test('should configure wild substitution behavior', () => {
      // Requirement 2.3: Wild symbols that substitute for all regular symbols
      const wildBehavior = symbolConfig.getSpecialBehavior('wild');
      
      expect(wildBehavior).toBeDefined();
      expect(wildBehavior.type).toBe('substitution');
      expect(wildBehavior.substitutes).toContain('btc');
      expect(wildBehavior.substitutes).toContain('eth');
      expect(wildBehavior.substitutes).toContain('diamond_hands');
      expect(wildBehavior.doesNotSubstitute).toContain('scatter');
    });

    test('should configure scatter bonus trigger behavior', () => {
      // Requirement 2.4: NFT marketplace symbols as scatters that trigger bonus features
      const scatterBehavior = symbolConfig.getSpecialBehavior('scatter');
      
      expect(scatterBehavior).toBeDefined();
      expect(scatterBehavior.type).toBe('bonus_trigger');
      expect(scatterBehavior.bonusType).toBe('nft_mint_rush');
      expect(scatterBehavior.minRequired).toBe(3);
      expect(scatterBehavior.bonusSpins[3]).toBe(10);
      expect(scatterBehavior.bonusSpins[4]).toBe(15);
      expect(scatterBehavior.bonusSpins[5]).toBe(20);
      expect(scatterBehavior.bonusSpins[6]).toBe(25);
    });

    test('should configure NFT character premium behavior', () => {
      // Requirement 2.5: Rare NFT characters with higher payout values
      const nftBehavior = symbolConfig.getSpecialBehavior('nft_character');
      
      expect(nftBehavior).toBeDefined();
      expect(nftBehavior.type).toBe('premium_bonus');
      expect(nftBehavior.dynamicMultiplier).toBe(true);
      expect(nftBehavior.holographicEffect).toBe(true);
      expect(nftBehavior.bonusCalculation).toBe('player_nft_multiplier');
    });

    test('should validate wild substitution logic', () => {
      const regularSymbols = symbolConfig.getSymbolsByType('regular');
      
      regularSymbols.forEach(symbol => {
        expect(symbolConfig.canSubstitute('wild', symbol.id)).toBe(true);
      });
      
      expect(symbolConfig.canSubstitute('wild', 'scatter')).toBe(false);
    });
  });

  describe('Weighted Symbol Array Generation', () => {
    test('should create weighted array with correct proportions', () => {
      const weightedArray = symbolConfig.createWeightedSymbolArray();
      
      // Count occurrences of each symbol
      const symbolCounts = {};
      weightedArray.forEach(symbolId => {
        symbolCounts[symbolId] = (symbolCounts[symbolId] || 0) + 1;
      });
      
      // Verify counts match weights
      Object.entries(symbolCounts).forEach(([symbolId, count]) => {
        const symbol = symbolConfig.getSymbol(symbolId);
        expect(count).toBe(symbol.weight);
      });
    });

    test('should support excluding special symbols', () => {
      const regularOnly = symbolConfig.createWeightedSymbolArray({ includeSpecial: false });
      
      expect(regularOnly).not.toContain('wild');
      expect(regularOnly).not.toContain('scatter');
      expect(regularOnly).toContain('btc');
      expect(regularOnly).toContain('eth');
    });

    test('should support excluding specific symbols', () => {
      const excludeBitcoin = symbolConfig.createWeightedSymbolArray({ 
        excludeSymbols: ['btc'] 
      });
      
      expect(excludeBitcoin).not.toContain('btc');
      expect(excludeBitcoin).toContain('eth');
    });
  });

  describe('Symbol Queries and Filtering', () => {
    test('should get symbols by type', () => {
      const regularSymbols = symbolConfig.getSymbolsByType('regular');
      const wildSymbols = symbolConfig.getSymbolsByType('wild');
      const scatterSymbols = symbolConfig.getSymbolsByType('scatter');
      
      expect(regularSymbols.length).toBe(8); // 8 regular crypto symbols
      expect(wildSymbols.length).toBe(1);
      expect(scatterSymbols.length).toBe(1);
      
      regularSymbols.forEach(symbol => {
        expect(symbol.type).toBe('regular');
      });
    });

    test('should get regular symbols only', () => {
      const regularSymbols = symbolConfig.getRegularSymbols();
      
      expect(regularSymbols.length).toBe(8);
      regularSymbols.forEach(symbol => {
        expect(symbol.type).toBe('regular');
      });
    });
  });

  describe('Configuration Updates', () => {
    test('should update symbol weights', () => {
      const originalWeight = symbolConfig.getSymbol('btc').weight;
      const newWeight = 20;
      
      const success = symbolConfig.updateSymbolWeight('btc', newWeight);
      expect(success).toBe(true);
      expect(symbolConfig.getSymbol('btc').weight).toBe(newWeight);
    });

    test('should reject invalid weight updates', () => {
      const success1 = symbolConfig.updateSymbolWeight('btc', -5);
      const success2 = symbolConfig.updateSymbolWeight('nonexistent', 10);
      
      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });

    test('should update symbol payouts', () => {
      const newPayouts = { 3: 10, 4: 50, 5: 200, 6: 1000 };
      
      const success = symbolConfig.updateSymbolPayouts('btc', newPayouts);
      expect(success).toBe(true);
      
      expect(symbolConfig.getSymbolPayout('btc', 3)).toBe(10);
      expect(symbolConfig.getSymbolPayout('btc', 6)).toBe(1000);
    });

    test('should reject invalid payout updates', () => {
      const invalidPayouts1 = { 3: 10, 4: 50 }; // Missing keys
      const invalidPayouts2 = { 3: 10, 4: 50, 5: 200, 6: 'invalid' }; // Invalid type
      
      const success1 = symbolConfig.updateSymbolPayouts('btc', invalidPayouts1);
      const success2 = symbolConfig.updateSymbolPayouts('btc', invalidPayouts2);
      
      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });
  });

  describe('RTP Calculation', () => {
    test('should calculate theoretical RTP', () => {
      const rtpResult = symbolConfig.calculateTheoreticalRTP(100000);
      
      expect(rtpResult.rtp).toBeGreaterThan(0);
      expect(rtpResult.rtp).toBeLessThan(100); // Should be less than 100% for house edge
      expect(rtpResult.totalSpins).toBe(100000);
      expect(rtpResult.averagePayoutPerSpin).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration integrity', () => {
      const validation = symbolConfig.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect configuration errors', () => {
      // Temporarily corrupt configuration
      const originalSymbol = symbolConfig.symbols.btc;
      symbolConfig.symbols.btc = { id: 'btc' }; // Missing required properties
      
      const validation = symbolConfig.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      
      // Restore original
      symbolConfig.symbols.btc = originalSymbol;
    });
  });

  describe('Symbol Statistics', () => {
    test('should generate symbol statistics', () => {
      const stats = symbolConfig.getSymbolStatistics();
      
      expect(stats.totalSymbols).toBeGreaterThan(0);
      expect(stats.symbolsByType.regular).toBe(8);
      expect(stats.symbolsByType.wild).toBe(1);
      expect(stats.symbolsByType.scatter).toBe(1);
      expect(stats.symbolsByType.nft_premium).toBe(1);
      expect(stats.totalWeight).toBeGreaterThan(0);
      expect(stats.averageWeight).toBeGreaterThan(0);
      
      // Check weight distribution percentages sum to 100
      const totalPercentage = Object.values(stats.weightDistribution)
        .reduce((sum, item) => sum + item.percentage, 0);
      expect(Math.round(totalPercentage)).toBe(100);
    });
  });

  describe('Integration with Requirements', () => {
    test('should meet all symbol requirements', () => {
      // Requirement 2.1: Crypto-themed symbols
      const cryptoSymbols = ['btc', 'eth', 'sol', 'nft_collectible', 
                           'defi_token', 'blockchain_block', 'crypto_wallet', 'diamond_hands'];
      cryptoSymbols.forEach(symbolId => {
        expect(symbolConfig.getSymbol(symbolId)).toBeDefined();
      });

      // Requirement 2.2: High-quality animated graphics
      cryptoSymbols.forEach(symbolId => {
        const symbol = symbolConfig.getSymbol(symbolId);
        expect(symbol.animationData.idle).toBeDefined();
        expect(symbol.animationData.win).toBeDefined();
      });

      // Requirement 2.3: Wild symbols
      const wild = symbolConfig.getSymbol('wild');
      expect(wild.type).toBe('wild');
      expect(wild.name).toContain('Golden Crypto Coin');

      // Requirement 2.4: Scatter symbols
      const scatter = symbolConfig.getSymbol('scatter');
      expect(scatter.type).toBe('scatter');
      expect(scatter.name).toContain('NFT Marketplace');

      // Requirement 2.5: Premium NFT characters
      const nftCharacter = symbolConfig.getSymbol('nft_character');
      expect(nftCharacter.type).toBe('nft_premium');
      expect(nftCharacter.value).toBeGreaterThan(100);
    });
  });
});