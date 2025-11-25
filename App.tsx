import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, History as HistoryIcon, Zap, Loader2, Database, Network } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ResultsView } from './components/ResultsView';
import { ArchitectureView } from './components/ArchitectureView';
import { AnalysisResult, AnalysisStatus } from './types';
import { analyzeDocuments } from './services/geminiService';
import { saveAnalysis, getAnalyses, clearHistory } from './services/storageService';

// --- Utility: Convert File to Base64 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Page: Dashboard (New Analysis) ---
const Dashboard = () => {
  const [buySideFile, setBuySideFile] = useState<File | null>(null);
  const [sellSideFile, setSellSideFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileError = (msg: string) => {
    setErrorMsg(msg);
    // If we have an error, ensure status reflects it so the UI shows the message
    if (msg) setStatus(AnalysisStatus.ERROR);
  };

  const handleAnalyze = async () => {
    if (!buySideFile || !sellSideFile) return;

    try {
      setStatus(AnalysisStatus.UPLOADING);
      setErrorMsg(''); // Clear previous errors
      
      const buySideB64 = await fileToBase64(buySideFile);
      const sellSideB64 = await fileToBase64(sellSideFile);

      setStatus(AnalysisStatus.ANALYZING);
      
      const analysisData = await analyzeDocuments(
        buySideB64, 
        sellSideB64, 
        buySideFile.name, 
        sellSideFile.name
      );

      // Save to "Firestore" (Local for demo)
      await saveAnalysis(analysisData);

      setResult(analysisData);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e: any) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(e.message || "An unexpected error occurred during analysis.");
    }
  };

  const reset = () => {
    setBuySideFile(null);
    setSellSideFile(null);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setErrorMsg('');
  };

  if (result) {
    return <ResultsView result={result} onBack={reset} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
          Buy vs. Sell Side <span className="text-indigo-600">Agent</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your Buy Side Due Diligence and Sell Side Information Memorandum. 
          Our Gemini-powered agent will identify critical discrepancies instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <FileUpload
          label="Buy Side Report (PDF)"
          file={buySideFile}
          onFileSelect={setBuySideFile}
          onRemove={() => setBuySideFile(null)}
          colorClass="border-blue-200 bg-blue-50/50"
          onError={handleFileError}
        />
        <FileUpload
          label="Sell Side Memo (PDF)"
          file={sellSideFile}
          onFileSelect={setSellSideFile}
          onRemove={() => setSellSideFile(null)}
          colorClass="border-purple-200 bg-purple-50/50"
          onError={handleFileError}
        />
      </div>

      <div className="flex flex-col items-center">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 w-full max-w-lg text-center font-medium shadow-sm animate-pulse-once">
             Error: {errorMsg}
          </div>
        )}

        {(status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR) && (
          <button
            onClick={handleAnalyze}
            disabled={!buySideFile || !sellSideFile}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg transition-all transform
              ${(!buySideFile || !sellSideFile) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/25'}
            `}
          >
            <Zap className="w-5 h-5 fill-current" />
            {status === AnalysisStatus.ERROR ? 'Retry Analysis' : 'Run Comparative Analysis'}
          </button>
        )}

        {(status === AnalysisStatus.UPLOADING || status === AnalysisStatus.ANALYZING) && (
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg border border-indigo-100 mb-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {status === AnalysisStatus.UPLOADING ? 'Processing Documents...' : 'Gemini is Analyzing...'}
            </h3>
            <p className="text-gray-500 mt-2">This may take up to 30 seconds depending on file size.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Page: History ---
const History = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyses().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const handleClear = async () => {
      await clearHistory();
      setHistory([]);
  }

  if (selectedResult) {
    return <ResultsView result={selectedResult} onBack={() => setSelectedResult(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
          <p className="text-slate-500">Stored via Firestore Service</p>
        </div>
        {history.length > 0 && (
             <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 underline">Clear History</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Analysis Records</h3>
          <p className="text-gray-500">Run a new analysis to populate this database.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedResult(item)}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{item.buySideFileName} vs {item.sellSideFileName}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{item.executiveSummary}</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Risk Score</div>
                  <div className={`text-lg font-bold ${item.riskScore > 70 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.riskScore}
                  </div>
                </div>
                 <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Discrepancies</div>
                  <div className="text-lg font-bold text-gray-700">
                    {item.discrepancies.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Layout & Routing ---
const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">EquiCheck</span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                New Analysis
              </Link>
              <Link
                to="/history"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/history') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <HistoryIcon className="w-4 h-4 mr-2" />
                History
              </Link>
              <Link
                to="/architecture"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/architecture') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Network className="w-4 h-4 mr-2" />
                How it Works
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
              Cloud Run Active
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/architecture" element={<ArchitectureView />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-auto py-8 print:hidden">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} EquiCheck. Powered by Google Vertex AI & Gemini.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}