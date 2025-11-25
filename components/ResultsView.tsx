import React from 'react';
import { AnalysisResult, DiscrepancySeverity } from '../types';
import { AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, FileText, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onBack }) => {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case DiscrepancySeverity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case DiscrepancySeverity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case DiscrepancySeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const riskData = [
    { name: 'Risk', value: result.riskScore, color: '#ef4444' },
    { name: 'Safe', value: 100 - result.riskScore, color: '#e2e8f0' },
  ];

  const agreementData = [
    { name: 'Alignment', value: result.agreementScore, color: '#22c55e' },
    { name: 'Divergence', value: 100 - result.agreementScore, color: '#e2e8f0' },
  ];

  // --- Export Functions ---

  const handleDownloadCSV = () => {
    // 1. Prepare Data
    const headers = ['Category', 'Topic', 'Buy Side Claim', 'Sell Side Claim', 'Severity', 'Reasoning'];
    const rows = result.discrepancies.map(d => [
      d.category,
      d.topic,
      `"${d.buySideClaim.replace(/"/g, '""')}"`, // Escape double quotes for CSV
      `"${d.sellSideClaim.replace(/"/g, '""')}"`,
      d.severity,
      `"${d.reasoning.replace(/"/g, '""')}"`
    ]);

    // 2. Build CSV Content
    const csvContent = [
      ['EquiCheck Analysis Report'],
      [`Date: ${new Date(result.timestamp).toLocaleDateString()} ${new Date(result.timestamp).toLocaleTimeString()}`],
      [`Analysis ID: ${result.id}`],
      [`Risk Score: ${result.riskScore}/100`],
      [`Agreement Score: ${result.agreementScore}/100`],
      [`Executive Summary: "${result.executiveSummary.replace(/"/g, '""')}"`],
      [], // Empty line
      ['DISCREPANCIES DETAIL'],
      headers,
      ...rows.map(r => r.join(','))
    ].join('\n');

    // 3. Create Blob and Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `EquiCheck_Report_${result.id.slice(0, 8)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in print:space-y-6">
      {/* Header Actions (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Upload
        </button>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-medium text-sm"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Export to Excel
            </button>
        </div>
      </div>
      
      {/* Print Only Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-gray-900">EquiCheck Analysis Report</h1>
        <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
        <p className="text-xs text-gray-400 mt-1">ID: {result.id}</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        {/* Risk Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 break-inside-avoid">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Risk Exposure</h3>
          <div className="h-32 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="#1e293b">{result.riskScore}%</tspan>
                  <tspan x="50%" dy="1.5em" fontSize="12" fill="#64748b">Risk</tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agreement Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 break-inside-avoid">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Document Alignment</h3>
           <div className="h-32 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agreementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {agreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="#1e293b">{result.agreementScore}%</tspan>
                  <tspan x="50%" dy="1.5em" fontSize="12" fill="#64748b">Match</tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 shadow-md text-white md:col-span-1 flex flex-col justify-center break-inside-avoid print:bg-white print:text-black print:border print:border-gray-200">
          <h3 className="text-indigo-100 font-semibold mb-2 flex items-center gap-2 print:text-indigo-800">
            <TrendingUp className="w-5 h-5" />
            Executive Summary
          </h3>
          <p className="text-sm text-indigo-50 leading-relaxed print:text-gray-800">
            {result.executiveSummary}
          </p>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Identified Discrepancies
          </h2>
          <span className="text-sm text-gray-500">{result.discrepancies.length} issues found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Category & Topic</th>
                <th className="p-4 font-semibold w-1/4">Buy Side Position</th>
                <th className="p-4 font-semibold w-1/4">Sell Side Position</th>
                <th className="p-4 font-semibold">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {result.discrepancies.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                  <td className="p-4 align-top">
                    <span className="block font-medium text-gray-900">{d.topic}</span>
                    <span className="text-xs text-gray-500">{d.category}</span>
                  </td>
                  <td className="p-4 align-top bg-blue-50/30">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-400 mt-1 shrink-0 print:text-blue-600" />
                      <p className="text-gray-700">{d.buySideClaim}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top bg-purple-50/30">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-purple-400 mt-1 shrink-0 print:text-purple-600" />
                      <p className="text-gray-700">{d.sellSideClaim}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(d.severity)}`}>
                      {d.severity}
                    </span>
                    <p className="mt-2 text-xs text-gray-500 leading-snug">
                      {d.reasoning}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic & Key Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 break-inside-avoid">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Key Risks Detected
            </h3>
            <ul className="space-y-3">
              {result.keyRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 text-red-900 text-sm print:bg-white print:border print:border-red-100">
                  <span className="font-bold shrink-0">{i + 1}.</span>
                  {risk}
                </li>
              ))}
            </ul>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 break-inside-avoid">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Strategic Alignment
            </h3>
            <div className="p-4 rounded-lg bg-gray-50 text-gray-700 text-sm leading-relaxed border border-gray-100 print:bg-white">
              {result.strategicAlignment}
            </div>
         </div>
      </div>
      
      {/* Print Only Footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
        Generated by EquiCheck - Powered by Gemini 1.5 Flash
      </div>
    </div>
  );
};