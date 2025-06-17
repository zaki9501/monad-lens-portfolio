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
  const response = await fetchBlockvision("account/nfts", { address, pageIndex });
  
  if (response?.result?.data) {
    const flattenedNFTs: any[] = [];
    response.result.data.forEach((collection: any) => {
      const collectionName = collection.name || collection.contractAddress;
      const collectionImage = collection.image;
      const collectionErcStandard = collection.ercStandard;
      const collectionVerified = collection.verified;

      collection.items.forEach((item: any) => {
        flattenedNFTs.push({
          ...item,
          collection_name: collectionName,
          image_url: item.image || collectionImage, // Use item image if available, else collection image
          ercStandard: collectionErcStandard,
          verified: collectionVerified,
        });
      });
    });
    
    return {
      result: {
        data: flattenedNFTs,
        total: response.result.total,
        nextPageIndex: response.result.nextPageIndex,
        unknownTotal: response.result.unknownTotal,
        verifiedTotal: response.result.verifiedTotal,
        collectionTotal: response.result.collectionTotal,
      }
    };
  }
  return response;
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

export async function getTokenGating(account: string, contractAddress: string) {
  return fetchBlockvision("token/gating", { account, contractAddress });
}

export async function fetchAccountActivities(address: string, apiKey: string, limit = 20) {
  const url = `https://api.blockvision.org/v2/monad/account/activities?address=${address}&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}
