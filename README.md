# Mint Factory API

API server that handles NFT collection creation requests and interacts with a local deployment server.

## Features

- API key authentication
- Health check endpoint
- Collection creation endpoint
- Integration with local mint factory deployment service

## Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Copy `.env.example` to `.env` and configure your API key and middleware URL
4. Start the server: `bun run dev`

## API Endpoints

### GET /health

Health check endpoint to verify the server is running.

### POST /create-collection

Creates a new NFT collection.

**Headers:**
- `X-Api-Key`: Your API key (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "hash": "collection-hash",
  "fid": 123456,
  "creatorAddress": "0x1234...",
  "collectionName": "My Collection",
  "baseURI": "https://example.com/metadata/",
  "price": "0.00005 ether",
  "maxMints": 1000,
  "symbol": "FCNFT"
}
```

**Parameters:**
- `creatorAddress`: Required - Ethereum address of the collection creator
- `hash`: Collection hash identifier
- `fid`: Numeric FID
- `collectionName`: Name of the NFT collection
- `baseURI`: Base URI for NFT metadata
- `price`: Optional - Mint price (defaults to "0.00005 ether"). Can be set to 0 for free mints.
- `maxMints`: Optional - Maximum number of allowed mints (defaults to 0 if undefined or null)
- `symbol`: Optional - Collection symbol (defaults to "FCNFT")

## Development

- Run in development mode: `bun run dev`
- Run in production mode: `bun run start`
