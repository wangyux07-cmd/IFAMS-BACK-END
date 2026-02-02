import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';

const BookkeepingScreen = () => {
    const navigate = useNavigate();
    const [timeframe, setTimeframe] = useState('1m');
    const context = useContext(AppContext);
    
    if (!context) return null;
    const { activities } = context;

    const currentListTotal = activities.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

    const totalSpending = useMemo(() => {
        switch(timeframe) {
            case '1d': return currentListTotal;
            case '1w': return currentListTotal * 4.5 + 120;
            case '1m': return currentListTotal * 18 + 450;
            case '1y': return currentListTotal * 150 + 2000;
            case 'all': return currentListTotal * 300 + 5000;
            default: return currentListTotal;
        }
    }, [timeframe, currentListTotal]);

    const spendingPath = useMemo(() => {
        const points = 25; 
        const width = 500;
        const height = 150;
        const seed = timeframe.length * 100 + (timeframe === '1m' ? 50 : 0); 
        
        const coords = Array.from({ length: points }, (_, i) => {
            const x = (i / (points - 1)) * width;
            const wave1 = Math.sin(i * 0.4 + seed) * 25;
            const wave2 = Math.cos(i * 0.7) * 15;
            const y = (height / 2) - (wave1 + wave2); 
            return `${x},${y}`;
        });

        let d = `M ${coords[0]}`;
        for (let i = 1; i < coords.length; i++) {
            const [x0, y0] = coords[i - 1].split(',').map(Number);
            const [x1, y1] = coords[i].split(',').map(Number);
            const cp1x = x0 + (x1 - x0) * 0.5;
            const cp1y = y0;
            const cp2x = x1 - (x1 - x0) * 0.5;
            const cp2y = y1;
            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
        }
        return d;
    }, [timeframe]);

    return (
        <AppShell>
             {/* 1. Ambient Background (Aurora) */}
             <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[60%] rounded-full bg-gradient-radial from-cyan-500/10 to-transparent opacity-40 blur-[100px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] -left-[20%] w-[100%] h-[50%] rounded-full bg-gradient-radial from-blue-600/10 to-transparent opacity-30 blur-[120px]"></div>
            </div>

            {/* Main Layout - changed from h-[100dvh] to min-h-full to accommodate scroll */}
            <div className="flex flex-col min-h-full relative z-10">
                
                {/* Header */}
                <header className="px-6 pt-12 pb-2 flex items-center justify-center flex-shrink-0">
                    <div className="px-4 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                         <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Cash Flow</span>
                    </div>
                </header>
                
                {/* 2. HERO */}
                <div className="flex-shrink-0 flex flex-col items-center pt-4 pb-6 relative">
                    
                    {/* Timeframe Pills - Glass Segmented Control */}
                    <div className="flex bg-[#0A0F0D]/60 p-1 rounded-full backdrop-blur-md border border-white/[0.08] mb-6 shadow-xl scale-95">
                        {['1d', '1w', '1m', '1y'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setTimeframe(t)} 
                                className={`
                                    relative text-[9px] font-bold px-5 py-2 rounded-full transition-all uppercase tracking-wider
                                    ${t === timeframe 
                                        ? 'text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {t === timeframe && (
                                    <div className="absolute inset-0 bg-cyan-400 rounded-full"></div>
                                )}
                                <span className="relative z-10">{t}</span>
                            </button>
                        ))}
                    </div>

                    <div className="text-center space-y-2 relative z-10">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Total Outflow</p>
                        <h1 className="text-[52px] font-medium text-white tracking-tighter leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                            <span className="text-3xl font-light text-cyan-500/60 align-top mr-1">$</span>
                            {totalSpending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h1>
                    </div>

                    {/* Glowing Chart Underlay */}
                    <div className="w-full h-28 mt-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-dark/30 z-10"></div>
                        
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                                </linearGradient>
                                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {/* Fill Area */}
                            <path 
                                d={`${spendingPath} L 500,150 L 0,150 Z`} 
                                fill="url(#chartGlow)" 
                                className="transition-all duration-700 ease-in-out opacity-80"
                            />
                            {/* Stroke Line */}
                            <path 
                                d={spendingPath} 
                                fill="none" 
                                stroke="#22d3ee" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                filter="url(#neonGlow)"
                                className="transition-all duration-700 ease-in-out drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                            />
                        </svg>
                    </div>
                </div>

                {/* 3. FROSTED CONSOLE */}
                <div className="flex-1 bg-[#0A0F0D]/70 backdrop-blur-2xl rounded-t-[32px] border-t border-white/[0.08] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-fade-in-up">
                    
                    {/* Console Header */}
                    <div className="px-8 pt-6 pb-4 flex justify-between items-center bg-gradient-to-b from-white/[0.02] to-transparent flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                             <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
                             <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Recent Transactions</h3>
                        </div>
                        <button 
                            onClick={() => navigate('/add-expense')}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95"
                        >
                            <span className="text-[9px] font-bold text-gray-400 group-hover:text-cyan-400 uppercase tracking-wider transition-colors">Add New</span>
                            <div className="size-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                <Icon name="add" className="text-[10px] font-bold" />
                            </div>
                        </button>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-6 pb-28 hide-scrollbar space-y-3">
                        {activities.map((act) => (
                            <div key={act.id} className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-lg">
                                {/* Hover Glow Line */}
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>

                                <div className="relative z-10 size-12 rounded-2xl bg-[#111] flex items-center justify-center border border-white/[0.08] group-hover:scale-105 transition-transform shadow-inner">
                                    <Icon name={act.icon} className="text-cyan-200 text-xl" />
                                </div>
                                
                                <div className="relative z-10 flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{act.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold tracking-wide flex items-center gap-1.5 mt-1 uppercase">
                                        <span className="truncate max-w-[100px] text-cyan-500/80">{act.category}</span>
                                        <span className="size-0.5 rounded-full bg-gray-600"></span>
                                        <span>{new Date(act.time).toLocaleDateString()} - {new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </p>
                                </div>
                                
                                <div className="relative z-10 flex items-center gap-2"> {/* Added flex container for amount and delete button */}
                                    <p className="text-sm font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all tabular-nums">
                                        -${act.amount}
                                    </p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteActivity(act.id); }} 
                                        className="size-6 rounded-full bg-white/5 flex items-center justify-center text-gray-700 hover:bg-rose-500 hover:text-white transition-all"
                                        aria-label="Delete activity"
                                    >
                                        <Icon name="delete" className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State Spacer */}
                        <div className="h-4"></div>
                        <div className="flex items-center justify-center gap-2 opacity-30">
                            <div className="h-px w-8 bg-gray-500"></div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">End of List</p>
                            <div className="h-px w-8 bg-gray-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default BookkeepingScreen;