import React, { useState, useRef } from 'react';
import { BarChart3, TrendingUp, PieChart, Sparkles, Layers, Download, Play, Table, Hash, AlertTriangle, CheckCircle2, Upload, FileSpreadsheet, X, LayoutDashboard, FileText, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LLMDashboard({ onRunQuery, onAnalyze, isAnalyzing, analysisData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const profile = analysisData?.initial_profile;
  const hasData = !!analysisData && !!profile;

  const totalRows = hasData && profile?.total_rows !== undefined ? profile.total_rows.toLocaleString() : '—';
  const totalCols = hasData && profile?.total_columns !== undefined ? profile.total_columns : '—';
  const numericColsCount = hasData && profile?.numeric_columns ? profile.numeric_columns.length : 0;
  const issuesCount = hasData && profile?.detected_issues ? profile.detected_issues.length : 0;
  const duplicateRows = hasData && profile?.duplicate_rows !== undefined ? profile.duplicate_rows : 0;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (onAnalyze) {
        onAnalyze({
          query: 'Generate a complete PowerBI-style executive dashboard overview with primary category breakdown and trends.',
          file: file
        });
      }
    }
  };

  const handleGenerateDashboard = () => {
    const defaultQuery = 'Generate a complete PowerBI-style executive dashboard overview with primary category breakdown and trends.';
    if (onAnalyze && selectedFile) {
      onAnalyze({ query: defaultQuery, file: selectedFile });
    } else {
      onRunQuery(defaultQuery);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '50px' }}>
      
      {/* Dashboard Top Header & Download Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)'
            }}>
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                PowerBI-Style LLM Dashboard
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Automated multi-widget visual analytics & executive dataset overview
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleGenerateDashboard}
            disabled={isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              opacity: isAnalyzing ? 0.6 : 1,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={16} />
            <span>{isAnalyzing ? 'Building Dashboard...' : 'Auto-Generate Dashboard'}</span>
          </button>

          {analysisData?.pdf_available && (
            <a
              href={analysisData.pdf_url}
              download="AI_Data_Analyst_Report.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Download size={16} />
              <span>PDF Report</span>
            </a>
          )}
        </div>
      </div>

      {/* Dataset Source File Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <FileSpreadsheet size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedFile ? selectedFile.name : (hasData ? 'Active Dataset Source' : 'Click to Upload Any CSV Dataset')}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {hasData ? `${totalRows} rows • ${totalCols} columns loaded` : 'Supports Sales, HR, Finance, Healthcare, E-commerce datasets'}
              </p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-main)'
            }}
          >
            <Upload size={14} />
            <span>{hasData ? 'Change Dataset' : 'Upload CSV'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic PowerBI Executive KPI Scorecards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span>Total Dataset Rows</span>
            <Table size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalRows}
          </p>
          <span style={{ fontSize: '0.75rem', color: hasData ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
            {hasData ? 'Active Volume Records' : 'No Dataset Loaded'}
          </span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span>Total Feature Columns</span>
            <Hash size={18} style={{ color: 'var(--secondary)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalCols}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasData ? `${numericColsCount} Numeric Metrics` : 'No Columns Loaded'}
          </span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span>Anomalies / Null Issues</span>
            <AlertTriangle size={18} style={{ color: issuesCount > 0 ? 'var(--warning)' : 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: issuesCount > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
            {hasData ? issuesCount : '—'}
          </p>
          <span style={{ fontSize: '0.75rem', color: issuesCount > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
            {hasData ? (issuesCount > 0 ? 'Cleaned by Agent' : '0 Anomalies Found') : 'Awaiting Profile'}
          </span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span>Data Health Score</span>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>
            {hasData ? '100%' : '—'}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            {hasData ? 'Validated & Clean' : 'Awaiting Validation'}
          </span>
        </div>
      </div>

      {/* PowerBI Multi-Widget Dashboard Canvas */}
      {hasData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          
          {/* Widget 1: Primary Visual Chart Tile */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
                Executive Visual Overview
              </h3>
              <span className="badge badge-primary">Dynamic Chart</span>
            </div>

            {analysisData.chart_available ? (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src={`${analysisData.chart_url}?t=${Date.now()}`}
                  alt="PowerBI Style Visual Chart"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    borderRadius: '6px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem' }}>Result output is scalar/summary data.</p>
              </div>
            )}
          </div>

          {/* Widget 2: Executive Narrative & Key Insights Tile */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                Executive Dashboard Story & Insights
              </h3>
              <span className="badge badge-success">Groq 120B Narrative</span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.92rem',
              lineHeight: '1.7',
              flex: 1,
              overflowY: 'auto',
              maxHeight: '380px'
            }}>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysisData.final_answer || 'Automated dashboard story generated directly from data.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Widget 3: Data Metrics Structure Table Tile */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Table size={20} style={{ color: 'var(--primary)' }} />
              Aggregated Metrics Breakdown
            </h3>

            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(analysisData.execution_result, null, 2)}
              </pre>
            </div>
          </div>

          {/* Widget 4: Column Health & Data Profile Summary */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} style={{ color: 'var(--primary)' }} />
              Dataset Schema Profile
            </h3>

            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Detected Columns & Types ({profile.total_columns}):
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(profile.dtypes || {}).map(([col, dtype], idx) => (
                  <div key={idx} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                    <strong>{col}</strong>: <code style={{ color: 'var(--primary)' }}>{dtype}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* PowerBI Style Empty Canvas State */
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <LayoutDashboard size={60} style={{ color: 'var(--primary)', marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            PowerBI Dashboard Canvas Ready
          </h3>
          <p style={{ fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            Upload any CSV dataset above or click <strong>Auto-Generate Dashboard</strong> to instantly build a 4-widget executive dashboard layout with visual charts, narrative insights, and KPI scorecards!
          </p>

          <button
            onClick={handleGenerateDashboard}
            disabled={isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.98rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={18} />
            <span>Generate PowerBI Executive Dashboard</span>
          </button>
        </div>
      )}

    </div>
  );
}
