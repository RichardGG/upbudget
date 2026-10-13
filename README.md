# UpBudget

A static web app (hosted on GitHub Pages) that shows your transactions from the [Up banking API](https://developer.up.com.au/).

## Use

1. Enable Pages: repo **Settings → Pages → Source: GitHub Actions**. Pushes to `main` deploy `index.html` automatically.
2. Open the site, expand **Settings**, and paste a personal access token from https://api.up.com.au/getting_started.

The token is kept in your browser's localStorage and sent only to the API base URL.
Don't use this on a shared computer.

## CORS

Browsers can only call the Up API directly if it allows cross-origin requests. If you see a
"Network/CORS error", deploy `worker/cors-proxy.js` as a Cloudflare Worker (edit `ALLOWED_ORIGIN`
first) and put the worker URL in the **API base URL** setting (e.g. `https://upproxy.you.workers.dev/api/v1`).

## Features

- Last 2 years by default (up to 10,000 transactions), editable date range
- Filter by account, search by description/message/category
- Money in / out / net totals (internal transfers excluded)
- Money flow diagram: external income → accounts, plus net transfers between accounts
- Regular payments: detects weekly, fortnightly, monthly, quarterly and yearly payees from the last 2 years, with typical amount, next due date and estimated monthly cost

## Local preview

`python3 -m http.server` and open http://localhost:8000
