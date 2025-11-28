import React from 'react';
import type { RepairResult } from '../types/core';
import './RepairPreviewModal.css';

interface RepairPreviewModalProps {
  repairResult: RepairResult;
  originalText: string;
  onApply: () => void;
  onCancel: () => void;
}

export const RepairPreviewModal: React.FC<RepairPreviewModalProps> = ({
  repairResult,
  originalText,
  onApply,
  onCancel,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔧 Syntax Repair Preview</h2>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Issues Found */}
          {repairResult.issuesFound.length > 0 && (
            <div className="repair-section">
              <h3 className="repair-section-title">
                Issues Found ({repairResult.issuesFound.length})
              </h3>
              <div className="issues-list">
                {repairResult.issuesFound.map((issue, index) => (
                  <div key={index} className="issue-item">
                    <span className="issue-location">
                      Line {issue.line}, Col {issue.column}
                    </span>
                    <span className="issue-type">{issue.type}</span>
                    <span className="issue-description">{issue.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applied Fixes */}
          {repairResult.appliedFixes.length > 0 && (
            <div className="repair-section">
              <h3 className="repair-section-title">
                Applied Fixes ({repairResult.appliedFixes.length})
              </h3>
              <ul className="fixes-list">
                {repairResult.appliedFixes.map((fix, index) => (
                  <li key={index} className="fix-item">
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Before/After Comparison */}
          <div className="repair-section">
            <h3 className="repair-section-title">Before / After</h3>
            <div className="comparison-container">
              <div className="comparison-pane">
                <h4 className="comparison-label">Before</h4>
                <pre className="comparison-text">{originalText}</pre>
              </div>
              <div className="comparison-divider">→</div>
              <div className="comparison-pane">
                <h4 className="comparison-label">After</h4>
                <pre className="comparison-text">
                  {repairResult.repairedText || originalText}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn primary" onClick={onApply}>
            Apply Repairs
          </button>
        </div>
      </div>
    </div>
  );
};
