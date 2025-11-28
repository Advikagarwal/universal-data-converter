import React, { useRef, useEffect } from 'react';
import './TextArea.css';

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label: string;
  readOnly?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  downloadFileName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  readOnly = false,
  onCopy,
  onDownload,
  downloadFileName = 'output.txt'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A for select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && textareaRef.current) {
        e.preventDefault();
        textareaRef.current.select();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        if (onCopy) {
          onCopy();
        }
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handlePaste = async () => {
    if (!readOnly && onChange) {
      try {
        const text = await navigator.clipboard.readText();
        onChange(text);
      } catch (err) {
        console.error('Failed to paste:', err);
      }
    }
  };

  const handleDownload = () => {
    if (value) {
      const blob = new Blob([value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onDownload) {
        onDownload();
      }
    }
  };

  return (
    <div className="textarea-container">
      <div className="textarea-header">
        <label className="textarea-label">{label}</label>
        <div className="textarea-actions">
          {!readOnly && (
            <button
              className="textarea-action-btn"
              onClick={handlePaste}
              title="Paste from clipboard (Ctrl+V)"
            >
              📋 Paste
            </button>
          )}
          {value && (
            <>
              <button
                className="textarea-action-btn"
                onClick={handleCopy}
                title="Copy to clipboard (Ctrl+C)"
              >
                📄 Copy
              </button>
              {readOnly && (
                <button
                  className="textarea-action-btn"
                  onClick={handleDownload}
                  title="Download file"
                >
                  💾 Download
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className={`textarea-input ${readOnly ? 'readonly' : ''}`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
      />
    </div>
  );
};
