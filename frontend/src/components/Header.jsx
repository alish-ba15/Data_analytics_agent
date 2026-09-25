import React from 'react';
import { Sun, Moon, Sparkles, FileText, Download, Activity, Home, LayoutDashboard, BarChart3 } from 'lucide-react';

export default function Header({ theme, toggleTheme, pdfUrl, reportUrl, isAnalyzing, currentPage, onNavigate }) {
  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}>
            <Sparkles size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                AI Data Analyst
              </h1>
              <span className="badge badge-primary">
                Groq 120B
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              7-Stage Autonomous Multi-Agent Pipeline
            </p>
          </div>
        </div>

        {/* Center Page Nav Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: currentPage === 'home' ? 'var(--bg-card)' : 'transparent',
              color: currentPage === 'home' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentPage === 'home' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('studio')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: currentPage === 'studio' ? 'var(--bg-card)' : 'transparent',
              color: currentPage === 'studio' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentPage === 'studio' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={16} />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: currentPage === 'dashboard' ? 'var(--bg-card)' : 'transparent',
              color: currentPage === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentPage === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={16} />
            <span>LLM Dashboard</span>
          </button>
        </div>

        {/* Action Controls & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAnalyzing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              <Activity size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              download="AI_Data_Analyst_Report.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Download size={16} />
              <span>Download PDF</span>
            </a>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
}
