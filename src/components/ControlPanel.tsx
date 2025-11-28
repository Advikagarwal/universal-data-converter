import React from 'react';
import type { SupportedFormat } from '../types/core';
import './ControlPanel.css';

interface ControlPanelProps {
  inputFormat: SupportedFormat;
  outputFormat: SupportedFormat;
  onInputFormatChange: (format: SupportedFormat) => void;
  onOutputFormatChange: (format: SupportedFormat) => void;
  onConvert: () => void;
  onRepair: () => void;
  onGenerateSchema: (type: 'typescript' | 'json-schema') => void;
  autoDetect: boolean;
  onAutoDetectChange: (enabled: boolean) => void;
  isConverting?: boolean;
  detectedFormat?: SupportedFormat | null;
  detectionConfidence?: number;
}

const FORMAT_OPTIONS: Array<{ value: SupportedFormat; label: string }> = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'csv', label: 'CSV' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  inputFormat,
  outputFormat,
  onInputFormatChange,
  onOutputFormatChange,
  onConvert,
  onRepair,
  onGenerateSchema,
  autoDetect,
  onAutoDetectChange,
  isConverting = false,
  detectedFormat,
  detectionConfidence,
}) => {
  return (
    <div className="control-panel">
      <div className="control-section">
        <h3 className="control-section-title">Input Format</h3>
        <select
          className="format-select"
          value={inputFormat}
          onChange={(e) => onInputFormatChange(e.target.value as SupportedFormat)}
          disabled={autoDetect}
        >
          {FORMAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => onAutoDetectChange(e.target.checked)}
          />
          <span>Auto-detect format</span>
        </label>

        {autoDetect && detectedFormat && detectionConfidence !== undefined && (
          <div className="detection-feedback">
            <span className="detection-icon">
              {detectionConfidence > 0.8 ? '✓' : detectionConfidence > 0.6 ? '~' : '?'}
            </span>
            <span className="detection-text">
              Detected: {detectedFormat.toUpperCase()} 
              ({Math.round(detectionConfidence * 100)}% confidence)
            </span>
          </div>
        )}
      </div>

      <div className="control-divider">
        <div className="arrow-icon">→</div>
      </div>

      <div className="control-section">
        <h3 className="control-section-title">Output Format</h3>
        <select
          className="format-select"
          value={outputFormat}
          onChange={(e) => onOutputFormatChange(e.target.value as SupportedFormat)}
        >
          {FORMAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-actions">
        <button
          className="control-btn primary"
          onClick={onConvert}
          disabled={isConverting}
        >
          {isConverting ? 'Converting...' : '🔄 Convert'}
        </button>
        
        <button
          className="control-btn secondary"
          onClick={onRepair}
          disabled={isConverting}
        >
          🔧 Repair Syntax
        </button>
        
        <div className="schema-buttons">
          <button
            className="control-btn secondary small"
            onClick={() => onGenerateSchema('typescript')}
            disabled={isConverting}
          >
            📝 TypeScript
          </button>
          <button
            className="control-btn secondary small"
            onClick={() => onGenerateSchema('json-schema')}
            disabled={isConverting}
          >
            📋 JSON Schema
          </button>
        </div>
      </div>
    </div>
  );
};
