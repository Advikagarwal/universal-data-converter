import { useState, useEffect, useCallback } from 'react';
import type { SupportedFormat, ConversionOptions, ParseError, RepairResult } from './types/core';
import { conversionController } from './services/conversionController';
import { Layout } from './components/Layout';
import { TextArea } from './components/TextArea';
import { ControlPanel } from './components/ControlPanel';
import { OptionsPanel } from './components/OptionsPanel';
import { ErrorDisplay } from './components/ErrorDisplay';
import { RepairPreviewModal } from './components/RepairPreviewModal';
import { Notification } from './components/Notification';
import './App.css';

interface NotificationState {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

function App() {
  // Input/Output state
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [outputFileName, setOutputFileName] = useState('output.txt');
  
  // Format state
  const [inputFormat, setInputFormat] = useState<SupportedFormat>('json');
  const [outputFormat, setOutputFormat] = useState<SupportedFormat>('yaml');
  const [autoDetect, setAutoDetect] = useState(true);
  const [detectedFormat, setDetectedFormat] = useState<SupportedFormat | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  
  // Conversion options
  const [options, setOptions] = useState<ConversionOptions>({
    prettyPrint: true,
    indentSize: 2,
    csvOptions: {
      hasHeaders: true,
      delimiter: ',',
      enableTypeDetection: false,
      treatFirstRowAsHeaders: true,
    },
    repairSyntax: false,
  });
  
  // UI state
  const [isConverting, setIsConverting] = useState(false);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [repairPreview, setRepairPreview] = useState<{
    result: RepairResult;
    originalText: string;
  } | null>(null);

  // Auto-detect format when input changes and auto-detect is enabled
  useEffect(() => {
    const performDetection = () => {
      if (autoDetect && inputText.trim()) {
        const detection = conversionController.autoDetectFormat(inputText);
        
        // Batch state updates to avoid cascading renders
        if (detection.detectedFormat && detection.confidence > 0.6) {
          setDetectionConfidence(detection.confidence);
          setDetectedFormat(detection.detectedFormat);
          setInputFormat(detection.detectedFormat);
        } else if (detection.detectedFormat && detection.confidence > 0) {
          // Low confidence - show notification but still set detected format
          setDetectionConfidence(detection.confidence);
          setDetectedFormat(detection.detectedFormat);
          setNotification({
            message: `Format detection uncertain. Detected: ${detection.detectedFormat.toUpperCase()} (${Math.round(detection.confidence * 100)}% confidence)`,
            type: 'warning'
          });
        } else {
          setDetectedFormat(null);
          setDetectionConfidence(0);
        }
      } else if (!autoDetect) {
        setDetectedFormat(null);
        setDetectionConfidence(0);
      }
    };
    
    performDetection();
  }, [inputText, autoDetect]);

  // Perform conversion
  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setErrors([]);
      setWarnings([]);
      return;
    }

    setIsConverting(true);
    setErrors([]);
    setWarnings([]);

    // Small delay to show loading state
    setTimeout(() => {
      const result = conversionController.convert(
        inputText,
        inputFormat,
        outputFormat,
        options
      );

      if (result.success && result.output) {
        setOutputText(result.output);
        setOutputFileName(`output.${outputFormat}`);
        setErrors([]);
        setWarnings(result.warnings || []);
        
        if (result.metadata?.repairApplied) {
          setNotification({
            message: 'Conversion successful with syntax repairs applied',
            type: 'success'
          });
        } else {
          setNotification({
            message: 'Conversion successful',
            type: 'success'
          });
        }
      } else {
        setOutputText('');
        setOutputFileName('output.txt');
        setErrors(result.errors || []);
        setWarnings(result.warnings || []);
        setNotification({
          message: 'Conversion failed. See errors below.',
          type: 'error'
        });
      }

      setIsConverting(false);
    }, 100);
  }, [inputText, inputFormat, outputFormat, options]);

  // Handle syntax repair
  const handleRepair = useCallback(() => {
    if (!inputText.trim()) {
      setNotification({
        message: 'No input to repair',
        type: 'warning'
      });
      return;
    }

    const repairResult = conversionController.repairSyntax(inputText, inputFormat);
    
    if (repairResult.success && repairResult.repairedText) {
      // Show repair preview modal
      setRepairPreview({
        result: repairResult,
        originalText: inputText
      });
    } else {
      setNotification({
        message: 'No repairs needed or repair failed',
        type: 'info'
      });
    }
  }, [inputText, inputFormat]);

  // Apply repair from preview
  const handleApplyRepair = useCallback(() => {
    if (repairPreview?.result.repairedText) {
      setInputText(repairPreview.result.repairedText);
      setNotification({
        message: `Applied ${repairPreview.result.appliedFixes.length} fix(es)`,
        type: 'success'
      });
      setRepairPreview(null);
      
      // Auto-convert after repair
      setTimeout(() => handleConvert(), 200);
    }
  }, [repairPreview, handleConvert]);

  // Handle schema generation
  const handleGenerateSchema = useCallback((type: 'typescript' | 'json-schema') => {
    if (!inputText.trim()) {
      setNotification({
        message: 'No input to generate schema from',
        type: 'warning'
      });
      return;
    }

    // First, parse the input as JSON
    let jsonData: unknown;
    try {
      if (inputFormat === 'json') {
        jsonData = JSON.parse(inputText);
      } else {
        // Convert to JSON first
        const conversionResult = conversionController.convert(
          inputText,
          inputFormat,
          'json',
          options
        );
        
        if (!conversionResult.success || !conversionResult.output) {
          setNotification({
            message: 'Failed to parse input for schema generation',
            type: 'error'
          });
          return;
        }
        
        jsonData = JSON.parse(conversionResult.output);
      }
    } catch {
      setNotification({
        message: 'Invalid JSON for schema generation',
        type: 'error'
      });
      return;
    }

    const schemaResult = conversionController.generateSchema(jsonData, type);
    
    if (schemaResult.success && schemaResult.schema) {
      setOutputText(schemaResult.schema);
      setOutputFileName(type === 'typescript' ? 'schema.ts' : 'schema.json');
      setNotification({
        message: `${type === 'typescript' ? 'TypeScript' : 'JSON Schema'} generated successfully`,
        type: 'success'
      });
    } else {
      setNotification({
        message: 'Schema generation failed',
        type: 'error'
      });
    }
  }, [inputText, inputFormat, options]);

  // Handle format changes
  const handleInputFormatChange = useCallback((format: SupportedFormat) => {
    setInputFormat(format);
    setDetectedFormat(null);
  }, []);

  const handleOutputFormatChange = useCallback((format: SupportedFormat) => {
    setOutputFormat(format);
  }, []);

  const handleAutoDetectChange = useCallback((enabled: boolean) => {
    setAutoDetect(enabled);
    if (!enabled) {
      setDetectedFormat(null);
    }
  }, []);

  return (
    <Layout>
      <div className="app-container">
        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Main content area */}
        <div className="content-grid">
          {/* Input area */}
          <div className="content-section">
            <TextArea
              label={`Input (${detectedFormat ? `Detected: ${detectedFormat.toUpperCase()}` : inputFormat.toUpperCase()})`}
              value={inputText}
              onChange={setInputText}
              placeholder="Paste your data here..."
            />
          </div>

          {/* Control panel */}
          <div className="content-section">
            <ControlPanel
              inputFormat={inputFormat}
              outputFormat={outputFormat}
              onInputFormatChange={handleInputFormatChange}
              onOutputFormatChange={handleOutputFormatChange}
              onConvert={handleConvert}
              onRepair={handleRepair}
              onGenerateSchema={handleGenerateSchema}
              autoDetect={autoDetect}
              onAutoDetectChange={handleAutoDetectChange}
              isConverting={isConverting}
              detectedFormat={detectedFormat}
              detectionConfidence={detectionConfidence}
            />
            
            <OptionsPanel
              options={options}
              onOptionsChange={setOptions}
            />

            {/* Error display */}
            {(errors.length > 0 || warnings.length > 0) && (
              <ErrorDisplay
                errors={errors}
                warnings={warnings}
                onClose={() => {
                  setErrors([]);
                  setWarnings([]);
                }}
              />
            )}
          </div>

          {/* Output area */}
          <div className="content-section">
            <TextArea
              label={`Output (${outputFormat.toUpperCase()})`}
              value={outputText}
              placeholder="Converted data will appear here..."
              readOnly
              downloadFileName={outputFileName}
              onCopy={() => {
                setNotification({
                  message: 'Copied to clipboard',
                  type: 'success'
                });
              }}
              onDownload={() => {
                setNotification({
                  message: 'File downloaded',
                  type: 'success'
                });
              }}
            />
          </div>
        </div>

        {/* Repair preview modal */}
        {repairPreview && (
          <RepairPreviewModal
            repairResult={repairPreview.result}
            originalText={repairPreview.originalText}
            onApply={handleApplyRepair}
            onCancel={() => setRepairPreview(null)}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;
