import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';

const OverviewScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    if (!context) return null;
    const { assets, totalNetWorth } = context;

    const [selectedCategory, setSelectedCategory] = useState('Total Net Worth');
    const [timeframe, setTimeframe] = useState('1m');

    const formatVal = (val: number) => `$${(val / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    
    // Updated Harmonious Colors: Green/Yellow Theme consistent with Dashboard
    const categories = useMemo(() => [
        { id: 'cash', label: 'Cash', val: formatVal(assets.cash), icon: 'payments', color: 'text-[#FCD34D]', bg: 'bg-[#FCD34D]', raw: assets.cash }, 
        { id: 'equities', label: 'Equities', val: formatVal(assets.equities), icon: 'monitoring', color: 'text-[#10B981]', bg: 'bg-[#10B981]', raw: assets.equities }, 
        { id: 'fixedIncome', label: 'Fixed Inc.', val: formatVal(assets.fixedIncome), icon: 'account_balance_wallet', color: 'text-[#6EE7B7]', bg: 'bg-[#6EE7B7]', raw: assets.fixedIncome }, 
        { id: 'fx', label: 'FX Holdings', val: formatVal(assets.fx), icon: 'currency_exchange', color: 'text-[#A3E635]', bg: 'bg-[#A3E635]', raw: assets.fx }, 
        { id: 'insurance', label: 'Insurance', val: formatVal(assets.insurance), icon: 'verified_user', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]', raw: assets.insurance }, 
        { id: 'liabilities', label: 'Liabilities', val: formatVal(assets.liabilities), icon: 'credit_card_off', color: 'text-[#D97706]', bg: 'bg-[#D97706]', raw: assets.liabilities } 
    ], [assets]);

    const selectedValue = useMemo(() => {
        if (selectedCategory === 'Total Net Worth') return `$${totalNetWorth.toLocaleString()}`;
        const found = categories.find(c => c.label === selectedCategory);
        return found ? found.val : `$${totalNetWorth.toLocaleString()}`;
    }, [selectedCategory, totalNetWorth, categories]);

    // Smoother, more premium looking chart path generation
    const generateMockPath = (category: string, timeframe: string, rawVal?: number) => {
        const points = 30; // More points for smoother curve
        const width = 400;
        const height = 120;
        let seed = (rawVal || totalNetWorth) / 1000 + timeframe.length;
        
        const coords = Array.from({ length: points }, (_, i) => {
            const x = (i / (points - 1)) * width;
            // Gentler noise for "executive" feel
            const noise = Math.sin(i * 0.3 + seed) * 10; 
            const trend = (i / points) * (timeframe === '1y' || timeframe === 'all' ? 30 : 5);
            const y = (height / 1.5) + noise - trend;
            return `${x},${y}`;
        }).join(' ');
        
        // Ensure starting point is smooth
        return `M ${coords}`;
    };

    return (
        <AppShell>
            {/* Header: Consistent tall, airy style */}
            <header className="flex items-center justify-between px-6 pt-12 pb-4 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Analytics</p>
                    <h2 className="text-xl font-bold text-white tracking-tight">Market Overview</h2>
                 </div>
                 <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                    <Icon name="ssid_chart" className="text-brand-emerald text-xl" />
                 </div>
            </header>

            <div className="px-5 pt-6 pb-32 space-y-8">
                
                {/* Main Performance Chart Card */}
                <div className="rounded-[24px] bg-gradient-to-b from-[#15231D] to-[#0D1A14] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                     {/* Dynamic Glow */}
                     <div className="absolute top-0 right-0 p-32 bg-brand-emerald/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-brand-emerald/10 transition-colors duration-700"></div>

                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <button 
                                    onClick={() => setSelectedCategory('Total Net Worth')}
                                    className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 hover:text-white transition-colors"
                                >
                                    {selectedCategory}
                                </button>
                                <h1 className="text-3xl font-black text-white tracking-tight animate-fade-in">{selectedValue}</h1>
                            </div>
                            
                            {/* Premium Timeframe Pills */}
                             <div className="flex bg-black/40 p-1 rounded-lg backdrop-blur-sm border border-white/5">
                                {['1d', '1w', '1m', '1y'].map(t => (
                                    <button 
                                        key={t} 
                                        onClick={() => setTimeframe(t)} 
                                        className={`
                                            text-[9px] font-bold px-3 py-1.5 rounded-md transition-all uppercase 
                                            ${t === timeframe 
                                                ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                                                : 'text-gray-500 hover:text-gray-300'
                                            }
                                        `}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-40 w-full relative">
                             <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                                    </linearGradient>
                                </defs>
                                <path 
                                    d={generateMockPath(selectedCategory, timeframe, categories.find(c => c.label === selectedCategory)?.raw)} 
                                    fill="none" 
                                    stroke="#10B981" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className="transition-all duration-700 ease-in-out"
                                />
                                <path 
                                    d={`${generateMockPath(selectedCategory, timeframe, categories.find(c => c.label === selectedCategory)?.raw)} L 400,150 L 0,150 Z`} 
                                    fill="url(#chartGradient)" 
                                    className="transition-all duration-700 ease-in-out opacity-80"
                                />
                             </svg>
                        </div>
                     </div>
                </div>

                {/* Categories Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Icon name="pie_chart" className="text-brand-emerald text-sm" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Asset Composition</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => {
                                    setSelectedCategory(cat.label);
                                    navigate(`/asset-detail/${cat.id}`);
                                }} 
                                className="group relative overflow-hidden rounded-[20px] bg-card-dark p-4 border border-white/5 transition-all active:scale-[0.98] cursor-pointer shadow-lg"
                            >
                                {/* Subtle Gradient overlay on hover */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.03] to-transparent`}></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between gap-5">
                                    <div className="flex justify-between items-start">
                                         <div className={`size-10 rounded-[14px] flex items-center justify-center bg-white/5 border border-white/5 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon name={cat.icon} className="text-xl" />
                                         </div>
                                         <div className="size-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1">
                                             <Icon name="arrow_forward" className="text-gray-400 text-[10px]" />
                                         </div>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg leading-none tracking-tight mb-1">{cat.val}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`size-1.5 rounded-full ${cat.bg}`}></div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{cat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AppShell>
    );
};

export default OverviewScreen;