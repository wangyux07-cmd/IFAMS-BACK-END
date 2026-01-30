const NodeCache = new Map();

async function fetchWithFallback(url) {
  const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
  const res = await fetchFn(url);
  const json = await res.json();
  return json;
}

function getCached(symbol) {
  const entry = NodeCache.get(symbol);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    NodeCache.delete(symbol);
    return null;
  }
  return entry.value;
}

function setCached(symbol, value, ttlMs = 60 * 1000) {
  NodeCache.set(symbol, { value, expires: Date.now() + ttlMs });
}

async function getQuote(symbol) {
  if (!symbol) throw new Error('Missing symbol');
  const cached = getCached(symbol);
  if (cached) return cached;

  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_KEY not configured');

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const json = await fetchWithFallback(url);

  if (json.Note) throw new Error(`Alpha Vantage limit: ${json.Note}`);
  if (json['Error Message']) throw new Error(`Alpha Vantage error: ${json['Error Message']}`);

  const quote = json['Global Quote'] || {};
  const priceRaw = quote['05. price'] || quote['05. Price'] || null;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const result = { symbol: quote['01. symbol'] || symbol, price, raw: json };
  setCached(symbol, result, 60 * 1000);
  return result;
}

module.exports = { getQuote };
