const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Update the CORS configuration to be more specific
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// FatSecret API configuration
const CLIENT_ID = '17a30206874e4a0484b5ba0543735e46';
const CLIENT_SECRET = '9390fa7459384608b38ccedaa6bc494d';
const API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Helper function to generate OAuth signature
function generateOAuthSignature(method, url, params) {
  try {
    // Create a copy of params to avoid modifying the original
    const paramsCopy = { ...params };

    // Sort parameters alphabetically and encode properly
    const paramString = Object.keys(paramsCopy)
      .sort()
      .map(key => {
        let value = paramsCopy[key];
        // Encode both key and value according to OAuth 1.0a specs
        const encodedKey = encodeURIComponent(key)
          .replace(/!/g, '%21')
          .replace(/\*/g, '%2A')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
        
        let encodedValue = encodeURIComponent(value)
          .replace(/!/g, '%21')
          .replace(/\*/g, '%2A')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
        
        // Special handling for search_expression
        if (key === 'search_expression') {
          encodedValue = encodedValue.replace(/%20/g, '+');
        }
        
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');

    // Create signature base string with proper encoding
    const signatureBaseString = [
      method.toUpperCase(),
      encodeURIComponent(url)
        .replace(/!/g, '%21')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29'),
      encodeURIComponent(paramString)
        .replace(/!/g, '%21')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
    ].join('&');

    // Create signing key
    const signingKey = `${CLIENT_SECRET}&`;

    // Generate HMAC-SHA1 signature
    const hmac = crypto.createHmac('sha1', signingKey);
    hmac.update(signatureBaseString);
    return hmac.digest('base64');
  } catch (error) {
    console.error('Error generating signature:', error);
    console.error('Error details:', {
      method,
      url,
      params: JSON.stringify(params, null, 2)
    });
    throw error;
  }
}

// Add this near the other helper functions
function getCurrentTimestamp() {
  // Get UTC timestamp in seconds
  return Math.floor(new Date().getTime() / 1000);
}

// Health check endpoint
app.get('/api/fatsecret/health', (req, res) => {
  res.json({ status: 'OK', message: 'FatSecret API proxy server is running' });
});

// Search foods endpoint
app.post('/api/fatsecret/foods/search', async (req, res) => {
  try {
    const { query, pageNumber = 0 } = req.body;
    
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Use the getCurrentTimestamp function
    const timestamp = getCurrentTimestamp().toString();
    const nonce = crypto.randomBytes(16)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');

    const params = {
      format: 'json',
      max_results: '50',
      method: 'foods.search',
      oauth_consumer_key: CLIENT_ID,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
      page_number: pageNumber.toString(),
      search_expression: query.trim()
    };

    // Generate signature
    const signature = generateOAuthSignature('POST', API_URL, params);
    params.oauth_signature = signature;

    console.log('Request parameters:', {
      ...params,
      oauth_consumer_key: '[HIDDEN]',
      oauth_signature: '[HIDDEN]'
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params)
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('FatSecret API error response:', data);
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    res.json(data);

  } catch (error) {
    console.error('Error in foods search:', error);
    res.status(500).json({
      error: 'Failed to search foods',
      message: error.message
    });
  }
});

// Get food details endpoint
app.post('/api/fatsecret/food/get', async (req, res) => {
  try {
    const { foodId } = req.body;
    
    if (!foodId) {
      return res.status(400).json({ error: 'Food ID is required' });
    }
    
    const params = {
      method: 'food.get',
      food_id: foodId.toString(),
      oauth_consumer_key: CLIENT_ID,
      oauth_nonce: crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, ''),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      format: 'json'
    };

    // Changed from generateSignature to generateOAuthSignature
    const signature = generateOAuthSignature('POST', API_URL, params);
    params.oauth_signature = signature;

    console.log('Getting food details for ID:', foodId);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`FatSecret API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(`FatSecret API error: ${data.error.message || 'Unknown error'}`);
    }

    console.log('Food details:', data);
    res.json(data);
    
  } catch (error) {
    console.error('Error in food get:', error);
    res.status(500).json({ 
      error: 'Failed to get food details',
      message: error.message 
    });
  }
});

// Search recipes endpoint
app.post('/api/fatsecret/recipes/search', async (req, res) => {
  try {
    const { query, pageNumber = 0 } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const params = {
      method: 'recipes.search',
      search_expression: query.trim(),
      page_number: pageNumber.toString(),
      max_results: '20',
      oauth_consumer_key: CLIENT_ID,
      oauth_nonce: crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, ''),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      format: 'json'
    };

    // Changed from generateSignature to generateOAuthSignature
    const signature = generateOAuthSignature('POST', API_URL, params);
    params.oauth_signature = signature;

    console.log('Searching recipes for:', query);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`FatSecret API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(`FatSecret API error: ${data.error.message || 'Unknown error'}`);
    }

    console.log('Recipe results:', data);
    res.json(data);
    
  } catch (error) {
    console.error('Error in recipes search:', error);
    res.status(500).json({ 
      error: 'Failed to search recipes',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/fatsecret/health',
      'POST /api/fatsecret/foods/search',
      'POST /api/fatsecret/food/get',
      'POST /api/fatsecret/recipes/search'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`FatSecret API proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/fatsecret/health`);
});

module.exports = app;