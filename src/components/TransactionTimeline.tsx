
import React from 'react';
import HelixTransactionTimeline from './HelixTransactionTimeline';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ data, isDarkMode, isLoreMode }) => {
  return <HelixTransactionTimeline data={data} isDarkMode={isDarkMode} isLoreMode={isLoreMode} />;
};

export default TransactionTimeline;
