// Country coordinates (approximate center points)
const countryCoordinates: Record<string, [number, number]> = {
  'RO': [45.9432, 24.9668],  // Romania
  'FR': [46.2276, 2.2137],   // France
  'DE': [51.1657, 10.4515],  // Germany
  'IE': [53.1424, -7.6921],  // Ireland
  'KR': [35.9078, 127.7669], // South Korea
  'SG': [1.3521, 103.8198],  // Singapore
  'FI': [61.9241, 25.7482],  // Finland
  'NL': [52.1326, 5.2913],   // Netherlands
  'US': [37.0902, -95.7129], // United States
  'LT': [55.1694, 23.8813],  // Lithuania
  'SE': [60.1282, 18.6435],  // Sweden
  'CA': [56.1304, -106.3468],// Canada
  'AT': [47.5162, 14.5501],  // Austria
  'IN': [20.5937, 78.9629],  // India
  'ZA': [-30.5595, 22.9375], // South Africa
  'JP': [36.2048, 138.2529], // Japan
  'PL': [51.9194, 19.1451],  // Poland
  'AU': [-25.2744, 133.7751],// Australia
  'TR': [38.9637, 35.2433],  // Turkey
};

export interface Validator {
  address: string;
  name: string;
  country: string;
  status: string;
  blocksProduced: number;
  successRate: number;
  coordinates?: [number, number];
}

export const validators: Validator[] = [
  { address: '01no.de', name: 'monad-testnet-node01', country: 'RO', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'a41.io', name: 'monad-testnet', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'allnodes.dev', name: 'monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'artifact.systems', name: 'monad-test-val1', country: 'IE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'asymmetric.re', name: 'tsw-sel1-monad-testnet-val1.nodes', country: 'KR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'bdnodes.net', name: 'smoke-lagos-61446.monad', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'bharvest.io', name: 'monad-devnet', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'bwarelabs.app', name: 'monad.devnet', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'ccvalidators.com', name: 'validator.monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'chainode.tech', name: 'monad-validator-testnet1', country: 'FI', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'chorus.one', name: 'monad-testnet', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'cogentcrypto.io', name: 'monad.testnet', country: 'FI', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'contributiondao.com', name: 'monad-testnet', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'cosmostation.io', name: 'monad-testnet-validator', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-001', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-002', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-003', country: 'LT', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-004', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-005', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-006', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-007', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-008', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-009', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-010', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-011', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-012', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-013', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-014', country: 'SE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'devcore4.com', name: 'testnet-015', country: 'LT', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'dsrvlabs.dev', name: 'devnet.monad', country: 'FI', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'everstake.one', name: 'monad-testnet', country: 'AT', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'figment.io', name: 'monad.testnet', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'flipside.services', name: 'val.tn.monad', country: 'IN', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'gmonads.com', name: 'testnet', country: 'ZA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'h2o-nodes.com', name: 'monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'informalsystems.io', name: 'monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'infstones.io', name: 'monad.testnet', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'kiln.fi', name: 'validator-0.monad.testnet', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'laine.one', name: 'testnet.monad', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'laminatedlabs.net', name: 'monad.validators', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'lemniscap.dev', name: 'testnet.monad', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'lgns.xyz', name: 'monad.testnet', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-arn-001', country: 'SE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-arn-002', country: 'SE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-arn-003', country: 'SE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-fra-002', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-fra-003', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-cs-fra-004', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-cdg-001', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-cdg-002', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-fra-005', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-fra-006', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-jfk-005', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-jfk-006', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-jfk-007', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-jfk-009', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-ord-001', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-ord-002', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-ord-003', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-ord-004', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-tyo-006', country: 'JP', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-lsn-tyo-007', country: 'JP', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-bhs-002', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-bhs-005', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-bhs-006', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-bom-001', country: 'IN', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-bom-002', country: 'IN', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-gra-001', country: 'FR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-sgp-003', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-sgp-007', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-sgp-009', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-ovh-waw-001', country: 'PL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-ams-001', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-ewr-001', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-lax-001', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-pit-001', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-sgp-001', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-sgp-002', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-tyo-001', country: 'JP', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-tyo-002', country: 'JP', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-tyo-003', country: 'JP', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'monadinfra.com', name: 'mf-testnet-val-tsw-yvr-001', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'moonlet.cloud', name: 'monad-testnet', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'nodeinfra.com', name: 'monad-testnet-validator', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'p2p.org', name: 'validator-testnet-01.monad', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'piertwo.io', name: 't-monad', country: 'AU', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'polkachu.com', name: 'monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'pops.one', name: 'monad.testnet', country: 'NL', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'prostaking.com', name: 'pronad-tn1', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'prostaking.com', name: 'pronad-tn2', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'qubelabs.io', name: 'monad-testnet', country: 'TR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'rockx.com', name: 'monad-testnet', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'rpcpool.com', name: 'validator.valnet.monad', country: 'SG', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'stake.fish', name: 'monad-testnet', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'stakin-nodes.com', name: 'monad-testnet-1', country: 'TR', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'staking4all.org', name: 'monad-devnet-01', country: 'DE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'staking4all.org', name: 'monad-devnet-02', country: 'CA', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'stakingfacilities.com', name: 'testnet-monad', country: 'SE', status: 'active', blocksProduced: 0, successRate: 0 },
  { address: 'validationcloud.io', name: 'monad-testnet-1.validator', country: 'US', status: 'active', blocksProduced: 0, successRate: 0 },
].map(validator => ({
  ...validator,
  coordinates: countryCoordinates[validator.country]
}));

export const getValidatorCoordinates = (countryCode: string): [number, number] | undefined => {
  return countryCoordinates[countryCode];
}; 