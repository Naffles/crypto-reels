import { useEffect, useState } from 'react';
import Head from 'next/head';
import GameInterface from '../components/GameInterface';
import TestModeController from '../components/TestModeController';
import { setupIframeIntegration, iframeMessenger } from '../utils/iframe';

export default function Home() {
  const [isTestMode, setIsTestMode] = useState(false);
  const [nafflesConnected, setNafflesConnected] = useState(false);

  useEffect(() => {
    // Setup iframe integration
    setupIframeIntegration();
    
    // Check Naffles platform connection on mount
    checkNafflesConnection();
    
    // Notify parent that game is ready
    if (iframeMessenger.isInIframe()) {
      iframeMessenger.notifyGameInitialized('crypto-reels-session');
    }
  }, []);

  const checkNafflesConnection = async () => {
    try {
      const response = await fetch('/api/naffles/health', { 
        timeout: 3000 
      });
      
      if (response.ok) {
        setNafflesConnected(true);
        setIsTestMode(false);
      } else {
        throw new Error('Naffles not available');
      }
    } catch (error) {
      console.log('Naffles platform not available, entering test mode');
      setNafflesConnected(false);
      setIsTestMode(true);
    }
  };

  return (
    <>
      <Head>
        <title>CryptoReels - Crypto Slot Machine</title>
        <meta name="description" content="CryptoReels - The ultimate crypto-themed slot machine game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Iframe-specific meta tags */}
        <meta name="referrer" content="origin" />
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      </Head>

      <main className="h-screen w-full overflow-hidden">
        {isTestMode && <TestModeController />}
        
        <div className={`h-full ${isTestMode ? 'pt-12' : ''}`}>
          <GameInterface 
            isTestMode={isTestMode}
            nafflesConnected={nafflesConnected}
            onConnectionChange={checkNafflesConnection}
          />
        </div>
      </main>
    </>
  );
}