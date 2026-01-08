
import React from 'react';
import { KeywordData } from '../types';
import { TrendingUp, TrendingDown, Minus, Wand2, ArrowUpRight, Database, HelpCircle } from 'lucide-react';

interface KeywordTableProps {
  data: KeywordData[];
  onSelectKeyword: (kw: KeywordData) => void;
  isPro?: boolean;
}

const KeywordTable: React.FC<KeywordTableProps> = ({ data, onSelectKeyword, isPro = false }) => {
  const getGoldScoreInfo = (score: number) => {
    if (score >= 80) return { label: '강력추천', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', desc: '노다지 키워드입니다!' };
    if (score >= 60) return { label: '시도양호', color: 'text-blue-700 bg-blue-50 border-blue-300', desc: '충분히 승산이 있습니다.' };
    if (score >= 40) return { label: '경쟁심화', color: 'text-amber-700 bg-amber-50 border-amber-300', desc: '조금 더 세부적으로 접근하세요.' };
    return { label: '레드오션', color: 'text-slate-700 bg-slate-100 border-slate-300', desc: '고수들의 전쟁터입니다.' };
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b-2 border-slate-800">
              <th className="px-10 py-6">
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  키워드 <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
                </div>
              </th>
              <th className="px-10 py-6 text-right">
                <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  검색량 <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
                </div>
              </th>
              <th className="px-10 py-6 text-right">
                <div className="flex items-center justify-end gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  문서수 <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
                </div>
              </th>
              <th className="px-10 py-6 text-center text-xs font-black text-slate-400 uppercase tracking-widest">추세</th>
              <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">추천 점수</th>
              <th className="px-10 py-6 text-center text-xs font-black text-slate-400 uppercase tracking-widest">도구</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {data.map((kw, index) => {
              const info = getGoldScoreInfo(kw.goldScore);
              return (
                <tr key={kw.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-amber-50 transition-all duration-200 group`}>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <span className="font-black text-slate-900 text-xl tracking-tight leading-relaxed group-hover:text-amber-700">{kw.keyword}</span>
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowUpRight className="w-3 h-3" />
                        {kw.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-slate-900 text-lg tabular-nums">
                    {kw.searchVolume.toLocaleString()}
                  </td>
                  <td className="px-10 py-8 text-right font-bold text-slate-400 text-lg tabular-nums">
                    {kw.documentCount.toLocaleString()}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      {kw.trend === 'up' && <div className="p-2 bg-emerald-100 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>}
                      {kw.trend === 'down' && <div className="p-2 bg-red-100 rounded-xl"><TrendingDown className="w-5 h-5 text-red-600" /></div>}
                      {kw.trend === 'stable' && <div className="p-2 bg-slate-200 rounded-xl"><Minus className="w-5 h-5 text-slate-500" /></div>}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className={`px-5 py-2 rounded-2xl text-[11px] font-black border-2 shadow-sm ${info.color}`}>
                        {info.label} ({kw.goldScore}점)
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{info.desc}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    {isPro ? (
                      <button 
                        onClick={() => onSelectKeyword(kw)}
                        className="p-4 rounded-2xl bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 hover:shadow-xl hover:shadow-amber-500/20 transition-all group-hover:scale-110"
                        title="롱테일 확장 (Pro 전용)"
                      >
                        <Wand2 className="w-6 h-6" />
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-200 text-slate-400 cursor-not-allowed relative group" title="Pro 플랜에서 사용 가능">
                        <Wand2 className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">P</span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                      <Database className="w-12 h-12" />
                    </div>
                    <p className="text-slate-400 text-xl font-bold">찾고 싶은 주제를 입력하면 황금이 쏟아집니다.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeywordTable;
