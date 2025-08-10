const express = require('express');
const router = express.Router();

// Health check for Naffles platform connection
router.get('/health', async (req, res) => {
  try {
    // Check if Naffles API is reachable
    const nafflesApiUrl = process.env.NAFFLES_API_URL || 'http://localhost:3001';
    
    try {
      const healthResponse = await fetch(`${nafflesApiUrl}/api/health`, {
        method: 'GET',
        timeout: 3000
      });
      
      if (healthResponse.ok) {
        res.json({
          success: true,
          status: 'connected',
          nafflesApiUrl,
          message: 'Naffles platform is reachable',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(`Naffles API returned status: ${healthResponse.status}`);
      }
    } catch (fetchError) {
      throw new Error(`Cannot reach Naffles platform: ${fetchError.message}`);
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message,
      status: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize gaming session with NFT data
router.post('/initialize-gaming', async (req, res) => {
  try {
    const { playerId, gameType, tokenType, betAmount, nafflesSessionToken } = req.body;
    
    if (!playerId || !gameType || !tokenType || !betAmount || !nafflesSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: playerId, gameType, tokenType, betAmount, nafflesSessionToken'
      });
    }

    const nafflesApiUrl = process.env.NAFFLES_API_URL || 'http://localhost:3001';
    
    try {
      const initResponse = await fetch(`${nafflesApiUrl}/api/wagering/initialize-gaming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nafflesSessionToken}`
        },
        body: JSON.stringify({
          gameType,
          tokenType,
          betAmount,
          thirdPartyGameId: `crypto_reels_${Date.now()}`
        })
      });

      if (initResponse.ok) {
        const initData = await initResponse.json();
        res.json({
          success: true,
          data: initData.data,
          message: 'Gaming session initialized with NFT data'
        });
      } else {
        const errorText = await initResponse.text();
        throw new Error(`Naffles API error: ${errorText}`);
      }
    } catch (fetchError) {
      throw new Error(`Failed to initialize gaming session: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Gaming session initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh player NFT data
router.post('/refresh-nfts', async (req, res) => {
  try {
    const { playerId, gameType, nafflesSessionToken } = req.body;
    
    if (!playerId || !gameType || !nafflesSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: playerId, gameType, nafflesSessionToken'
      });
    }

    const nafflesApiUrl = process.env.NAFFLES_API_URL || 'http://localhost:3001';
    
    try {
      const refreshResponse = await fetch(`${nafflesApiUrl}/api/wagering/refresh-player-nfts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nafflesSessionToken}`
        },
        body: JSON.stringify({
          playerId,
          gameType
        })
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        res.json({
          success: true,
          data: refreshData.data,
          message: 'NFT data refreshed successfully'
        });
      } else {
        const errorText = await refreshResponse.text();
        throw new Error(`Naffles API error: ${errorText}`);
      }
    } catch (fetchError) {
      throw new Error(`Failed to refresh NFT data: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('NFT refresh error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate NFT ownership
router.post('/validate-nft', async (req, res) => {
  try {
    const { playerId, contractAddress, tokenId, nafflesSessionToken } = req.body;
    
    if (!playerId || !contractAddress || !tokenId || !nafflesSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: playerId, contractAddress, tokenId, nafflesSessionToken'
      });
    }

    const nafflesApiUrl = process.env.NAFFLES_API_URL || 'http://localhost:3001';
    
    try {
      const validateResponse = await fetch(`${nafflesApiUrl}/api/wagering/validate-nft-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nafflesSessionToken}`
        },
        body: JSON.stringify({
          playerId,
          contractAddress,
          tokenId
        })
      });

      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        res.json({
          success: true,
          data: validateData.data,
          message: 'NFT ownership validated'
        });
      } else {
        const errorText = await validateResponse.text();
        throw new Error(`Naffles API error: ${errorText}`);
      }
    } catch (fetchError) {
      throw new Error(`Failed to validate NFT ownership: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('NFT validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// VRF randomness request
router.post('/vrf', async (req, res) => {
  try {
    const { sessionId, bitsNeeded = 256, nafflesSessionToken } = req.body;
    
    if (!sessionId || !nafflesSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: sessionId, nafflesSessionToken'
      });
    }

    const nafflesApiUrl = process.env.NAFFLES_API_URL || 'http://localhost:3001';
    
    try {
      const vrfResponse = await fetch(`${nafflesApiUrl}/api/vrf/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nafflesSessionToken}`
        },
        body: JSON.stringify({
          sessionId,
          bitsNeeded
        })
      });

      if (vrfResponse.ok) {
        const vrfData = await vrfResponse.json();
        res.json({
          success: true,
          vrfNumber: vrfData.randomness,
          requestId: vrfData.requestId,
          message: 'VRF randomness generated'
        });
      } else {
        // Fallback to local randomness for development
        console.warn('VRF request failed, using fallback randomness');
        res.json({
          success: true,
          vrfNumber: '0x' + Array.from({length: bitsNeeded/4}, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          requestId: `fallback_${Date.now()}`,
          message: 'Using fallback randomness (development mode)',
          fallback: true
        });
      }
    } catch (fetchError) {
      // Fallback to local randomness
      console.warn('VRF request failed, using fallback randomness:', fetchError.message);
      res.json({
        success: true,
        vrfNumber: '0x' + Array.from({length: bitsNeeded/4}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        requestId: `fallback_${Date.now()}`,
        message: 'Using fallback randomness (development mode)',
        fallback: true
      });
    }
  } catch (error) {
    console.error('VRF request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;