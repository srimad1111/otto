import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { analyzeText } from '../api';
import { AppStatus, MascotState, AnalysisResult } from '../types';

function App() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setStatus('reading');
      setMascotState('reading');
      setError(null);

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab found');

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
        throw new Error('Cannot analyze browser internal pages');
      }

      // Request text from content script with retry mechanism
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_TEXT' });
      } catch (error) {
        // If content script is missing (e.g. stale tab), inject it and retry
        // This handles the "Receiving end does not exist" error
        console.log('Content script not ready, injecting...');
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Short delay to ensure listener is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_TEXT' });
      }
      
      if (!response || !response.text) {
        throw new Error('Failed to extract text from page');
      }

      setStatus('thinking');
      setMascotState('thinking');

      // Call Backend
      const analysis = await analyzeText(response.text);

      setResult(analysis);
      setStatus('result');
      
      // Set mascot based on risk
      switch (analysis.overall_risk) {
        case 'low': setMascotState('happy'); break;
        case 'medium': setMascotState('concerned'); break;
        case 'high': setMascotState('alert'); break;
      }

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'An error occurred');
      setMascotState('concerned');
    }
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-gray-50 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">TnC Analyzer</h1>
      
      <Mascot state={mascotState} />

      {status === 'idle' && (
        <button 
          onClick={handleAnalyze}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          Analyze Terms
        </button>
      )}

      {status === 'reading' && <p className="text-gray-600 animate-pulse">Reading page content...</p>}
      {status === 'thinking' && <p className="text-blue-600 animate-pulse">Analyzing with Gemini...</p>}

      {status === 'error' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full mt-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button onClick={() => setStatus('idle')} className="mt-2 text-sm underline">Try Again</button>
        </div>
      )}

      {status === 'result' && result && (
        <div className="w-full mt-4 space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            result.overall_risk === 'low' ? 'border-green-500 bg-green-50' :
            result.overall_risk === 'medium' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <h2 className="text-lg font-bold uppercase mb-1">Risk: {result.overall_risk}</h2>
            <p className="text-sm text-gray-700">{result.summary}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Notable Clauses:</h3>
            {result.notable_clauses.map((clause, idx) => (
              <div key={idx} className="bg-white p-3 rounded shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-gray-900">{clause.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    clause.risk === 'low' ? 'bg-green-100 text-green-800' :
                    clause.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{clause.risk}</span>
                </div>
                <p className="text-xs text-gray-600">{clause.explanation}</p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => { setStatus('idle'); setMascotState('idle'); setResult(null); }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
