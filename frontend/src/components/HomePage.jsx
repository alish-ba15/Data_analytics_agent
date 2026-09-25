import React from 'react';
import { Sparkles, ArrowRight, Cpu, ShieldCheck, BarChart3, FileText, Database, Code2, Zap, CheckCircle2 } from 'lucide-react';

export default function HomePage({ onLaunch }) {
  const features = [
    {
      icon: Database,
      title: '7-Stage Autonomous Pipeline',
      desc: 'Automatic dataset profiling, anomaly detection, null value recovery, and data health validation.'
    },
    {
      icon: Cpu,
      title: 'Groq 120B Agentic Reasoning',
      desc: 'Powered by Groq gpt-oss-120b for fast intent understanding, strategy planning, and code generation.'
    },
    {
      icon: ShieldCheck,
      title: 'Self-Healing Code Execution',
      desc: 'Isolated Python execution scope with automated traceback capture and iterative self-correction loops.'
    },
    {
      icon: BarChart3,
      title: 'Auto Data Visualizations',
      desc: 'Smart structure detection rendering tailored bar, line, scatter, and pie charts automatically.'
    },
    {
      icon: FileText,
      title: 'Executive PDF & MD Reports',
      desc: 'Compiles formatted executive analysis reports and ready-to-download PDF documents using ReportLab.'
    },
    {
      icon: Code2,
      title: 'Full Transparency & Code Access',
      desc: 'Inspect, copy, and verify every line of generated Pandas transformation and analysis code.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '60px 0 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        
        {/* Top Floating Badge */}
        <div 
          className="badge badge-primary animate-pulse" 
          style={{
            padding: '6px 16px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.15)'
          }}
        >
          <Sparkles size={16} />
          <span>Groq 120B Autonomous Multi-Agent System</span>
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: '1.2',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          marginBottom: '20px'
        }}>
          Transform Raw Data into Executive Insights with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Autonomous AI Agents
          </span>
        </h1>

        {/* Subtitle Description */}
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          lineHeight: '1.7',
          marginBottom: '36px',
          maxWidth: '740px'
        }}>
          Upload any CSV dataset or ask plain-English questions. Our 7-stage autonomous agent pipeline profiles your data, cleans anomalies, executes Python code, auto-generates charts, and exports PDF reports in seconds.
        </p>

        {/* Main CTA Button */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onLaunch}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.25s ease'
            }}
          >
            <span>Launch Studio Dashboard</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </section>

      {/* Interactive Feature Cards Grid */}
      <section style={{ marginTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Enterprise-Grade Multi-Agent Architecture
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Pure Python orchestration with zero black-box dependencies
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={22} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ready Banner */}
      <section 
        className="card" 
        style={{
          marginTop: '60px',
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
          color: '#ffffff',
          borderRadius: '16px'
        }}
      >
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
          Ready to Analyze Your Data?
        </h2>
        <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
          Experience real-time dataset profiling, automated code execution, self-healing Pandas pipelines, and executive PDF exports.
        </p>

        <button
          onClick={onLaunch}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 32px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: 'var(--primary)',
            fontSize: '1rem',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>Open Interactive Studio</span>
          <ArrowRight size={18} />
        </button>
      </section>

    </div>
  );
}
