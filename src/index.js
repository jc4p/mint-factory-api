#!/usr/bin/env bun

/**
 * Mint Factory API Server
 * API server that handles collection creation requests
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Verify API key middleware
const verifyApiKey = (app) =>
  app.derive(({ headers }) => {
    const apiKey = headers['x-api-key'];
    
    if (!apiKey || apiKey !== API_KEY) {
      throw new Error('Invalid API key');
    }
    
    return {};
  });

// Deploy contract through local mint factory server
async function createCollection(params) {
  try {
    const { 
      hash: collectionHash,
      fid: numericFid,
      creatorAddress,
      collectionName,
      baseURI,
      price,
      maxMints,
      symbol 
    } = params;
    
    // Validate required parameters
    if (!creatorAddress) {
      return {
        success: false,
        error: "Missing required parameter: creatorAddress"
      };
    }
    
    // Call local mint factory server
    const response = await fetch('http://localhost:7890/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_uri: baseURI,
        name: collectionName,
        symbol: symbol !== undefined && symbol !== null ? symbol : 'FCNFT', // Use provided symbol or fallback to 'FCNFT'
        price: price !== undefined ? price : '0.00005 ether',
        recipient: creatorAddress,
        max_supply: maxMints !== undefined && maxMints !== null ? maxMints : 0,
        manual_verify: false
      })
    });
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error("Error creating collection:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}

// Create Elysia server
const app = new Elysia()
  .use(cors({
    origin: '*', // Allow all origins - you may want to restrict this in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Api-Key']
  }))
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok'
  }))
  // Collection creation endpoint with API key verification
  .use(verifyApiKey)
  .post('/create-collection', async ({ body }) => {
    try {
      return await createCollection(body);
    } catch (error) {
      console.error("Error in /create-collection:", error);
      return {
        success: false,
        error: error.message || "Internal server error"
      };
    }
  })
  // Handle 404
  .onError(({ code, error }) => {
    if (code === 'NOT_FOUND') {
      return {
        success: false,
        error: 'Endpoint not found'
      };
    }
    
    if (error.message === 'Invalid API key') {
      return {
        success: false,
        error: 'Unauthorized: Invalid API key',
        code: 401
      };
    }
    
    return {
      success: false,
      error: error.message || 'Internal server error'
    };
  })
  .listen({
    port: PORT,
    timeout: 90000 // 90 second timeout for long-running requests
  });

const server = app.server;
const actualPort = server?.port || PORT;
console.log(`Mint Factory API Server running at http://localhost:${actualPort}`);
