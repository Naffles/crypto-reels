/**
 * CryptoReels Symbol Configuration Service
 * Manages symbol definitions, weights, payout tables, and special behaviors
 * Implements requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

class SymbolConfigurationService {
  constructor() {
    // Initialize symbol library with crypto-themed symbols
    this.initializeSymbolLibrary();
    this.initializePayoutTables();
    this.initializeSpecialBehaviors();
  }

  /**
   * Initialize the complete symbol library with crypto-themed symbols
   * Requirements: 2.1 - Include crypto-themed symbols: Bitcoin (BTC), Ethereum (ETH), 
   * Solana (SOL), NFT collectibles, DeFi tokens, blockchain blocks, crypto wallets, and diamond hands
   */
  initializeSymbolLibrary() {
    this.symbols = {
      // Regular symbols (ordered from lowest to highest value)
      'diamond_hands': {
        id: 'diamond_hands',
        name: 'Diamond Hands',
        type: 'regular',
        value: 10,
        weight: 45,
        rarity: 'common',
        description: 'Hold strong through market volatility',
        imageUrl: '/images/symbols/diamond_hands.png',
        animationData: {
          idle: '/animations/diamond_hands_idle.json',
          win: '/animations/diamond_hands_win.json',
          cascade: '/animations/diamond_hands_cascade.json'
        },
        soundEffects: {
          land: '/sounds/diamond_hands_land.wav',
          win: '/sounds/diamond_hands_win.wav'
        }
      },
      
      'crypto_wallet': {
        id: 'crypto_wallet',
        name: 'Crypto Wallet',
        type: 'regular',
        value: 15,
        weight: 40,
        rarity: 'common',
        description: 'Secure storage for digital assets',
        imageUrl: '/images/symbols/crypto_wallet.png',
        animationData: {
          idle: '/animations/crypto_wallet_idle.json',
          win: '/animations/crypto_wallet_win.json',
          cascade: '/animations/crypto_wallet_cascade.json'
        },
        soundEffects: {
          land: '/sounds/crypto_wallet_land.wav',
          win: '/sounds/crypto_wallet_win.wav'
        }
      },
      
      'blockchain_block': {
        id: 'blockchain_block',
        name: 'Blockchain Block',
        type: 'regular',
        value: 20,
        weight: 35,
        rarity: 'common',
        description: 'Building blocks of the blockchain',
        imageUrl: '/images/symbols/blockchain_block.png',
        animationData: {
          idle: '/animations/blockchain_block_idle.json',
          win: '/animations/blockchain_block_win.json',
          cascade: '/animations/blockchain_block_cascade.json'
        },
        soundEffects: {
          land: '/sounds/blockchain_block_land.wav',
          win: '/sounds/blockchain_block_win.wav'
        }
      },
      
      'defi_token': {
        id: 'defi_token',
        name: 'DeFi Token',
        type: 'regular',
        value: 30,
        weight: 30,
        rarity: 'uncommon',
        description: 'Decentralized finance protocol token',
        imageUrl: '/images/symbols/defi_token.png',
        animationData: {
          idle: '/animations/defi_token_idle.json',
          win: '/animations/defi_token_win.json',
          cascade: '/animations/defi_token_cascade.json'
        },
        soundEffects: {
          land: '/sounds/defi_token_land.wav',
          win: '/sounds/defi_token_win.wav'
        }
      },
      
      'nft_collectible': {
        id: 'nft_collectible',
        name: 'NFT Collectible',
        type: 'regular',
        value: 40,
        weight: 25,
        rarity: 'uncommon',
        description: 'Unique digital collectible',
        imageUrl: '/images/symbols/nft_collectible.png',
        animationData: {
          idle: '/animations/nft_collectible_idle.json',
          win: '/animations/nft_collectible_win.json',
          cascade: '/animations/nft_collectible_cascade.json'
        },
        soundEffects: {
          land: '/sounds/nft_collectible_land.wav',
          win: '/sounds/nft_collectible_win.wav'
        }
      },
      
      'sol': {
        id: 'sol',
        name: 'Solana (SOL)',
        type: 'regular',
        value: 60,
        weight: 22,
        rarity: 'rare',
        description: 'High-performance blockchain platform',
        imageUrl: '/images/symbols/solana.png',
        animationData: {
          idle: '/animations/solana_idle.json',
          win: '/animations/solana_win.json',
          cascade: '/animations/solana_cascade.json'
        },
        soundEffects: {
          land: '/sounds/solana_land.wav',
          win: '/sounds/solana_win.wav'
        }
      },
      
      'eth': {
        id: 'eth',
        name: 'Ethereum (ETH)',
        type: 'regular',
        value: 80,
        weight: 18,
        rarity: 'rare',
        description: 'Smart contract blockchain platform',
        imageUrl: '/images/symbols/ethereum.png',
        animationData: {
          idle: '/animations/ethereum_idle.json',
          win: '/animations/ethereum_win.json',
          cascade: '/animations/ethereum_cascade.json'
        },
        soundEffects: {
          land: '/sounds/ethereum_land.wav',
          win: '/sounds/ethereum_win.wav'
        }
      },
      
      'btc': {
        id: 'btc',
        name: 'Bitcoin (BTC)',
        type: 'regular',
        value: 100,
        weight: 15,
        rarity: 'epic',
        description: 'The original cryptocurrency',
        imageUrl: '/images/symbols/bitcoin.png',
        animationData: {
          idle: '/animations/bitcoin_idle.json',
          win: '/animations/bitcoin_win.json',
          cascade: '/animations/bitcoin_cascade.json'
        },
        soundEffects: {
          land: '/sounds/bitcoin_land.wav',
          win: '/sounds/bitcoin_win.wav'
        }
      },
      
      // Special symbols
      // Requirement 2.3: Wild symbols (represented by a golden crypto coin) that substitute for all regular symbols
      'wild': {
        id: 'wild',
        name: 'Golden Crypto Coin',
        type: 'wild',
        value: 0, // Wilds don't have inherent value, they substitute
        weight: 5,
        rarity: 'legendary',
        description: 'Substitutes for all regular symbols',
        imageUrl: '/images/symbols/golden_crypto_coin.png',
        animationData: {
          idle: '/animations/wild_idle.json',
          win: '/animations/wild_win.json',
          cascade: '/animations/wild_cascade.json',
          substitute: '/animations/wild_substitute.json'
        },
        soundEffects: {
          land: '/sounds/wild_land.wav',
          win: '/sounds/wild_win.wav',
          substitute: '/sounds/wild_substitute.wav'
        },
        specialBehavior: {
          substitutes: 'all_regular',
          multiplier: 1,
          expandsOnWin: false
        }
      },
      
      // Requirement 2.4: NFT marketplace symbols as scatters that trigger bonus features
      'scatter': {
        id: 'scatter',
        name: 'NFT Marketplace',
        type: 'scatter',
        value: 0, // Scatters trigger features, not direct payouts
        weight: 3,
        rarity: 'legendary',
        description: 'Triggers NFT Mint Rush free spins bonus',
        imageUrl: '/images/symbols/nft_marketplace.png',
        animationData: {
          idle: '/animations/scatter_idle.json',
          win: '/animations/scatter_win.json',
          cascade: '/animations/scatter_cascade.json',
          trigger: '/animations/scatter_trigger.json'
        },
        soundEffects: {
          land: '/sounds/scatter_land.wav',
          win: '/sounds/scatter_win.wav',
          trigger: '/sounds/scatter_trigger.wav'
        },
        specialBehavior: {
          triggersBonus: 'nft_mint_rush',
          minRequired: 3,
          maxPayout: 0,
          scatterPays: true
        }
      },
      
      // Requirement 2.5: Rare NFT characters with higher payout values (dynamic based on player's NFTs)
      'nft_character': {
        id: 'nft_character',
        name: 'NFT Character',
        type: 'nft_premium',
        value: 150, // Higher than regular symbols
        weight: 8, // Rare appearance
        rarity: 'mythic',
        description: 'Premium NFT character with bonus multipliers',
        imageUrl: '/images/symbols/nft_character_default.png', // Default, replaced by player's NFT
        animationData: {
          idle: '/animations/nft_character_idle.json',
          win: '/animations/nft_character_win.json',
          cascade: '/animations/nft_character_cascade.json',
          holographic: '/animations/nft_character_holographic.json'
        },
        soundEffects: {
          land: '/sounds/nft_character_land.wav',
          win: '/sounds/nft_character_win.wav',
          bonus: '/sounds/nft_character_bonus.wav'
        },
        specialBehavior: {
          dynamicMultiplier: true,
          holographicEffect: true,
          bonusEligible: true
        }
      }
    };
  }

  /**
   * Initialize payout tables for different symbol combinations
   * Values are multipliers of the bet amount for 3, 4, 5, 6 of a kind
   */
  initializePayoutTables() {
    this.payoutTables = {
      // Regular symbols - ascending value order
      'diamond_hands': { 3: 0.5, 4: 2.5, 5: 10, 6: 50 },
      'crypto_wallet': { 3: 0.75, 4: 3.75, 5: 15, 6: 75 },
      'blockchain_block': { 3: 1, 4: 5, 5: 20, 6: 100 },
      'defi_token': { 3: 1.5, 4: 7.5, 5: 30, 6: 150 },
      'nft_collectible': { 3: 2, 4: 10, 5: 40, 6: 200 },
      'sol': { 3: 3, 4: 15, 5: 60, 6: 300 },
      'eth': { 3: 4, 4: 20, 5: 80, 6: 400 },
      'btc': { 3: 5, 4: 25, 5: 100, 6: 500 },
      
      // Premium NFT characters - higher payouts
      'nft_character': { 3: 7.5, 4: 37.5, 5: 150, 6: 750 },
      
      // Special symbols
      'wild': { 3: 0, 4: 0, 5: 0, 6: 0 }, // Wilds don't pay directly, they substitute
      'scatter': { 3: 0, 4: 0, 5: 0, 6: 0 } // Scatters trigger bonuses, not direct payouts
    };
  }

  /**
   * Initialize special symbol behaviors
   * Requirements: 2.3, 2.4, 2.5 - Wild substitution, scatter triggers, NFT bonuses
   */
  initializeSpecialBehaviors() {
    this.specialBehaviors = {
      wild: {
        type: 'substitution',
        substitutes: ['diamond_hands', 'crypto_wallet', 'blockchain_block', 'defi_token', 
                     'nft_collectible', 'sol', 'eth', 'btc', 'nft_character'],
        doesNotSubstitute: ['scatter'], // Wilds don't substitute for scatters
        multiplier: 1, // Standard wild multiplier
        expandsOnWin: false,
        stickyWild: false
      },
      
      scatter: {
        type: 'bonus_trigger',
        bonusType: 'nft_mint_rush',
        minRequired: 3,
        bonusSpins: {
          3: 10,
          4: 15,
          5: 20,
          6: 25
        },
        scatterPays: false, // Scatters don't pay directly in this game
        retriggerable: true,
        additionalSpinsOnRetrigger: 5
      },
      
      nft_character: {
        type: 'premium_bonus',
        dynamicMultiplier: true,
        holographicEffect: true,
        bonusCalculation: 'player_nft_multiplier',
        stacksWithCascades: true,
        triggersSpecialEffects: true
      }
    };
  }

  /**
   * Get symbol configuration by ID
   * @param {string} symbolId - Symbol identifier
   * @returns {Object|null} Symbol configuration or null if not found
   */
  getSymbol(symbolId) {
    return this.symbols[symbolId] || null;
  }

  /**
   * Get all symbol IDs
   * @returns {Array} Array of all symbol IDs
   */
  getAllSymbolIds() {
    return Object.keys(this.symbols);
  }

  /**
   * Get all symbols of a specific type
   * @param {string} type - Symbol type ('regular', 'wild', 'scatter', 'nft_premium')
   * @returns {Array} Array of symbols matching the type
   */
  getSymbolsByType(type) {
    return Object.values(this.symbols).filter(symbol => symbol.type === type);
  }

  /**
   * Get all regular symbols (excludes special symbols)
   * @returns {Array} Array of regular symbols
   */
  getRegularSymbols() {
    return this.getSymbolsByType('regular');
  }

  /**
   * Get payout for a symbol combination
   * @param {string} symbolId - Symbol identifier
   * @param {number} count - Number of symbols in combination (3-6)
   * @returns {number} Payout multiplier
   */
  getSymbolPayout(symbolId, count) {
    const payoutTable = this.payoutTables[symbolId];
    if (!payoutTable || !payoutTable[count]) {
      return 0;
    }
    return payoutTable[count];
  }

  /**
   * Get complete payout table for a symbol
   * @param {string} symbolId - Symbol identifier
   * @returns {Object|null} Payout table or null if not found
   */
  getSymbolPayoutTable(symbolId) {
    return this.payoutTables[symbolId] || null;
  }

  /**
   * Get all payout tables
   * @returns {Object} Complete payout tables
   */
  getAllPayoutTables() {
    return this.payoutTables;
  }

  /**
   * Get special behavior configuration for a symbol
   * @param {string} symbolId - Symbol identifier
   * @returns {Object|null} Special behavior configuration or null
   */
  getSpecialBehavior(symbolId) {
    return this.specialBehaviors[symbolId] || null;
  }

  /**
   * Check if a symbol can substitute for another symbol
   * @param {string} wildSymbol - Wild symbol ID
   * @param {string} targetSymbol - Target symbol ID to substitute
   * @returns {boolean} True if substitution is allowed
   */
  canSubstitute(wildSymbol, targetSymbol) {
    const behavior = this.getSpecialBehavior(wildSymbol);
    if (!behavior || behavior.type !== 'substitution') {
      return false;
    }
    
    return behavior.substitutes.includes(targetSymbol) && 
           !behavior.doesNotSubstitute.includes(targetSymbol);
  }

  /**
   * Create weighted symbol array for random selection
   * @param {Object} options - Options for weight calculation
   * @param {boolean} options.includeSpecial - Include special symbols (default: true)
   * @param {Array} options.excludeSymbols - Symbols to exclude from selection
   * @returns {Array} Weighted array of symbol IDs
   */
  createWeightedSymbolArray(options = {}) {
    const { includeSpecial = true, excludeSymbols = [] } = options;
    const weightedArray = [];
    
    Object.values(this.symbols).forEach(symbol => {
      // Skip excluded symbols
      if (excludeSymbols.includes(symbol.id)) {
        return;
      }
      
      // Skip special symbols if not included
      if (!includeSpecial && symbol.type !== 'regular') {
        return;
      }
      
      // Add symbol to weighted array based on its weight
      for (let i = 0; i < symbol.weight; i++) {
        weightedArray.push(symbol.id);
      }
    });
    
    return weightedArray;
  }

  /**
   * Update symbol weight (for admin configuration)
   * @param {string} symbolId - Symbol identifier
   * @param {number} newWeight - New weight value
   * @returns {boolean} True if update successful
   */
  updateSymbolWeight(symbolId, newWeight) {
    if (!this.symbols[symbolId] || newWeight < 0) {
      return false;
    }
    
    this.symbols[symbolId].weight = newWeight;
    return true;
  }

  /**
   * Update symbol payout table (for admin configuration)
   * @param {string} symbolId - Symbol identifier
   * @param {Object} newPayouts - New payout table { 3: value, 4: value, 5: value, 6: value }
   * @returns {boolean} True if update successful
   */
  updateSymbolPayouts(symbolId, newPayouts) {
    if (!this.symbols[symbolId] || !this.payoutTables[symbolId]) {
      return false;
    }
    
    // Validate payout structure
    const requiredKeys = [3, 4, 5, 6];
    const hasAllKeys = requiredKeys.every(key => 
      newPayouts.hasOwnProperty(key) && typeof newPayouts[key] === 'number'
    );
    
    if (!hasAllKeys) {
      return false;
    }
    
    this.payoutTables[symbolId] = { ...newPayouts };
    return true;
  }

  /**
   * Calculate theoretical RTP (Return to Player) percentage
   * @param {number} totalSpins - Number of spins to simulate (default: 1000000)
   * @returns {Object} RTP calculation results
   */
  calculateTheoreticalRTP(totalSpins = 1000000) {
    const weightedSymbols = this.createWeightedSymbolArray();
    const totalWeight = weightedSymbols.length;
    let totalPayout = 0;
    
    // Calculate expected payout for each symbol combination
    Object.keys(this.payoutTables).forEach(symbolId => {
      const symbol = this.symbols[symbolId];
      const payouts = this.payoutTables[symbolId];
      
      if (symbol.type === 'regular' || symbol.type === 'nft_premium') {
        // Calculate probability of getting this symbol
        const symbolProbability = symbol.weight / totalWeight;
        
        // Calculate expected payout for each combination length
        [3, 4, 5, 6].forEach(length => {
          const combinationProbability = Math.pow(symbolProbability, length);
          const payout = payouts[length] || 0;
          totalPayout += combinationProbability * payout;
        });
      }
    });
    
    // Calculate RTP as percentage
    const rtp = (totalPayout / totalSpins) * 100;
    
    return {
      rtp: rtp,
      totalExpectedPayout: totalPayout,
      totalSpins: totalSpins,
      averagePayoutPerSpin: totalPayout / totalSpins
    };
  }

  /**
   * Validate symbol configuration integrity
   * @returns {Object} Validation results
   */
  validateConfiguration() {
    const errors = [];
    const warnings = [];
    
    // Check that all symbols have required properties
    Object.entries(this.symbols).forEach(([id, symbol]) => {
      if (!symbol.name || !symbol.type || typeof symbol.weight !== 'number') {
        errors.push(`Symbol ${id} missing required properties`);
      }
      
      if (symbol.weight <= 0) {
        errors.push(`Symbol ${id} has invalid weight: ${symbol.weight}`);
      }
      
      if (symbol.type === 'regular' && !this.payoutTables[id]) {
        errors.push(`Regular symbol ${id} missing payout table`);
      }
    });
    
    // Check payout table consistency
    Object.entries(this.payoutTables).forEach(([id, payouts]) => {
      if (!this.symbols[id]) {
        warnings.push(`Payout table exists for unknown symbol: ${id}`);
      }
      
      // Check that payouts increase with combination length
      const values = [payouts[3], payouts[4], payouts[5], payouts[6]];
      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[i-1]) {
          warnings.push(`Symbol ${id} payouts don't increase with combination length`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get symbol statistics
   * @returns {Object} Symbol statistics
   */
  getSymbolStatistics() {
    const stats = {
      totalSymbols: Object.keys(this.symbols).length,
      symbolsByType: {},
      totalWeight: 0,
      averageWeight: 0,
      weightDistribution: {}
    };
    
    // Calculate statistics by type
    Object.values(this.symbols).forEach(symbol => {
      // Count by type
      if (!stats.symbolsByType[symbol.type]) {
        stats.symbolsByType[symbol.type] = 0;
      }
      stats.symbolsByType[symbol.type]++;
      
      // Weight statistics
      stats.totalWeight += symbol.weight;
      stats.weightDistribution[symbol.id] = {
        weight: symbol.weight,
        percentage: 0 // Will be calculated after total is known
      };
    });
    
    stats.averageWeight = stats.totalWeight / stats.totalSymbols;
    
    // Calculate weight percentages
    Object.keys(stats.weightDistribution).forEach(symbolId => {
      const weight = stats.weightDistribution[symbolId].weight;
      stats.weightDistribution[symbolId].percentage = (weight / stats.totalWeight) * 100;
    });
    
    return stats;
  }
}

module.exports = SymbolConfigurationService;