/**
 * CryptoReels Slot Engine Service
 * Implements 6-reel Megaways slot machine mechanics with dynamic reel heights
 * and up to 117,649 ways to win
 */

const SymbolConfigurationService = require('./symbolConfigurationService');

class SlotEngineService {
  constructor() {
    // Initialize symbol configuration service
    this.symbolConfig = new SymbolConfigurationService();
    
    // Maximum ways to win for 6-reel Megaways (7^6 = 117,649)
    this.maxWaysToWin = 117649;
  }

  /**
   * Generate dynamic reel configuration for Megaways mechanics
   * Each reel can have 2-7 symbols (dynamic height)
   * @param {string} vrfNumber - VRF random number for reel generation
   * @returns {Array} Array of reel configurations
   */
  generateReelConfiguration(vrfNumber) {
    const reels = [];
    let vrfIndex = 0;
    
    // Generate 6 reels with dynamic heights
    for (let i = 0; i < 6; i++) {
      // Extract 3 bits for reel height (2-7 symbols)
      const heightBits = this.extractBits(vrfNumber, vrfIndex, 3);
      const reelHeight = 2 + (heightBits % 6); // 2-7 symbols per reel
      
      reels.push({
        reelIndex: i,
        height: reelHeight,
        symbols: []
      });
      
      vrfIndex += 3;
    }
    
    return reels;
  }

  /**
   * Populate reels with symbols using VRF randomness
   * @param {string} vrfNumber - VRF random number
   * @param {Array} reelConfig - Reel configuration from generateReelConfiguration
   * @returns {Array} Populated reel configuration with symbols
   */
  populateReels(vrfNumber, reelConfig) {
    let vrfIndex = 18; // Start after reel height bits (6 reels * 3 bits)
    const populatedReels = JSON.parse(JSON.stringify(reelConfig)); // Deep copy
    
    // Create weighted symbol array for selection using symbol configuration service
    const weightedSymbols = this.symbolConfig.createWeightedSymbolArray();
    
    populatedReels.forEach((reel) => {
      for (let pos = 0; pos < reel.height; pos++) {
        // Extract 8 bits for symbol selection (256 possible values)
        const symbolBits = this.extractBits(vrfNumber, vrfIndex, 8);
        const symbolIndex = symbolBits % weightedSymbols.length;
        const selectedSymbol = weightedSymbols[symbolIndex];
        
        reel.symbols.push(selectedSymbol);
        vrfIndex += 8;
      }
    });
    
    return populatedReels;
  }

  /**
   * Calculate all winning combinations using Megaways adjacent symbol matching
   * @param {Array} reelResult - Populated reel configuration
   * @returns {Object} Winning combinations and total ways to win
   */
  calculateWinningCombinations(reelResult) {
    const winningCombinations = [];
    const waysToWin = this.calculateWaysToWin(reelResult);
    
    // Get all unique symbols on the reels (excluding scatters)
    const symbolsOnReels = this.getUniqueSymbols(reelResult);
    
    symbolsOnReels.forEach(symbol => {
      if (symbol === 'scatter') return; // Scatters don't form paylines
      
      const combination = this.findSymbolCombination(reelResult, symbol);
      if (combination.length >= 3) { // Minimum 3 symbols for a win
        const payout = this.calculateSymbolPayout(symbol, combination.length);
        
        if (payout > 0) {
          winningCombinations.push({
            symbol,
            length: combination.length,
            positions: combination,
            basePayout: payout,
            waysCount: this.countWaysForCombination(reelResult, symbol, combination.length)
          });
        }
      }
    });
    
    return {
      combinations: winningCombinations,
      totalWaysToWin: waysToWin,
      hasWins: winningCombinations.length > 0
    };
  }

  /**
   * Find adjacent symbol combination starting from leftmost reel
   * @param {Array} reelResult - Populated reel configuration
   * @param {string} targetSymbol - Symbol to find combinations for
   * @returns {Array} Array of positions forming the combination
   */
  findSymbolCombination(reelResult, targetSymbol) {
    const combination = [];
    
    // Start from leftmost reel and find adjacent matching symbols
    for (let reelIndex = 0; reelIndex < reelResult.length; reelIndex++) {
      const reel = reelResult[reelIndex];
      let symbolFound = false;
      
      // Check if target symbol (or wild) exists on this reel
      for (let symbolIndex = 0; symbolIndex < reel.symbols.length; symbolIndex++) {
        const symbol = reel.symbols[symbolIndex];
        
        // Use symbol configuration service to check if wild can substitute
        if (symbol === targetSymbol || this.symbolConfig.canSubstitute('wild', targetSymbol) && symbol === 'wild') {
          combination.push({
            reel: reelIndex,
            position: symbolIndex,
            symbol: symbol
          });
          symbolFound = true;
          break; // Only need one symbol per reel for the combination
        }
      }
      
      // If no matching symbol found on this reel, combination ends
      if (!symbolFound) {
        break;
      }
    }
    
    return combination;
  }

  /**
   * Calculate ways to win for current reel configuration
   * @param {Array} reelResult - Populated reel configuration
   * @returns {number} Total ways to win
   */
  calculateWaysToWin(reelResult) {
    let waysToWin = 1;
    
    reelResult.forEach(reel => {
      waysToWin *= reel.height;
    });
    
    return Math.min(waysToWin, this.maxWaysToWin);
  }

  /**
   * Count specific ways for a symbol combination
   * @param {Array} reelResult - Populated reel configuration
   * @param {string} symbol - Target symbol
   * @param {number} combinationLength - Length of the combination
   * @returns {number} Number of ways this combination can occur
   */
  countWaysForCombination(reelResult, symbol, combinationLength) {
    let ways = 1;
    
    for (let reelIndex = 0; reelIndex < combinationLength; reelIndex++) {
      const reel = reelResult[reelIndex];
      let symbolCount = 0;
      
      // Count occurrences of target symbol and wilds on this reel
      reel.symbols.forEach(reelSymbol => {
        if (reelSymbol === symbol || reelSymbol === 'wild') {
          symbolCount++;
        }
      });
      
      ways *= symbolCount;
    }
    
    return ways;
  }

  /**
   * Calculate payout for a symbol combination
   * @param {string} symbol - Symbol type
   * @param {number} length - Combination length
   * @returns {number} Payout amount
   */
  calculateSymbolPayout(symbol, length) {
    return this.symbolConfig.getSymbolPayout(symbol, length);
  }

  /**
   * Get all unique symbols present on the reels
   * @param {Array} reelResult - Populated reel configuration
   * @returns {Array} Array of unique symbols
   */
  getUniqueSymbols(reelResult) {
    const uniqueSymbols = new Set();
    
    reelResult.forEach(reel => {
      reel.symbols.forEach(symbol => {
        uniqueSymbols.add(symbol);
      });
    });
    
    return Array.from(uniqueSymbols);
  }

  /**
   * Extract specific bits from VRF number
   * @param {string} vrfNumber - Hexadecimal VRF number
   * @param {number} startBit - Starting bit position
   * @param {number} bitCount - Number of bits to extract
   * @returns {number} Extracted bits as integer
   */
  extractBits(vrfNumber, startBit, bitCount) {
    // Convert hex string to BigInt for bit manipulation
    const vrfBigInt = BigInt(vrfNumber);
    
    // Create mask for the desired number of bits
    const mask = (BigInt(1) << BigInt(bitCount)) - BigInt(1);
    
    // Shift right to get to the starting bit, then apply mask
    const extractedBits = (vrfBigInt >> BigInt(startBit)) & mask;
    
    return Number(extractedBits);
  }

  /**
   * Validate reel configuration
   * @param {Array} reelConfig - Reel configuration to validate
   * @param {boolean} requireSymbols - Whether symbols must be populated (default: true)
   * @returns {boolean} True if valid
   */
  validateReelConfiguration(reelConfig, requireSymbols = true) {
    if (!Array.isArray(reelConfig) || reelConfig.length !== 6) {
      return false;
    }
    
    return reelConfig.every(reel => {
      const heightValid = reel.height >= 2 && reel.height <= 7;
      const symbolsArrayValid = Array.isArray(reel.symbols);
      
      if (!heightValid || !symbolsArrayValid) {
        return false;
      }
      
      if (requireSymbols) {
        return reel.symbols.length === reel.height;
      } else {
        // For unpopulated reels, symbols array can be empty
        return true;
      }
    });
  }

  /**
   * Get symbol information
   * @param {string} symbolId - Symbol identifier
   * @returns {Object} Symbol information
   */
  getSymbolInfo(symbolId) {
    return this.symbolConfig.getSymbol(symbolId);
  }

  /**
   * Get payout table
   * @returns {Object} Complete payout table
   */
  getPayoutTable() {
    return this.symbolConfig.getAllPayoutTables();
  }

  /**
   * Get symbol configuration service
   * @returns {SymbolConfigurationService} Symbol configuration service instance
   */
  getSymbolConfigurationService() {
    return this.symbolConfig;
  }

  /**
   * Calculate total payout for all winning combinations
   * @param {Array} winningCombinations - Array of winning combinations
   * @param {number} betAmount - Total bet amount (not per way)
   * @returns {number} Total payout
   */
  calculateTotalPayout(winningCombinations, betAmount = 1) {
    let totalPayout = 0;
    
    winningCombinations.forEach(combination => {
      // In Megaways, payout is typically the base payout times bet amount
      // The ways count determines how likely the win is, but doesn't multiply the payout
      const combinationPayout = combination.basePayout * betAmount;
      totalPayout += combinationPayout;
    });
    
    return totalPayout;
  }
}

module.exports = SlotEngineService;