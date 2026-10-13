// Zero-dependency server: serves the static UI and proxies the Up API so the
// personal access token never reaches the browser.
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {}

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.UP_TOKEN;
const API = 'https://api.up.com.au/api/v1';
const MAX_PAGES = 20; // 100 txns per page

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
};

async function upGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.errors?.[0]?.detail || res.statusText;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchTransactions(params) {
  const q = new URLSearchParams({ 'page[size]': '100' });
  if (params.get('since')) q.set('filter[since]', new Date(params.get('since')).toISOString());
  if (params.get('until')) q.set('filter[until]', new Date(params.get('until') + 'T23:59:59').toISOString());
  const pages = Math.min(Number(params.get('pages')) || 3, MAX_PAGES);

  const [accounts, txns] = await Promise.all([
    upGet(`${API}/accounts`),
    (async () => {
      const out = [];
      let url = `${API}/transactions?${q}`;
      for (let i = 0; i < pages && url; i++) {
        const page = await upGet(url);
        out.push(...page.data);
        url = page.links?.next;
      }
      return { data: out, more: Boolean(url) };
    })(),
  ]);

  const names = Object.fromEntries(accounts.data.map(a => [a.id, a.attributes.displayName]));
  return {
    more: txns.more,
    transactions: txns.data.map(t => ({
      id: t.id,
      description: t.attributes.description,
      message: t.attributes.message,
      status: t.attributes.status,
      createdAt: t.attributes.createdAt,
      amount: Number(t.attributes.amount.valueInBaseUnits) / 100,
      currency: t.attributes.amount.currencyCode,
      account: names[t.relationships.account.data.id] || 'Unknown',
      category: t.relationships.category.data?.id || null,
    })),
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/transactions') {
    if (!TOKEN) return json(res, 500, { error: 'UP_TOKEN is not set. See README.' });
    try {
      return json(res, 200, await fetchTransactions(url.searchParams));
    } catch (e) {
      return json(res, e.status || 500, { error: e.message });
    }
  }
  const file = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(path.join(__dirname, 'public') + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`UpBudget running at http://localhost:${PORT}`));
