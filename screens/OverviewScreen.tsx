import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';

const OverviewScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    if (!context) return null;
    const { assets, totalNetWorth, loading, assetItems } = context;

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-full text-white text-lg">
                    Loading Overview Data...
                </div>
            </AppShell>
        );
    }

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

    const hasChartData = useMemo(() => {
        if (selectedCategory === 'Total Net Worth') {
            return totalNetWorth > 0;
        }
        const found = categories.find(c => c.label === selectedCategory);
        return found ? found.raw > 0 : false;
    }, [selectedCategory, totalNetWorth, categories]);

    const chartWidth = 400;
    const chartHeight = 160;
    const flatLineY = 80; // 无数据时水平线 y 位置

    /** 无数据时：生成一条水平直线路径 */
    const generateFlatPath = () => {
        return `M 0,${flatLineY} L ${chartWidth},${flatLineY}`;
    };

    /** 有数据时：按 1d / 1w / 1m / 1y 区分波动与趋势 */
    const generateMockPath = (category: string, timeframe: string, rawVal?: number) => {
        const points = timeframe === '1d' ? 12 : timeframe === '1w' ? 20 : 30;
        const width = chartWidth;
        const height = 120;
        const seed = (rawVal || totalNetWorth) / 1000 + timeframe.length;

        const config = {
            '1d': { noise: 2, trend: 0 },   // 一天：几乎平直
            '1w': { noise: 6, trend: 8 },  // 一周：小幅波动
            '1m': { noise: 12, trend: 15 }, // 一月：中等波动与趋势
            '1y': { noise: 18, trend: 35 }, // 一年：明显趋势与波动
        }[timeframe] || { noise: 12, trend: 15 };

        const coords = Array.from({ length: points }, (_, i) => {
            const x = (i / (points - 1)) * width;
            const noise = Math.sin(i * 0.3 + seed) * config.noise;
            const trend = (i / points) * config.trend;
            const y = (height / 1.5) + noise - trend;
            return `${x},${y}`;
        }).join(' ');

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

                        {/* Chart Area：无数据时显示水平直线，有数据时按 1d/1m/1y 显示变化 */}
                        <div className="h-48 w-full relative">
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                                    </linearGradient>
                                </defs>
                                {hasChartData ? (
                                    <>
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
                                            d={`${generateMockPath(selectedCategory, timeframe, categories.find(c => c.label === selectedCategory)?.raw)} L ${chartWidth},150 L 0,150 Z`}
                                            fill="url(#chartGradient)"
                                            className="transition-all duration-700 ease-in-out opacity-80"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <path
                                            d={generateFlatPath()}
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeDasharray="4 4"
                                            className="opacity-60 transition-all duration-500"
                                        />
                                        <path
                                            d={`${generateFlatPath()} L ${chartWidth},150 L 0,150 Z`}
                                            fill="url(#chartGradient)"
                                            className="opacity-40 transition-all duration-500"
                                        />
                                    </>
                                )}
                            </svg>
                            {!hasChartData && (
                                {}
                            )}
                        </div>
                    </div>
                </div>

                {/* Asset Categories Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {categories.map(category => (
                        <div 
                            key={category.id} 
                            onClick={() => navigate(`/asset-detail/${category.id}`)} // 点击导航
                            className="flex flex-col items-start p-5 rounded-[24px] bg-gradient-to-b from-[#15231D] to-[#0D1A14] border border-white/5 shadow-2xl cursor-pointer hover:border-brand-emerald/50 transition-all duration-300 active:scale-95"
                        >
                            <div className={`size-10 rounded-full flex items-center justify-center mb-3 ${category.bg}/20 border border-white/10`}>
                                <Icon name={category.icon} className={`${category.color} text-xl`} />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">{category.label}</p>
                            <p className="text-white text-lg font-bold">{category.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
};

export default OverviewScreen;