import React from 'react';
import './ConversionPanel.css';

interface ConversionPanelProps {
  children: React.ReactNode;
}

export const ConversionPanel: React.FC<ConversionPanelProps> = ({ children }) => {
  return (
    <div className="conversion-panel">
      {children}
    </div>
  );
};
