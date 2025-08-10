import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GameInterfaceProps {
  isTestMode: boolean;
  nafflesConnected: boolean;
  onConnectionChange: () => void;
}

export default function GameInterface({ 
  isTestMode, 
  nafflesConnected, 
  onConnectionChange 
}: GameInterfaceProps) {
  const [balance, setBalance] = useState(isTestMode ? 10000 : 0);
  const [betAmount, setBetAmount] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameStatus, setGameStatus] = useState('ready');

  useEffect(() => {
    // Initialize game based on mode
    if (isTestMode) {
      setBalance(10000);
      setGameStatus('test-ready');
    } else if (nafflesConnected) {
      initializeNafflesGame();
    }
  }, [isTestMode, nafflesConnected]);

  const initializeNafflesGame = async () => {
    try {
      const response = await fetch('/api/game/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'live' })
      });
      
      if (response.ok) {
        setGameStatus('live-ready');
        // TODO: Set actual balance from Naffles API
      }
    } catch (error) {
      console.error('Failed to initialize Naffles game:', error);
      setGameStatus('error');
    }
  };

  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) return;

    setIsSpinning(true);
    
    try {
      if (isTestMode) {
        await handleTestSpin();
      } else {
        await handleLiveSpin();
      }
    } catch (error) {
      console.error('Spin failed:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleTestSpin = async () => {
    // Simulate spin delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple test logic - random win/loss
    const isWin = Math.random() > 0.7;
    const winAmount = isWin ? betAmount * (2 + Math.random() * 3) : 0;
    
    setBalance(prev => prev - betAmount + winAmount);
  };

  const handleLiveSpin = async () => {
    const response = await fetch('/api/game/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betAmount })
    });
    
    if (response.ok) {
      const result = await response.json();
      // TODO: Process live spin result
      console.log('Live spin result:', result);
    }
  };

  const resetTestCredits = () => {
    if (isTestMode) {
      setBalance(10000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Game Header */}
      <div className="flex justify-between items-center p-4 bg-black/30">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-crypto-gold crypto-glow">
            CryptoReels
          </h1>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            isTestMode 
              ? 'bg-orange-500 text-white' 
              : nafflesConnected 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
          }`}>
            {isTestMode ? 'TEST MODE' : nafflesConnected ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-300">Balance</div>
            <div className={`text-xl font-bold ${
              isTestMode ? 'text-orange-400' : 'text-crypto-gold'
            }`}>
              {balance.toLocaleString()} {isTestMode ? 'TEST' : 'CREDITS'}
            </div>
          </div>
          
          {isTestMode && (
            <button
              onClick={resetTestCredits}
              className="reset-credits-btn"
            >
              Reset Credits
            </button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Slot Machine Placeholder */}
          <motion.div
            className="bg-black/50 rounded-lg p-8 mb-8 neon-border"
            animate={isSpinning ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
          >
            <div className="grid grid-cols-6 gap-4 mb-8">
              {Array.from({ length: 6 }).map((_, reelIndex) => (
                <div key={reelIndex} className="space-y-2">
                  {Array.from({ length: Math.floor(Math.random() * 6) + 2 }).map((_, symbolIndex) => (
                    <motion.div
                      key={symbolIndex}
                      className="h-16 bg-gradient-to-br from-crypto-bitcoin to-crypto-ethereum rounded-lg flex items-center justify-center text-2xl"
                      animate={isSpinning ? { y: [-20, 0, -20] } : {}}
                      transition={{ 
                        duration: 0.3, 
                        repeat: isSpinning ? Infinity : 0,
                        delay: reelIndex * 0.1 + symbolIndex * 0.05
                      }}
                    >
                      {['₿', 'Ξ', '◎', '💎', '🚀', '⚡'][Math.floor(Math.random() * 6)]}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="text-center text-gray-300">
              <p className="text-lg mb-4">
                {isSpinning 
                  ? 'Spinning...' 
                  : isTestMode 
                    ? 'Test Mode - Free Play' 
                    : 'Ready to Play'
                }
              </p>
              <p className="text-sm opacity-75">
                Slot machine mechanics will be implemented in future tasks
              </p>
            </div>
          </motion.div>

          {/* Game Controls */}
          <div className="bg-black/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Bet Amount</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="1"
                    max={balance}
                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-crypto-gold focus:outline-none"
                  />
                </div>
                
                <div className="text-sm text-gray-300">
                  <div>Max Win: {(betAmount * 10).toLocaleString()}</div>
                  <div>Ways to Win: 117,649</div>
                </div>
              </div>
              
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || balance < betAmount}
                className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
                  isSpinning || balance < betAmount
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-crypto-gold to-crypto-bitcoin text-black hover:shadow-lg hover:shadow-crypto-gold/50'
                }`}
                whileHover={!isSpinning && balance >= betAmount ? { scale: 1.05 } : {}}
                whileTap={!isSpinning && balance >= betAmount ? { scale: 0.95 } : {}}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/30 text-center text-sm text-gray-400">
        <p>CryptoReels v1.0.0 - External Game for Naffles Platform</p>
        {!nafflesConnected && !isTestMode && (
          <p className="text-red-400 mt-1">
            Connection to Naffles platform lost. 
            <button 
              onClick={onConnectionChange}
              className="ml-2 text-blue-400 hover:text-blue-300 underline"
            >
              Retry Connection
            </button>
          </p>
        )}
      </div>
    </div>
  );
}