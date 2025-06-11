
import axios from 'axios';

// Function to convert SVG to PNG
const svgToPng = (svgElement, width = 800, height = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png', 1.0);
    };
    img.src = url;
  });
};

export const uploadToIPFS = async (walletAddress, overallScore, metrics, artData, svgElement) => {
  try {
    console.log('Starting IPFS upload process...');
    
    // Get the JWT token - try both VITE and REACT_APP prefixes
    const jwtToken = import.meta.env.VITE_PINATA_JWT || import.meta.env.REACT_APP_PINATA_JWT;
    
    if (!jwtToken) {
      throw new Error('Pinata JWT token not found in environment variables');
    }
    
    console.log('JWT token found, converting SVG to PNG...');
    
    // Convert SVG to PNG
    const pngBlob = await svgToPng(svgElement, 800, 800);
    
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
      image: "", // Will be filled after PNG upload
      external_url: `https://monadmindscope.com/wallet/${walletAddress}`
    };
    
    // Create FormData for PNG upload
    const imageFormData = new FormData();
    imageFormData.append('file', pngBlob, `reputation-art-${walletAddress.slice(0, 8)}.png`);
    
    const imagePinataMetadata = JSON.stringify({
      name: `reputation-art-${walletAddress.slice(0, 8)}.png`,
      keyvalues: {
        walletAddress: walletAddress,
        score: overallScore.toString(),
        type: 'image'
      }
    });
    imageFormData.append('pinataMetadata', imagePinataMetadata);
    
    console.log('Uploading PNG image to IPFS...');
    
    // Upload PNG to IPFS
    const imageResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      imageFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );
    
    const imageHash = imageResponse.data.IpfsHash;
    console.log('PNG uploaded successfully:', imageHash);
    
    // Update metadata with image URL
    metadata.image = `ipfs://${imageHash}`;
    
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
