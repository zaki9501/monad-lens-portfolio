
import React from 'react';
import OrbitalTransactionTimeline from './OrbitalTransactionTimeline';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ data, isDarkMode, isLoreMode }) => {
  return <OrbitalTransactionTimeline data={data} isDarkMode={isDarkMode} isLoreMode={isLoreMode} />;
};

export default TransactionTimeline;
