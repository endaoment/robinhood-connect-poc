# Robinhood Connect Offramp Integration

This project enables users to transfer crypto FROM their Robinhood accounts TO Endaoment using Robinhood Connect's offramp functionality.

## Quick Start

1. `cd robinhood-offramp`
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Robinhood API credentials
4. `npm run dev`

## Implementation Plans

See `.cursor/plans/robinhood-connect-poc/` for detailed implementation documentation.

## Environment Variables

- `ROBINHOOD_APP_ID`: Application ID provided by Robinhood team
- `ROBINHOOD_API_KEY`: API key provided by Robinhood team

## User Flow

1. User visits dashboard
2. User clicks "Transfer from Robinhood"
3. User selects asset, amount, and network
4. System generates referenceId and opens Robinhood app
5. User completes transfer in Robinhood
6. System redeems deposit address and displays to user
7. User sends crypto to displayed address

## Architecture

This integration uses Robinhood's stateless offramp flow with app linking, unlike traditional OAuth-based integrations. No user authentication is required on our side.

## Security

All Robinhood API keys are stored as environment variables and used only on the backend. The client never has access to sensitive credentials.
