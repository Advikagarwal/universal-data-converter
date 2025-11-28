import React from 'react';
import type { ParseError } from '../types/core';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  errors?: ParseError[];
  warnings?: string[];
  onClose?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors = [],
  warnings = [],
  onClose,
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="error-display">
      {onClose && (
        <button className="error-close" onClick={onClose} title="Close">
          ✕
        </button>
      )}
      
      {errors.length > 0 && (
        <div className="error-section">
          <h4 className="error-title">
            ❌ Errors ({errors.length})
          </h4>
          <div className="error-list">
            {errors.map((error, index) => (
              <div key={index} className="error-item error">
                <div className="error-location">
                  Line {error.line}, Column {error.column}
                </div>
                <div className="error-message">{error.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="error-section">
          <h4 className="error-title warning">
            ⚠️ Warnings ({warnings.length})
          </h4>
          <div className="error-list">
            {warnings.map((warning, index) => (
              <div key={index} className="error-item warning">
                <div className="error-message">{warning}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
