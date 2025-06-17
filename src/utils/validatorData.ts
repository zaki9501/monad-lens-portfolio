// Country coordinates (latitude, longitude)
const countryCoordinates: { [key: string]: [number, number] } = {
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
  'CA': [56.1304, -106.3468],// Canada
  'SE': [60.1282, 18.6435],  // Sweden
  'AT': [47.5162, 14.5501],  // Austria
  'IN': [20.5937, 78.9629],  // India
  'ZA': [-30.5595, 22.9375], // South Africa
  'JP': [36.2048, 138.2529], // Japan
  'PL': [51.9194, 19.1451],  // Poland
  'AU': [-25.2744, 133.7751],// Australia
  'TR': [38.9637, 35.2433],  // Turkey
};

export interface Validator {
  name: string;
  successRate: number;
  stake: number;
  country: string;
  status: string;
  coordinates?: [number, number];
}

export const validators: Validator[] = [
  { name: '01no.de/monad-testnet-node01', successRate: 99.7, stake: 20, country: 'RO', status: 'active' },
  { name: 'a41.io/monad-testnet', successRate: 95, stake: 20, country: 'FR', status: 'active' },
  { name: 'allnodes.dev/monad-testnet', successRate: 99.6, stake: 20, country: 'DE', status: 'active' },
  { name: 'artifact.systems/monad-test-val1', successRate: 100, stake: 20, country: 'IE', status: 'active' },
  { name: 'asymmetric.re/tsw-sel1-monad-testnet-val1.nodes', successRate: 96.7, stake: 20, country: 'KR', status: 'active' },
  { name: 'bdnodes.net/smoke-lagos-61446.monad', successRate: 99.6, stake: 20, country: 'SG', status: 'active' },
  { name: 'bharvest.io/monad-devnet', successRate: 100, stake: 20, country: 'SG', status: 'active' },
  { name: 'bwarelabs.app/monad.devnet', successRate: 100, stake: 20, country: 'SG', status: 'active' },
  { name: 'ccvalidators.com/validator.monad-testnet', successRate: 100, stake: 20, country: 'DE', status: 'active' },
  { name: 'chainode.tech/monad-validator-testnet1', successRate: 100, stake: 20, country: 'FI', status: 'active' },
  // Singapore validators
  { name: 'sg-validator-01.monad.network', successRate: 99.8, stake: 25, country: 'SG', status: 'active' },
  { name: 'sg-validator-02.monad.network', successRate: 99.9, stake: 30, country: 'SG', status: 'active' },
  { name: 'sg-validator-03.monad.network', successRate: 99.7, stake: 22, country: 'SG', status: 'active' },
  { name: 'sg-validator-04.monad.network', successRate: 99.5, stake: 28, country: 'SG', status: 'active' },
  { name: 'sg-validator-05.monad.network', successRate: 99.6, stake: 26, country: 'SG', status: 'active' },
  { name: 'sg-validator-06.monad.network', successRate: 99.8, stake: 24, country: 'SG', status: 'active' },
  { name: 'sg-validator-07.monad.network', successRate: 99.7, stake: 27, country: 'SG', status: 'active' },
  { name: 'sg-validator-08.monad.network', successRate: 99.9, stake: 29, country: 'SG', status: 'active' },
  { name: 'sg-validator-09.monad.network', successRate: 99.6, stake: 23, country: 'SG', status: 'active' },
  { name: 'sg-validator-10.monad.network', successRate: 99.8, stake: 25, country: 'SG', status: 'active' },
  { name: 'sg-validator-11.monad.network', successRate: 99.7, stake: 28, country: 'SG', status: 'active' },
  { name: 'sg-validator-12.monad.network', successRate: 99.9, stake: 30, country: 'SG', status: 'active' },
  { name: 'sg-validator-13.monad.network', successRate: 99.8, stake: 26, country: 'SG', status: 'active' },
  { name: 'sg-validator-14.monad.network', successRate: 99.7, stake: 24, country: 'SG', status: 'active' },
  { name: 'sg-validator-15.monad.network', successRate: 99.6, stake: 27, country: 'SG', status: 'active' },
  // Add more validators as needed...
].map(validator => ({
  ...validator,
  coordinates: countryCoordinates[validator.country]
}));

export const getValidatorCoordinates = (countryCode: string): [number, number] | undefined => {
  return countryCoordinates[countryCode];
}; 