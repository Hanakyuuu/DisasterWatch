import { useState } from 'react';

export function AnalysisPanel({ analysis }: {
  analysis: {
    score?: number;
    keywords?: string[];
    report?: string;
  }
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-blue-50 rounded-lg mt-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="font-semibold text-blue-600"
      >
        Mental Health Analysis {analysis.score && `(Score: ${analysis.score}/10)`}
      </button>
      
      {expanded && (
        <div className="mt-2">
          {analysis.keywords?.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium">Key Themes:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.keywords.map(kw => (
                  <span key={kw} className="bg-white px-2 py-1 rounded text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.report && (
            <div>
              <h4 className="font-medium">Report:</h4>
              <p className="text-sm mt-1 whitespace-pre-line">{analysis.report}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}