import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

export default function CodeViewer({ analysisCode, cleaningCode, explanation }) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!analysisCode && !cleaningCode) return null;

  const currentCode = activeTab === 'analysis' ? analysisCode : cleaningCode;

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Title & Accordion toggle */}
        <div 
          onClick={() => setExpanded(!expanded)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <Code2 size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Executed Pandas Code & Logic
          </h3>
        </div>

        {/* Tab Switches & Copy */}
        {expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-card-subtle)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setActiveTab('analysis')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'analysis' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'analysis' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'analysis' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Analysis Code
              </button>
              {cleaningCode && (
                <button
                  onClick={() => setActiveTab('cleaning')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: activeTab === 'cleaning' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'cleaning' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: activeTab === 'cleaning' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Cleaning Code
                </button>
              )}
            </div>

            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Block Container */}
      {expanded && (
        <div style={{ marginTop: '14px' }}>
          {explanation && activeTab === 'analysis' && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', fontStyle: 'italic' }}>
              💡 Strategy: {explanation}
            </p>
          )}

          <div style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            overflowX: 'auto',
            border: '1px solid #334155'
          }}>
            <pre style={{ margin: 0 }}>
              <code>{currentCode || '# No code generated for this stage'}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
