/**
 * CryptoReels Cascading Reels Service
 * Implements cascading mechanics where winning symbols disappear and new symbols fall down
 * with progressive multipliers for each cascade level
 */

class CascadingReelsService {
  constructor(slotEngineService) {
    this.slotEngine = slotEngineService;
    
    // Progressive multiplier system for cascades
    this.cascadeMultipliers = [1, 2, 3, 5, 8, 12, 20];
    this.maxCascades = 6;
  }

  /**
   * Process cascading reels for a spin result
   * @param {Array} initialReelResult - Initial reel configuration with symbols
   * @param {string} vrfNumber - VRF number for generating new symbols
   * @param {number} betAmount - Bet amount for payout calculations
   * @returns {Object} Complete cascade result with all levels
   */
  processCascadingReels(initialReelResult, vrfNumber, betAmount = 1) {
    const cascadeResults = [];
    let currentReels = JSON.parse(JSON.stringify(initialReelResult)); // Deep copy
    let vrfOffset = 256; // Start after initial symbol generation bits
    let cascadeLevel = 0;
    let totalWinnings = 0;

    // Process initial spin
    const initialWins = this.slotEngine.calculateWinningCombinations(currentReels);
    if (initialWins.hasWins) {
      const initialPayout = this.slotEngine.calculateTotalPayout(initialWins.combinations, betAmount);
      totalWinnings += initialPayout;
      
      cascadeResults.push({
        level: 0,
        reelState: JSON.parse(JSON.stringify(currentReels)),
        winningCombinations: initialWins.combinations,
        multiplier: this.cascadeMultipliers[0],
        levelPayout: initialPayout,
        totalPayout: totalWinnings
      });

      // Continue cascading while there are wins and we haven't hit max cascades
      let currentWins = initialWins;
      while (currentWins.hasWins && cascadeLevel < this.maxCascades) {
        cascadeLevel++;
        
        // Remove winning symbols and drop remaining symbols
        currentReels = this.removeWinningSymbols(currentReels, currentWins.combinations);
        currentReels = this.dropSymbolsDown(currentReels);
        
        // Generate new symbols for empty positions
        currentReels = this.generateNewSymbols(currentReels, vrfNumber, vrfOffset);
        vrfOffset += this.calculateVrfBitsNeeded(currentReels);
        
        // Check for new winning combinations
        const cascadeWins = this.slotEngine.calculateWinningCombinations(currentReels);
        
        if (cascadeWins.hasWins) {
          const cascadeMultiplier = this.cascadeMultipliers[Math.min(cascadeLevel, this.cascadeMultipliers.length - 1)];
          const basePayout = this.slotEngine.calculateTotalPayout(cascadeWins.combinations, betAmount);
          const multipliedPayout = basePayout * cascadeMultiplier;
          totalWinnings += multipliedPayout;
          
          cascadeResults.push({
            level: cascadeLevel,
            reelState: JSON.parse(JSON.stringify(currentReels)),
            winningCombinations: cascadeWins.combinations,
            multiplier: cascadeMultiplier,
            levelPayout: multipliedPayout,
            totalPayout: totalWinnings
          });
          
          // Update for next iteration
          currentWins = cascadeWins;
        } else {
          // No more wins, cascading stops
          break;
        }
      }
    }

    return {
      cascades: cascadeResults,
      finalReelState: currentReels,
      totalCascades: cascadeResults.length,
      totalWinnings: totalWinnings,
      maxMultiplierReached: cascadeResults.length > 0 ? 
        Math.max(...cascadeResults.map(c => c.multiplier)) : 1
    };
  }

  /**
   * Remove winning symbols from reels
   * @param {Array} reelResult - Current reel configuration
   * @param {Array} winningCombinations - Array of winning combinations
   * @returns {Array} Reel configuration with winning symbols removed
   */
  removeWinningSymbols(reelResult, winningCombinations) {
    const modifiedReels = JSON.parse(JSON.stringify(reelResult)); // Deep copy
    const symbolsToRemove = new Set();
    
    // Collect all winning symbol positions
    winningCombinations.forEach(combination => {
      combination.positions.forEach(position => {
        const key = `${position.reel}-${position.position}`;
        symbolsToRemove.add(key);
      });
    });
    
    // Mark winning symbols for removal (use null as placeholder)
    modifiedReels.forEach((reel, reelIndex) => {
      reel.symbols.forEach((symbol, symbolIndex) => {
        const key = `${reelIndex}-${symbolIndex}`;
        if (symbolsToRemove.has(key)) {
          reel.symbols[symbolIndex] = null; // Mark for removal
        }
      });
    });
    
    return modifiedReels;
  }

  /**
   * Drop remaining symbols down to fill empty spaces
   * @param {Array} reelResult - Reel configuration with null values for removed symbols
   * @returns {Array} Reel configuration with symbols dropped down
   */
  dropSymbolsDown(reelResult) {
    const droppedReels = JSON.parse(JSON.stringify(reelResult)); // Deep copy
    
    droppedReels.forEach(reel => {
      // Filter out null values (removed symbols) and keep remaining symbols
      const remainingSymbols = reel.symbols.filter(symbol => symbol !== null);
      
      // Create new symbol array with remaining symbols at the bottom
      const newSymbols = new Array(reel.height);
      
      // Fill from bottom up with remaining symbols
      for (let i = 0; i < reel.height; i++) {
        if (i < remainingSymbols.length) {
          newSymbols[reel.height - 1 - i] = remainingSymbols[remainingSymbols.length - 1 - i];
        } else {
          newSymbols[reel.height - 1 - i] = null; // Empty space at top
        }
      }
      
      reel.symbols = newSymbols;
    });
    
    return droppedReels;
  }

  /**
   * Generate new symbols for empty positions at the top of reels
   * @param {Array} reelResult - Reel configuration with empty spaces (null values)
   * @param {string} vrfNumber - VRF number for randomness
   * @param {number} vrfOffset - Bit offset in VRF number
   * @returns {Array} Reel configuration with new symbols generated
   */
  generateNewSymbols(reelResult, vrfNumber, vrfOffset) {
    const newReels = JSON.parse(JSON.stringify(reelResult)); // Deep copy
    const weightedSymbols = this.slotEngine.symbolConfig.createWeightedSymbolArray();
    let currentOffset = vrfOffset;
    
    newReels.forEach(reel => {
      reel.symbols.forEach((symbol, symbolIndex) => {
        if (symbol === null) {
          // Generate new symbol using VRF
          const symbolBits = this.slotEngine.extractBits(vrfNumber, currentOffset, 8);
          const symbolArrayIndex = symbolBits % weightedSymbols.length;
          const newSymbol = weightedSymbols[symbolArrayIndex];
          
          reel.symbols[symbolIndex] = newSymbol;
          currentOffset += 8;
        }
      });
    });
    
    return newReels;
  }

  /**
   * Calculate how many VRF bits are needed for new symbol generation
   * @param {Array} reelResult - Reel configuration
   * @returns {number} Number of bits needed
   */
  calculateVrfBitsNeeded(reelResult) {
    let emptyPositions = 0;
    
    reelResult.forEach(reel => {
      reel.symbols.forEach(symbol => {
        if (symbol === null) {
          emptyPositions++;
        }
      });
    });
    
    return emptyPositions * 8; // 8 bits per symbol
  }

  /**
   * Get cascade multiplier for a specific level
   * @param {number} cascadeLevel - Cascade level (0-based)
   * @returns {number} Multiplier for the level
   */
  getCascadeMultiplier(cascadeLevel) {
    return this.cascadeMultipliers[Math.min(cascadeLevel, this.cascadeMultipliers.length - 1)];
  }

  /**
   * Simulate a single cascade step (for testing)
   * @param {Array} reelResult - Current reel state
   * @param {Array} winningCombinations - Winning combinations to remove
   * @param {string} vrfNumber - VRF for new symbols
   * @param {number} vrfOffset - VRF bit offset
   * @returns {Object} Result of single cascade step
   */
  simulateCascadeStep(reelResult, winningCombinations, vrfNumber, vrfOffset) {
    // Remove winning symbols
    let modifiedReels = this.removeWinningSymbols(reelResult, winningCombinations);
    
    // Calculate VRF bits needed after symbol removal
    const vrfBitsUsed = this.calculateVrfBitsNeeded(modifiedReels);
    
    // Drop symbols down
    modifiedReels = this.dropSymbolsDown(modifiedReels);
    
    // Generate new symbols
    modifiedReels = this.generateNewSymbols(modifiedReels, vrfNumber, vrfOffset);
    
    // Check for new wins
    const newWins = this.slotEngine.calculateWinningCombinations(modifiedReels);
    
    return {
      reelState: modifiedReels,
      winningCombinations: newWins.combinations,
      hasWins: newWins.hasWins,
      vrfBitsUsed: vrfBitsUsed
    };
  }

  /**
   * Get maximum possible cascades
   * @returns {number} Maximum cascade levels
   */
  getMaxCascades() {
    return this.maxCascades;
  }

  /**
   * Get all cascade multipliers
   * @returns {Array} Array of multipliers
   */
  getCascadeMultipliers() {
    return [...this.cascadeMultipliers];
  }

  /**
   * Validate cascade result
   * @param {Object} cascadeResult - Result from processCascadingReels
   * @returns {boolean} True if valid
   */
  validateCascadeResult(cascadeResult) {
    if (!cascadeResult || typeof cascadeResult !== 'object') {
      return false;
    }
    
    const requiredFields = ['cascades', 'finalReelState', 'totalCascades', 'totalWinnings'];
    if (!requiredFields.every(field => cascadeResult.hasOwnProperty(field))) {
      return false;
    }
    
    if (!Array.isArray(cascadeResult.cascades)) {
      return false;
    }
    
    // Validate each cascade level
    return cascadeResult.cascades.every((cascade, index) => {
      return cascade.level === index &&
             Array.isArray(cascade.reelState) &&
             Array.isArray(cascade.winningCombinations) &&
             typeof cascade.multiplier === 'number' &&
             typeof cascade.levelPayout === 'number' &&
             typeof cascade.totalPayout === 'number';
    });
  }

  /**
   * Calculate cascade statistics
   * @param {Object} cascadeResult - Result from processCascadingReels
   * @returns {Object} Cascade statistics
   */
  calculateCascadeStatistics(cascadeResult) {
    if (!this.validateCascadeResult(cascadeResult)) {
      return null;
    }
    
    const stats = {
      totalCascades: cascadeResult.totalCascades,
      totalWinnings: cascadeResult.totalWinnings,
      averageMultiplier: 0,
      maxMultiplier: 0,
      cascadeBreakdown: []
    };
    
    if (cascadeResult.cascades.length > 0) {
      const multipliers = cascadeResult.cascades.map(c => c.multiplier);
      stats.averageMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / multipliers.length;
      stats.maxMultiplier = Math.max(...multipliers);
      
      stats.cascadeBreakdown = cascadeResult.cascades.map(cascade => ({
        level: cascade.level,
        multiplier: cascade.multiplier,
        payout: cascade.levelPayout,
        winCount: cascade.winningCombinations.length
      }));
    }
    
    return stats;
  }
}

module.exports = CascadingReelsService;