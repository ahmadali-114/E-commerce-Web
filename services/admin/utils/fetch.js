const axios = require('axios');

const SERVICES = {
  product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3004',
};

const TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromService(service, endpoint, method = 'GET', data = null, token = null) {
  const baseUrl = SERVICES[service];
  if (!baseUrl) throw new Error(`Unknown service: ${service}`);

  const url = `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = token;

  // For GET/HEAD requests, never send a body
  const requestConfig = { method, url, headers, timeout: TIMEOUT };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestConfig.data = data;
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`[${service}] Request failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) throw error;
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY * attempt);
    }
  }
  throw lastError;
}

const fetchProduct = (endpoint, method = 'GET', data = null, token = null) =>
  fetchFromService('product', endpoint, method, data, token);
const fetchOrder = (endpoint, method = 'GET', data = null, token = null) =>
  fetchFromService('order', endpoint, method, data, token);
const fetchUser = (endpoint, method = 'GET', data = null, token = null) =>
  fetchFromService('user', endpoint, method, data, token);

async function batchFetch(requests, token) {
  const promises = requests.map(req => {
    const { service, endpoint, method = 'GET', data = null } = req;
    return fetchFromService(service, endpoint, method, data, token);
  });
  return Promise.all(promises);
}

module.exports = { fetchFromService, fetchProduct, fetchOrder, fetchUser, batchFetch, SERVICES };