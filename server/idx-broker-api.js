import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

const router = express.Router();

const IDX_BROKER_API_KEY = process.env.IDX_BROKER_API_KEY;
const IDX_BROKER_BASE_URL = 'https://api.idxbroker.com/rets/results';

// Endpoint to fetch featured listings
router.get('/idx/listings/featured', async (req, res) => {
  if (!IDX_BROKER_API_KEY) {
    return res.status(500).json({ error: 'IDX Broker API Key not configured.' });
  }
  try {
    const response = await axios.get(`${IDX_BROKER_BASE_URL}/featured`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accesskey': IDX_BROKER_API_KEY,
        'outputtype': 'json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching featured listings:', error.message);
    res.status(500).json({ error: 'Failed to retrieve featured listings.' });
  }
});

// Endpoint to search listings
router.get('/idx/listings/search', async (req, res) => {
  if (!IDX_BROKER_API_KEY) {
    return res.status(500).json({ error: 'IDX Broker API Key not configured.' });
  }
  try {
    const searchParams = new URLSearchParams();
    
    // Add any query parameters from the request
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });
    
    searchParams.append('outputtype', 'json');

    console.log(`Searching with params: ${searchParams.toString()}`);

    const response = await axios.get(`${IDX_BROKER_BASE_URL}/listings/search`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accesskey': IDX_BROKER_API_KEY,
      },
      params: searchParams
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching search results:', error.message);
    res.status(500).json({ error: 'Failed to retrieve MLS listings.' });
  }
});

export const idxBrokerRoutes = router;