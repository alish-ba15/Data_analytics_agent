import React from 'react';
import { CheckCircle2, Circle, Loader2, Cpu, Database, Wrench, ShieldCheck, Code, FileText, Check } from 'lucide-react';

export default function PipelineProgress({ isAnalyzing, activeStep = 7, completed = false }) {
  const steps = [
    { id: 1, name: 'Dataset Profiler', desc: 'Nulls, duplicates & types', icon: Database },
    { id: 2, name: 'Cleaning Agent', desc: 'Groq pandas code generation', icon: Wrench },
    { id: 3, name: 'Code Validation', desc: 'Isolated scope execution', icon: ShieldCheck },
    { id: 4, name: 'Analysis Agent', desc: 'Question intent & code plan', icon: Cpu },
    { id: 5, name: 'Code Executor', desc: 'Data transformation & chart', icon: Code },
    { id: 6, name: 'Answer Agent', desc: 'Natural language synthesis', icon: Check },
    { id: 7, name: 'Report & PDF', desc: 'ReportLab PDF export', icon: FileText }
  ];

  if (!isAnalyzing && !completed) return null;

  return (
    <div className="card animate-fade-in" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} style={{ color: 'var(--primary)' }} />
          Multi-Agent Execution Pipeline
        </h3>
        <span className={`badge ${completed ? 'badge-success' : 'badge-primary'}`}>
          {completed ? 'Pipeline Finished (100%)' : 'Processing Stage 7 of 7'}
        </span>
      </div>

      {/* Grid of steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = completed || (isAnalyzing && step.id < activeStep);
          const isCurrent = isAnalyzing && step.id === activeStep;

          return (
            <div
              key={step.id}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDone ? 'var(--success-light)' : isCurrent ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                border: `1px solid ${isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StepIcon size={16} style={{ color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-main)' }}>
                    Stage {step.id}
                  </span>
                </div>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
                ) : (
                  <Circle size={16} style={{ color: 'var(--text-light)' }} />
                )}
              </div>

              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {step.name}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
