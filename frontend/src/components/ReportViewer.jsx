import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, Copy, Check, Eye, Code } from 'lucide-react';

export default function ReportViewer({ reportContent, pdfUrl, reportUrl }) {
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'
  const [copied, setCopied] = useState(false);

  if (!reportContent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Executive Analysis Report
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Complete breakdown with executive summary, methodology, and recommendations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setViewMode('formatted')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'formatted' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'formatted' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'raw' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'raw' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Code size={14} />
              <span>Raw MD</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy Markdown"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download="AI_Data_Analyst_Report.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Content View */}
      <div style={{
        backgroundColor: 'var(--bg-card-subtle)',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {viewMode === 'formatted' ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reportContent}
            </ReactMarkdown>
          </div>
        ) : (
          <pre style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: 'var(--text-main)'
          }}>
            {reportContent}
          </pre>
        )}
      </div>

    </div>
  );
}
