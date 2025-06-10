
import axios from 'axios';

export const uploadToIPFS = async (walletAddress, overallScore, metrics, artData, svgElement) => {
  try {
    console.log('Starting IPFS upload process...');
    
    // Get the JWT token - try both VITE and REACT_APP prefixes
    const jwtToken = import.meta.env.VITE_PINATA_JWT || import.meta.env.REACT_APP_PINATA_JWT;
    
    if (!jwtToken) {
      throw new Error('Pinata JWT token not found in environment variables');
    }
    
    console.log('JWT token found, preparing SVG data...');
    
    // Get SVG content
    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    // Create metadata
    const metadata = {
      name: `Reputation Art #${overallScore}`,
      description: `Unique reputation art generated for wallet ${walletAddress} with score ${overallScore}`,
      attributes: [
        { trait_type: "Overall Score", value: overallScore },
        { trait_type: "Total Transactions", value: metrics.totalTransactions },
        { trait_type: "Diversity Score", value: metrics.diversityScore },
        { trait_type: "Transaction Frequency", value: metrics.transactionFrequency },
        { trait_type: "First Transaction Age", value: metrics.firstTransactionAge },
        { trait_type: "Wallet Address", value: walletAddress }
      ],
      image: "", // Will be filled after SVG upload
      external_url: `https://monadmindscope.com/wallet/${walletAddress}`
    };
    
    // Create FormData for SVG upload
    const svgFormData = new FormData();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    svgFormData.append('file', svgBlob, `reputation-art-${walletAddress.slice(0, 8)}.svg`);
    
    const svgPinataMetadata = JSON.stringify({
      name: `reputation-art-${walletAddress.slice(0, 8)}.svg`,
      keyvalues: {
        walletAddress: walletAddress,
        score: overallScore.toString()
      }
    });
    svgFormData.append('pinataMetadata', svgPinataMetadata);
    
    console.log('Uploading SVG to IPFS...');
    
    // Upload SVG to IPFS
    const svgResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      svgFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );
    
    const svgHash = svgResponse.data.IpfsHash;
    console.log('SVG uploaded successfully:', svgHash);
    
    // Update metadata with image URL
    metadata.image = `ipfs://${svgHash}`;
    
    // Create FormData for metadata upload
    const metadataFormData = new FormData();
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    metadataFormData.append('file', metadataBlob, `metadata-${walletAddress.slice(0, 8)}.json`);
    
    const metadataPinataMetadata = JSON.stringify({
      name: `metadata-${walletAddress.slice(0, 8)}.json`,
      keyvalues: {
        walletAddress: walletAddress,
        score: overallScore.toString(),
        type: 'metadata'
      }
    });
    metadataFormData.append('pinataMetadata', metadataPinataMetadata);
    
    console.log('Uploading metadata to IPFS...');
    
    // Upload metadata to IPFS
    const metadataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      metadataFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );
    
    const metadataHash = metadataResponse.data.IpfsHash;
    console.log('Metadata uploaded successfully:', metadataHash);
    
    return metadataHash;
    
  } catch (error) {
    console.error('IPFS upload failed:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Pinata API credentials. Please check your JWT token.');
    }
    
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};
