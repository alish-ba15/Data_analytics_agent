import React from 'react';
import { Database, CheckCircle, Table, Hash, AlertTriangle, Layers } from 'lucide-react';

export default function DatasetSummary({ initialProfile, cleanValidation }) {
  if (!initialProfile) return null;

  const totalRows = initialProfile.total_rows ?? 0;
  const totalCols = initialProfile.total_columns ?? 0;
  const duplicateRows = initialProfile.duplicate_rows ?? 0;
  const nullSummary = initialProfile.missing_counts ?? initialProfile.null_counts ?? {};

  const totalNulls = Object.values(nullSummary).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
  const cleanSuccess = cleanValidation?.clean_execution_success ?? false;

  return (
    <div className="card animate-fade-in" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Dataset Profile & Health
          </h3>
        </div>

        {cleanSuccess && (
          <span className="badge badge-success">
            <CheckCircle size={14} /> Cleaned DataFrame Validated
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
            <Table size={14} /> Total Rows
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalRows.toLocaleString()}
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
            <Hash size={14} /> Columns
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalCols}
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: totalNulls > 0 ? 'var(--warning-light)' : 'var(--bg-card-subtle)',
          border: `1px solid ${totalNulls > 0 ? 'var(--warning)' : 'var(--border-color)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: totalNulls > 0 ? 'var(--warning)' : 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
            <AlertTriangle size={14} /> Null Values
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: totalNulls > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
            {totalNulls}
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: duplicateRows > 0 ? 'var(--warning-light)' : 'var(--bg-card-subtle)',
          border: `1px solid ${duplicateRows > 0 ? 'var(--warning)' : 'var(--border-color)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: duplicateRows > 0 ? 'var(--warning)' : 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
            <Layers size={14} /> Duplicate Rows
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: duplicateRows > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
            {duplicateRows}
          </p>
        </div>
      </div>
    </div>
  );
}
