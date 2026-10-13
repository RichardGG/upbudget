# UpBudget

A basic web app that pulls your transactions from the [Up banking API](https://developer.up.com.au/).

## Setup

1. Create a personal access token at https://api.up.com.au/getting_started
2. `cp .env.example .env` and set `UP_TOKEN`
3. `npm start` (Node 18+, no dependencies) and open http://localhost:3000

The token stays on the server; the browser only talks to `/api/transactions`.

## Features

- Transactions across all accounts for a date range (default: last 30 days, up to 500)
- Filter by account, search by description/message/category
- Money in / out / net totals (internal transfers are excluded)
