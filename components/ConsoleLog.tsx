
import React, { useEffect, useRef } from 'react';
import { MiningLog } from '../types';
import { Terminal } from 'lucide-react';

interface ConsoleLogProps {
  logs: MiningLog[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 rounded-3xl p-8 h-80 overflow-hidden flex flex-col shadow-2xl border-t-4 border-slate-800">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
          <Terminal className="w-4 h-4 text-amber-500" />
          Mining System Log
        </h3>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 font-mono text-xs scrollbar-hide"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 leading-relaxed animate-in slide-in-from-left-4 duration-300">
            <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
            <span className={
              log.type === 'error' ? 'text-red-400 font-black' :
              log.type === 'success' ? 'text-emerald-400 font-black' :
              log.type === 'warning' ? 'text-amber-400 font-black' :
              'text-white'
            }>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-800 italic flex items-center gap-3 h-full justify-center">
            <span className="w-2 h-2 bg-slate-800 rounded-full animate-pulse"></span>
            System ready. Enter seed to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleLog;
