import React from 'react';
import { Home, LayoutDashboard, Upload, Zap, FileText, Sparkles, Database, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'upload', label: 'File Upload', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Analytics / Studio', icon: Zap },
    { id: 'reports', label: 'Documents & PDF', icon: FileText }
  ];

  const sidebarWidth = isOpen ? '260px' : '72px';

  return (
    <aside style={{
      width: sidebarWidth,
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 40,
      userSelect: 'none',
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflowX: 'hidden'
    }}>
      
      {/* Brand Header & Toggle Button */}
      <div style={{
        padding: isOpen ? '20px' : '20px 14px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        height: '64px'
      }}>
        {isOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}>
              <Sparkles size={18} />
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                AI Data Analyst
              </h1>
              <span className="badge badge-primary" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                Groq 120B
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Sparkles size={18} />
          </div>
        )}

        {/* Collapse / Expand Toggle Icon */}
        <button
          onClick={onToggle}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{
            padding: '6px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: isOpen ? '16px 12px' : '16px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {isOpen && (
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', paddingLeft: '12px', marginBottom: '6px' }}>
            NAVIGATION
          </p>
        )}

        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={!isOpen ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
                gap: '12px',
                width: '100%',
                padding: isOpen ? '11px 14px' : '11px 0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
                textAlign: isOpen ? 'left' : 'center'
              }}
            >
              <IconComp size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
              {isOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Active Dataset Footer Status */}
      {isOpen ? (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-main)' }}>
            <Database size={14} style={{ color: 'var(--primary)' }} />
            <span>Active Engine</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Pure Python 7-Stage Multi-Agent
          </p>
        </div>
      ) : (
        <div style={{
          padding: '16px 0',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card-subtle)',
          display: 'flex',
          justifyContent: 'center'
        }} title="Pure Python 7-Stage Multi-Agent Engine">
          <Database size={18} style={{ color: 'var(--primary)' }} />
        </div>
      )}

    </aside>
  );
}
