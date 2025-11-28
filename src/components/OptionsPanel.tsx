import React, { useState } from 'react';
import type { ConversionOptions } from '../types/core';
import './OptionsPanel.css';

interface OptionsPanelProps {
  options: ConversionOptions;
  onOptionsChange: (options: ConversionOptions) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  options,
  onOptionsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOption = <K extends keyof ConversionOptions>(
    key: K,
    value: ConversionOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const updateCsvOption = (key: string, value: string | boolean) => {
    onOptionsChange({
      ...options,
      csvOptions: {
        ...options.csvOptions,
        [key]: value,
      },
    });
  };

  return (
    <div className="options-panel">
      <button
        className="options-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="options-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="options-toggle-text">Conversion Options</span>
      </button>

      {isExpanded && (
        <div className="options-content">
          {/* Formatting Options */}
          <div className="options-section">
            <h4 className="options-section-title">Formatting</h4>
            
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.prettyPrint ?? true}
                onChange={(e) => updateOption('prettyPrint', e.target.checked)}
              />
              <span>Pretty Print</span>
            </label>

            <div className="option-item">
              <label className="option-label">
                Indentation Size
              </label>
              <input
                type="number"
                className="option-input"
                min="1"
                max="8"
                value={options.indentSize ?? 2}
                onChange={(e) => updateOption('indentSize', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* CSV Options */}
          <div className="options-section">
            <h4 className="options-section-title">CSV Options</h4>
            
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.csvOptions?.hasHeaders ?? true}
                onChange={(e) => updateCsvOption('hasHeaders', e.target.checked)}
              />
              <span>Has Headers</span>
            </label>

            <label className="option-item">
              <input
                type="checkbox"
                checked={options.csvOptions?.treatFirstRowAsHeaders ?? true}
                onChange={(e) => updateCsvOption('treatFirstRowAsHeaders', e.target.checked)}
              />
              <span>Treat First Row as Headers</span>
            </label>

            <label className="option-item">
              <input
                type="checkbox"
                checked={options.csvOptions?.enableTypeDetection ?? false}
                onChange={(e) => updateCsvOption('enableTypeDetection', e.target.checked)}
              />
              <span>Enable Type Detection</span>
            </label>

            <div className="option-item">
              <label className="option-label">
                Delimiter
              </label>
              <select
                className="option-select"
                value={options.csvOptions?.delimiter ?? ','}
                onChange={(e) => updateCsvOption('delimiter', e.target.value)}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>

          {/* Repair Options */}
          <div className="options-section">
            <h4 className="options-section-title">Repair</h4>
            
            <label className="option-item">
              <input
                type="checkbox"
                checked={options.repairSyntax ?? false}
                onChange={(e) => updateOption('repairSyntax', e.target.checked)}
              />
              <span>Auto-repair syntax errors</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
