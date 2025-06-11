
const convertSVGToPNG = (svgElement) => {
  return new Promise((resolve, reject) => {
    console.log('Starting SVG to PNG conversion...');
    
    try {
      // Serialize the SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      console.log('SVG data serialized, length:', svgData.length);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size
      canvas.width = 800;  // 2x for better quality
      canvas.height = 800;
      
      img.onload = function() {
        console.log('SVG image loaded, drawing to canvas...');
        ctx.drawImage(img, 0, 0, 800, 800);
        
        canvas.toBlob((blob) => {
          console.log('PNG blob created, size:', blob.size);
          resolve(blob);
        }, 'image/png', 0.95);
      };
      
      img.onerror = function(error) {
        console.error('Error loading SVG image:', error);
        reject(new Error('Failed to load SVG image'));
      };
      
      // Create blob URL and set as image source
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      console.log('Setting image source...');
      img.src = url;
      
      // Clean up URL after some time
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Error in SVG to PNG conversion:', error);
      reject(error);
    }
  });
};

const uploadToIPFS = async (file, metadata, maxRetries = 3) => {
  console.log('Upload attempt 1 of', maxRetries, '...');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  formData.append('pinataMetadata', JSON.stringify(metadata));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};

export const uploadToPinata = async (walletAddress, overallScore, artData) => {
  const JWT = import.meta.env.VITE_PINATA_JWT;
  
  if (!JWT) {
    throw new Error('Pinata JWT token not found in environment variables');
  }

  console.log('Starting IPFS upload process...');

  try {
    // Get the SVG element
    const svgElement = document.getElementById('reputation-art-svg');
    if (!svgElement) {
      throw new Error('SVG element not found');
    }

    console.log('JWT token found, converting SVG to PNG...');
    console.log('SVG element:', svgElement);

    // Convert SVG to PNG
    const pngBlob = await convertSVGToPNG(svgElement);
    console.log('PNG conversion completed, blob size:', pngBlob.size);

    // Calculate traits based on artData
    const visualElements = (artData.patterns?.length || 0) + (artData.particles?.length || 0);
    const complexityScore = artData.mandalaRings?.length || 0;
    const energyFlows = (artData.connections?.length || 0) + (artData.waves?.length || 0);
    const geometricHarmony = artData.geometricHarmony || 0;
    const chromaticSignature = artData.chromaticSignature || 0;

    // Determine rarity tier
    const getRarityTier = (score) => {
      if (score >= 80) return 'Legendary';
      if (score >= 60) return 'Epic';
      if (score >= 40) return 'Rare';
      return 'Common';
    };

    // Upload PNG image
    console.log('Uploading PNG image to IPFS...');
    const imageHash = await uploadToIPFS(
      pngBlob,
      {
        name: `reputation-art-${walletAddress.slice(0, 8)}.png`,
        keyvalues: {
          type: 'reputation-art-image',
          wallet: walletAddress,
          score: overallScore.toString()
        }
      }
    );

    console.log('PNG uploaded successfully:', imageHash);

    // Create metadata with the new trait structure
    const metadata = {
      name: `Reputation Art #${overallScore}`,
      description: `Unique reputation art generated for wallet ${walletAddress} with score ${overallScore}`,
      attributes: [
        {
          trait_type: "Overall Score",
          value: overallScore
        },
        {
          trait_type: "Visual Elements", 
          value: `${visualElements} pieces`
        },
        {
          trait_type: "Complexity Score",
          value: `${complexityScore}x mandala layers`
        },
        {
          trait_type: "Energy Flows",
          value: `${energyFlows} paths`
        },
        {
          trait_type: "Geometric Harmony",
          value: `${geometricHarmony}° resonance`
        },
        {
          trait_type: "Chromatic Signature", 
          value: `${chromaticSignature}° spectrum`
        },
        {
          trait_type: "Rarity Tier",
          value: getRarityTier(overallScore)
        },
        {
          trait_type: "Wallet Address",
          value: walletAddress
        }
      ],
      external_url: `https://monadmindscope.com/wallet/${walletAddress}`,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      image_url: `https://gateway.pinata.cloud/ipfs/${imageHash}`
    };

    console.log('Updated metadata with image URL:', metadata.image);

    // Upload metadata
    console.log('Uploading metadata to IPFS...');
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });

    const metadataHash = await uploadToIPFS(
      metadataBlob,
      {
        name: `reputation-art-metadata-${walletAddress.slice(0, 8)}.json`,
        keyvalues: {
          type: 'reputation-art-metadata',
          wallet: walletAddress,
          score: overallScore.toString()
        }
      }
    );

    console.log('Metadata uploaded successfully:', metadataHash);
    console.log('Final metadata structure:', metadata);

    return metadataHash;

  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};
