import React, { useState, useEffect, useRef } from 'react';

interface ValidatorData {
  address: string;
  country: string; // Placeholder for country data if available in the future
  stake: number;
  successRate: number; // Percentage, e.g., 98.5
  status: 'active' | 'inactive' | 'unknown';
  blocksProduced: number;
  missedBlocks: number;
}

interface BlockProposalPayload {
  BlockNum: number;
  Author: string;
  AuthorNodeID: string;
  NumTx: number;
  Round: string;
  ParentRound: string;
  Timestamp: string;
  Epoch: number;
  IsBackfill: boolean;
}

interface LatestEpochPayload {
  block_num: string;
  blocks_completed: string;
  boundary_phase_completion_percentage: number;
  boundary_phase_ended_on_round: null | string;
  boundary_phase_remaining_percentage: number;
  epoch: string;
  lock_phase_activated: boolean;
  round: string;
  timestamp: string;
}

interface SSEMessage {
  type: 'block_proposal' | 'latestEpoch' | 'connection' | 'heartbeat';
  payload?: BlockProposalPayload | LatestEpochPayload | string;
}

export const useValidatorStream = () => {
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Close any existing connection before opening a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('https://early-elora-gmonad-41124f13.koyeb.app/sse');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('SSE connection opened.');
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData: SSEMessage = JSON.parse(event.data);

        if (parsedData.type === 'block_proposal' && typeof parsedData.payload === 'object' && parsedData.payload !== null && 'AuthorNodeID' in parsedData.payload) {
          const { Author, AuthorNodeID, BlockNum } = parsedData.payload as BlockProposalPayload;

          setValidators(prevValidators => {
            const existingValidatorIndex = prevValidators.findIndex(
              val => val.address === AuthorNodeID
            );

            if (existingValidatorIndex !== -1) {
              const updatedValidators = [...prevValidators];
              const existingValidator = updatedValidators[existingValidatorIndex];
              // Update existing validator (example: increment blocks produced)
              updatedValidators[existingValidatorIndex] = {
                ...existingValidator,
                blocksProduced: existingValidator.blocksProduced + 1,
                status: 'active',
                // For simplicity, successRate is randomly updated. In a real scenario, this would come from the stream.
                successRate: Math.min(100, existingValidator.successRate + Math.random() * 5),
              };
              return updatedValidators;
            } else {
              // Add new validator
              return [
                ...prevValidators,
                {
                  address: AuthorNodeID,
                  country: 'Unknown', // Default or derive from IP if possible
                  stake: Math.floor(Math.random() * 1000) + 1, // Mock stake
                  successRate: Math.floor(Math.random() * 100) + 1, // Mock success rate
                  status: 'active',
                  blocksProduced: 1,
                  missedBlocks: 0,
                },
              ];
            }
          });
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
        setError('Failed to parse incoming data.');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setIsConnected(false);
      setError('SSE connection error. Retrying...');
      eventSource.close(); // Attempt to close and let useEffect cleanup
    };

    return () => {
      console.log('SSE connection closed.');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  const totalValidators = validators.length;
  const activeValidators = validators.filter(v => v.status === 'active').length;
  const averageSuccessRate = totalValidators > 0
    ? validators.reduce((sum, v) => sum + v.successRate, 0) / totalValidators
    : 0;

  return { validators, isConnected, error, totalValidators, activeValidators, averageSuccessRate };
}; 