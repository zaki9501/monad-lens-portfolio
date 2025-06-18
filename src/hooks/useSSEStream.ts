import { useState, useEffect } from 'react';

interface SSEData {
  timestamp: number;
  data: any;
  type: string;
}

export function useSSEStream(url: string) {
  const [data, setData] = useState<SSEData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);
    const newData: SSEData[] = [];

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        newData.push({
          timestamp: Date.now(),
          data: parsedData,
          type: event.type
        });

        // Keep only the last 50 messages
        if (newData.length > 50) {
          newData.shift();
        }

        setData([...newData]);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setError('Connection error');
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, isConnected, error };
} 