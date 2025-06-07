const API_BASE = "https://api.blockvision.org/v2/monad";
const API_KEY = import.meta.env.VITE_BLOCKVISION_API_KEY;

async function fetchBlockvision(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value);
  });
  const res = await fetch(url.toString(), {
    headers: {
      "accept": "application/json",
      "x-api-key": API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Blockvision API error: ${res.status}`);
  return res.json();
}

export async function getAccountTokens(address: string) {
  return fetchBlockvision("account/tokens", { address });
}

export async function getAccountNFTs(address: string, pageIndex = 1) {
  return fetchBlockvision("account/nfts", { address, pageIndex });
}

export async function getAccountActivities(address: string, limit = 20) {
  return fetchBlockvision("account/activities", { address, limit });
}

export async function getAccountTransactions(address: string, limit = 20) {
  return fetchBlockvision("account/transactions", { address, limit });
}

export async function getAccountInternalTransactions(address: string, filter = "all", limit = 20) {
  return fetchBlockvision("account/internal/transactions", { address, filter, limit });
} 