
import React from 'react';
import BallPitTransactionVisualization from './BallPitTransactionVisualization';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ data, isDarkMode, isLoreMode }) => {
  return <BallPitTransactionVisualization data={data} isDarkMode={isDarkMode} isLoreMode={isLoreMode} />;
};

export default TransactionTimeline;
