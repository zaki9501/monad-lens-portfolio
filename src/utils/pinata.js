import axios from 'axios';

export const uploadToIPFS = async (walletAddress, overallScore, metrics, artData, svgElement) => {
  try {
    if (!svgElement) throw new Error('SVG element not found');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });

    const svgFormData = new FormData();
    svgFormData.append('file', svgBlob, `reputation-art-${walletAddress.slice(0, 8)}.svg`);
    svgFormData.append('pinataMetadata', JSON.stringify({ name: `Reputation Art #${walletAddress.slice(0, 8)}` }));
    svgFormData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const svgResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      svgFormData,
      { headers: { Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}` } }
    );
    const imageHash = svgResponse.data.IpfsHash;

    const metadata = {
      name: `Reputation Art #${walletAddress.slice(0, 8)}`,
      description: artData.isLoreMode
        ? 'A transcendent visualization of your digital consciousness on Monad.'
        : 'A unique artwork representing your blockchain reputation on Monad.',
      image: `ipfs://${imageHash}`,
      attributes: [
        { trait_type: 'Score', value: overallScore },
        { trait_type: 'Total Transactions', value: metrics.totalTransactions },
        { trait_type: 'Diversity Score', value: metrics.diversityScore },
        { trait_type: 'Activity', value: metrics.transactionFrequency },
        { trait_type: 'Longevity', value: metrics.firstTransactionAge },
        { trait_type: 'Rarity', value: overallScore >= 80 ? 'Legendary' : overallScore >= 60 ? 'Epic' : overallScore >= 40 ? 'Rare' : 'Common' },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob, `metadata-${walletAddress.slice(0, 8)}.json`);
    metadataFormData.append('pinataMetadata', JSON.stringify({ name: `Reputation Art Metadata #${walletAddress.slice(0, 8)}` }));

    const metadataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      metadataFormData,
      { headers: { Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}` } }
    );

    return metadataResponse.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw error;
  }
};