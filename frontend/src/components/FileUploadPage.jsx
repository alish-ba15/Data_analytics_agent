import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Database, CheckCircle2, ArrowRight, X, FileText, HardDrive, Info } from 'lucide-react';

export default function FileUploadPage({ activeFile, fileProfile, onFileUpload, onNavigate }) {
  const [selectedFile, setSelectedFile] = useState(activeFile || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        if (onFileUpload) {
          onFileUpload(file);
        }
      } else {
        alert('Please upload a valid CSV file.');
      }
    }
  };

  const formattedSize = selectedFile 
    ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
    : '1.14 MB';

  const fileName = selectedFile ? selectedFile.name : (fileProfile?.filename || 'retail_store_sales.csv');
  const rowsCount = fileProfile?.total_rows ? fileProfile.total_rows.toLocaleString() : '12,575';
  const colsCount = fileProfile?.total_columns ?? 11;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '50px' }}>
      
      {/* Top Banner Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Data Analytics & Upload
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Upload, analyze, and visualize your data with powerful AI multi-agent queries
        </p>

        {/* Tab Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <span className="badge badge-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', cursor: 'default' }}>
            File Upload
          </span>
          <button
            onClick={() => onNavigate('dashboard')}
            className="badge badge-secondary"
            style={{ padding: '6px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className="badge badge-secondary"
            style={{ padding: '6px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Analytics / Studio
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Box Left, Document Details Right - side by side on one row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left Side: Upload Data Files Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
            Upload Data Files
          </h3>

          {/* Drag and Drop Zone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: selectedFile ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
              borderColor: selectedFile ? 'var(--primary)' : 'var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow)'
            }}>
              <Upload size={32} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Drag and drop your files here
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Support for CSV, JSON, XML, SQL, Excel files up to 50MB
              </p>
            </div>

            {/* Supported Format Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['CSV', 'JSON', 'XML', 'SQL', 'Excel'].map((fmt, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: fmt === 'CSV' ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: fmt === 'CSV' ? 'var(--primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Dark Choose Files Action Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{
                marginTop: '12px',
                padding: '12px 32px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              Choose Files
            </button>
          </div>
        </div>

        {/* Right Side: Document Details Card */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Document Details
            </h3>
          </div>

          {/* Basic Information Section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              Basic Information
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{fileName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                <span style={{ color: 'var(--text-main)' }}>{formattedSize}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                <span className="badge badge-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  text/csv
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Uploaded:</span>
                <span style={{ color: 'var(--text-main)' }}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

          {/* Data Structure Section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={16} style={{ color: 'var(--primary)' }} />
              Data Structure
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rows:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{rowsCount}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Columns:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{colsCount}</strong>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

          {/* Launch Buttons for Studio & Dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <button
              onClick={() => onNavigate('studio')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Analyze in Studio Workspace</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              <span>Open LLM Executive Dashboard</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
