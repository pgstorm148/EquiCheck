import React from 'react';
import { ArrowRight, Cloud, Database, Brain, Monitor, FileText, Server } from 'lucide-react';

export const ArchitectureView = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">System Architecture</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          EquiCheck utilizes a serverless, event-driven architecture powered by Google Cloud Platform 
          and Gemini 2.5 Pro/Flash for real-time document analysis.
        </p>
      </div>

      {/* Diagram Container */}
      <div className="relative">
        
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-indigo-100 -z-10 transform -translate-y-1/2"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Step 1: Client */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-50">1</div>
            <div className="h-full flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 rounded-full mb-6">
                <Monitor className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Client (React)</h3>
              <p className="text-sm text-gray-500">
                Hosted on <span className="font-semibold text-gray-900">Cloud Run</span>.
                Orchestrates file processing (Base64) and manages application state.
              </p>
            </div>
          </div>

          {/* Step 2: AI Processing */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative group hover:-translate-y-1 transition-transform duration-300">
             <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-50">2</div>
             <div className="h-full flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-50 rounded-full mb-6">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gemini 2.5 Flash</h3>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">Vertex AI</span> processes multimodal inputs (PDFs + Text Prompts) to extract structured insights.
              </p>
            </div>
          </div>

          {/* Step 3: Structured Data */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-50">3</div>
            <div className="h-full flex flex-col items-center text-center">
              <div className="p-4 bg-purple-50 rounded-full mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">JSON Response</h3>
              <p className="text-sm text-gray-500">
                Raw analysis is returned as a strictly typed JSON object conforming to the <code>AnalysisResult</code> schema.
              </p>
            </div>
          </div>

          {/* Step 4: Persistence */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-50">4</div>
            <div className="h-full flex flex-col items-center text-center">
              <div className="p-4 bg-orange-50 rounded-full mb-6">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Firestore</h3>
              <p className="text-sm text-gray-500">
                Results are persisted in <span className="font-semibold text-gray-900">Google Firestore</span> for historical retrieval and audit trails.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                <div className="font-semibold text-slate-900">Google Cloud Run</div>
                <div className="text-xs text-slate-500 mt-1">Serverless Hosting</div>
            </div>
             <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                <div className="font-semibold text-slate-900">Vertex AI</div>
                <div className="text-xs text-slate-500 mt-1">Gemini 2.5 Flash</div>
            </div>
             <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                <div className="font-semibold text-slate-900">Firestore</div>
                <div className="text-xs text-slate-500 mt-1">NoSQL Database</div>
            </div>
             <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                <div className="font-semibold text-slate-900">React + Vite</div>
                <div className="text-xs text-slate-500 mt-1">Frontend Framework</div>
            </div>
        </div>
      </div>
    </div>
  );
};
