import React, { useState, useRef } from 'react';
import { Upload, Play, FileSpreadsheet, X, HelpCircle, Sparkles } from 'lucide-react';

export default function QueryInput({ onSubmit, isAnalyzing }) {
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const sampleQueries = [
    "What are the top 5 entries by highest total value?",
    "Analyze key trends over time and show period progression.",
    "Compare average values across primary category groups.",
    "Show overall percentage distribution across segments."
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a valid CSV file.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit({ query, file: selectedFile });
  };

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <form onSubmit={handleSubmit}>
        
        {/* Upload & Query Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            Ask Question About Your Dataset
          </h2>
          
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HelpCircle size={14} />
            Supports any CSV dataset
          </span>
        </div>

        {/* CSV Dropzone / Active File indicator */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '10px',
            padding: '16px',
            backgroundColor: selectedFile ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
            borderColor: selectedFile ? 'var(--primary)' : 'var(--border-color)',
            cursor: selectedFile ? 'default' : 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />

          {selectedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--primary)' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB • Custom dataset loaded
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                style={{
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Drag & drop any custom CSV dataset here, or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse files</span>
              </p>
            </div>
          )}
        </div>

        {/* Natural Language Prompt Area */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any natural language prompt for your dataset... (e.g. Find top 5 groups by average value and show period trends)"
            disabled={isAnalyzing}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              resize: 'vertical',
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Sample Prompt Chips */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            TRY A GENERAL QUESTION PROMPT:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(sample)}
                disabled={isAnalyzing}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Submit Execution Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={isAnalyzing || !query.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 28px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              opacity: (isAnalyzing || !query.trim()) ? 0.6 : 1,
              cursor: (isAnalyzing || !query.trim()) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={18} fill="#ffffff" />
            <span>{isAnalyzing ? 'Executing Pipeline...' : 'Run Autonomous Analysis'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
