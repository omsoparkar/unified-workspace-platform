import React from 'react';

export interface DiffViewerProps {
  diffText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffText }) => {
  const lines = diffText ? diffText.split('\n') : [];

  return (
    <div className="font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto p-4 space-y-1">
      {lines.map((line, idx) => {
        let bgClass = 'text-slate-300';
        if (line.startsWith('+')) {
          bgClass = 'bg-emerald-500/10 text-emerald-400 font-semibold px-2 rounded';
        } else if (line.startsWith('-')) {
          bgClass = 'bg-rose-500/10 text-rose-400 font-semibold px-2 rounded';
        } else if (line.startsWith('@@')) {
          bgClass = 'text-indigo-400 font-bold py-1';
        }

        return (
          <div key={idx} className={`flex items-center space-x-3 ${bgClass}`}>
            <span className="w-8 text-right text-slate-600 select-none text-[10px]">{idx + 1}</span>
            <span className="whitespace-pre">{line}</span>
          </div>
        );
      })}
    </div>
  );
};
