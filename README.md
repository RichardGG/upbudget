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

## Caching

Transactions are cached in the browser (IndexedDB, one cache per token), so the first load pulls the full
history and later loads only fetch the last 14 days (to pick up pending transactions settling), plus any older
history you newly ask for. Use **Clear cache & reload** to refetch everything. Nothing leaves your browser.

## Features

- Last 10 years by default (up to 30,000 transactions), editable date range
- Filter by account, search by description/message/category
- Money in / out / net totals (internal transfers excluded)
- Home loan offset: loan balance minus the combined balance of all other accounts, with debt remaining
  - Graph of loan balance, offset balance and debt remaining over time (rebuilt from transaction history; hover or use arrow keys for values, table view below)
  - Payoff projections (last 3 months, last 12 months and all-history pace) shown as dashed lines with estimated payoff dates
- Transactions list grouped by pay cycle (collapsible, newest open), with a "Regulars only" filter
  - Each pay cycle header has a coloured category-breakdown line; each purchase has a bar and % showing its share of that cycle's spending
- Money flow diagram: external income → accounts, plus net transfers between accounts
- Spending flow diagram: outgoing money from categories (or subcategories) to your top vendors (up to 100), with hover highlighting; tap a vendor to review it
- Transaction times (Sydney/Melbourne time) and a highlight on lunch-time purchases (11am-1pm)
- Regular payments: detects weekly, fortnightly, monthly, quarterly and yearly payees from the last 10 years, with typical amount, next due date and estimated monthly cost
- Spending per pay cycle: detects your salary, then shows spending per pay cycle by category (confirmed regulars grouped separately), as a stacked chart and a table
- Custom categories: set a category for a whole vendor or a single transaction (or create new ones); stored in your browser only, Up is not changed
  - Tap any amount in the table (or a chart segment) to see the transactions behind it
  - Table cells are shaded warm/cool by how far they are above or below that row's average; a memo row shows lunch-time (11am-1pm) spending
  - Tick the payees that really are regular; choices are saved in your browser and can be filtered with "Confirmed only"
  - Tap any transaction to see that vendor's earlier transactions and mark the whole vendor, or individual payments, as regular

## Local preview

`python3 -m http.server` and open http://localhost:8000
