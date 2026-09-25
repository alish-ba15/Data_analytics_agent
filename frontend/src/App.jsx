import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import HomePage from './components/HomePage';
import FileUploadPage from './components/FileUploadPage';
import LLMDashboard from './components/LLMDashboard';
import QueryInput from './components/QueryInput';
import PipelineProgress from './components/PipelineProgress';
import AnswerCard from './components/AnswerCard';
import ChartViewer from './components/ChartViewer';
import CodeViewer from './components/CodeViewer';
import ReportViewer from './components/ReportViewer';
import { AlertCircle, Sparkles, ArrowUp, FileText, ArrowRight } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('upload'); // 'home' | 'upload' | 'dashboard' | 'studio' | 'reports'
  const [sidebarOpen, setSidebarOpen] = useState(true); // true (260px) | false (72px)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasUserQueried, setHasUserQueried] = useState(false);

  const progressRef = useRef(null);
  const resultsRef = useRef(null);

  // Sync data-theme attribute with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Monitor scroll position to show/hide Scroll to Top FAB
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth auto-scroll when pipeline starts
  useEffect(() => {
    if (isAnalyzing && progressRef.current && currentPage === 'studio') {
      progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isAnalyzing, currentPage]);

  // Smooth auto-scroll when analysis completes
  useEffect(() => {
    if (analysisData && hasUserQueried && resultsRef.current && currentPage === 'studio') {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [analysisData, hasUserQueried, currentPage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchStudio = () => {
    setCurrentPage('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (file) => {
    setActiveFile(file);
    setHasUserQueried(false);
    handleAnalyzeInternal({
      query: 'Analyze key dataset metrics, profile anomalies, and generate summary insights.',
      file: file
    });
  };

  const handleRunQuery = async (queryText) => {
    setHasUserQueried(true);
    await handleAnalyzeInternal({ query: queryText });
  };

  const handleAnalyze = async ({ query, file }) => {
    setHasUserQueried(true);
    await handleAnalyzeInternal({ query, file });
  };

  const handleAnalyzeInternal = async ({ query, file }) => {
    if (file) {
      setActiveFile(file);
    }
    setIsAnalyzing(true);
    setError(null);
    setActiveStep(1);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const formData = new FormData();
      formData.append('query', query);
      const targetFile = file || activeFile;
      if (targetFile) {
        formData.append('file', targetFile);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: 'Analysis server returned an error.' }));
        throw new Error(errJson.detail || 'Execution failed.');
      }

      const data = await response.json();
      setActiveStep(7);
      setAnalysisData(data);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || 'An unexpected error occurred during execution.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const contentMarginLeft = sidebarOpen ? '260px' : '72px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Left Sidebar Navigation with open/close toggle */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Right Content View Column */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: contentMarginLeft,
        transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Top Search & Profile Header Bar with Sidebar Toggle */}
        <TopAppBar
          theme={theme}
          toggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <main className="container" style={{ flex: 1, padding: '32px 28px', maxWidth: '1400px' }}>
          
          {/* View 1: Home Landing Page */}
          {currentPage === 'home' && (
            <HomePage onLaunch={handleLaunchStudio} />
          )}

          {/* View 2: File Upload Page matching exact screenshot design */}
          {currentPage === 'upload' && (
            <FileUploadPage
              activeFile={activeFile}
              fileProfile={analysisData?.initial_profile}
              onFileUpload={handleFileUpload}
              onNavigate={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* View 3: PowerBI-Style LLM Dashboard Page */}
          {currentPage === 'dashboard' && (
            <LLMDashboard
              onRunQuery={handleRunQuery}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              analysisData={analysisData}
            />
          )}

          {/* View 4: Analytics / Studio Workspace (NO DATA HEALTH CARD AS REQUESTED) */}
          {currentPage === 'studio' && (
            <div className="animate-fade-in">
              
              {/* Studio Banner */}
              {!analysisData && !isAnalyzing && !error && (
                <div 
                  className="card animate-fade-in" 
                  style={{
                    padding: '28px',
                    marginBottom: '24px',
                    background: theme === 'light' 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' 
                      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderColor: 'var(--primary-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)'
                    }}>
                      <Sparkles size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Analytics & Q&A Studio Workspace
                      </h2>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Ask questions about your uploaded dataset. The 7-stage autonomous agent pipeline executes code, auto-generates charts, synthesizes natural language answers, and compiles an executive PDF report.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Query & Drag-Drop Card */}
              <QueryInput onSubmit={handleAnalyze} isAnalyzing={isAnalyzing} />

              {/* Live Pipeline Steps Progress Tracker */}
              <div ref={progressRef}>
                <PipelineProgress
                  isAnalyzing={isAnalyzing}
                  activeStep={activeStep}
                  completed={hasUserQueried && !!analysisData && !isAnalyzing}
                />
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="card animate-fade-in" style={{
                  padding: '16px 20px',
                  marginBottom: '24px',
                  backgroundColor: 'var(--danger-light)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle size={20} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Pipeline Execution Error</strong>
                    <span style={{ fontSize: '0.85rem' }}>{error}</span>
                  </div>
                </div>
              )}

              {/* Results View (Only visible after user asks a query) */}
              {analysisData && hasUserQueried && (
                <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* 1. Natural Language Synthesized Answer */}
                  <AnswerCard
                    answer={analysisData.final_answer}
                    provider={analysisData.provider}
                  />

                  {/* 2. Interactive Visual Chart */}
                  <ChartViewer
                    chartUrl={analysisData.chart_available ? analysisData.chart_url : null}
                    executionResult={analysisData.execution_result}
                    resultType={analysisData.result_type}
                  />

                  {/* 3. Generated Pandas Code View */}
                  <CodeViewer
                    analysisCode={analysisData.analysis_code}
                    cleaningCode={analysisData.cleaning_code}
                    explanation={analysisData.analysis_explanation}
                  />

                  {/* 4. Executive Report Banner linking to Documents & PDF page */}
                  {analysisData.report_content && (
                    <div className="card animate-fade-in" style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      marginTop: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)'
                        }}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                            Executive Analysis & PDF Report Ready
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            The complete executive report with PDF download export is located on the Documents & PDF page.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage('reports');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>View Report</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* View 5: Documents & PDF Reports Page */}
          {currentPage === 'reports' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '18px' }}>
                Generated Documents & Executive Reports
              </h2>
              {analysisData?.report_content ? (
                <ReportViewer
                  reportContent={analysisData.report_content}
                  pdfUrl={analysisData.pdf_available ? analysisData.pdf_url : null}
                  reportUrl={analysisData.report_url}
                />
              ) : (
                <div className="card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '12px', opacity: 0.8 }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    No Executive Report Generated Yet
                  </h3>
                  <p style={{ fontSize: '0.9rem' }}>
                    Upload a dataset or run a query in the Analytics Studio to generate and download PDF analysis reports!
                  </p>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '20px 28px',
          marginTop: 'auto',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong>AI Data Analyst Agent</strong> • Groq 120B & Pure Python Orchestration
            </div>
            <div>
              Outputs: <code>generated/analysis_report.pdf</code> & <code>generated/analysis_chart.png</code>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating Scroll to Top FAB */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll back to top"
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
            border: '2px solid #ffffff'
          }}
        >
          <ArrowUp size={22} />
        </button>
      )}

    </div>
  );
}
