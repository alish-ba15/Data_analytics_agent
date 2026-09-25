import React, { useState } from 'react';
import { BarChart3, Maximize2, Download, RefreshCw, Eye } from 'lucide-react';

export default function ChartViewer({ chartUrl, executionResult, resultType }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageHash, setImageHash] = useState(Date.now());

  if (!chartUrl) return null;

  const fullChartUrl = `${chartUrl}?t=${imageHash}`;

  const handleRefresh = () => {
    setImageHash(Date.now());
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--secondary-light)',
            color: 'var(--secondary)'
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Data Visualization
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Automatically tailored chart based on analysis shape
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRefresh}
            title="Refresh chart preview"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <RefreshCw size={14} />
            <span>Reload</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <Maximize2 size={14} />
            <span>Enlarge</span>
          </button>
        </div>
      </div>

      {/* Chart Graphic Frame */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
      }}>
        <img
          src={fullChartUrl}
          alt="Generated Data Analysis Chart"
          onClick={() => setIsModalOpen(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '480px',
            borderRadius: '6px',
            cursor: 'pointer',
            objectFit: 'contain',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* Numerical Data Result preview table if result is dict/dataframe */}
      {executionResult && typeof executionResult === 'object' && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            RAW COMPUTED METRICS ({resultType || 'summary'})
          </p>
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal Lightbox */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Interactive Visual Chart</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700
                }}
              >
                Close ✕
              </button>
            </div>
            <img
              src={fullChartUrl}
              alt="Generated Chart Full Size"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '6px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
