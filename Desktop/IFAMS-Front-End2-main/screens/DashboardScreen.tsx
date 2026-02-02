import React, { useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';
import { Assets } from '../types';

// Helper for SVG Arcs
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Convert angle to radians. 
    // SVG Coordinate system: 0 degrees is 3 o'clock (Right). 
    // We want our chart to span 180 degrees from 9 o'clock (180deg) to 3 o'clock (360deg/0deg).
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

const createArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number, innerRadius: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const start2 = polarToCartesian(x, y, innerRadius, endAngle);
    const end2 = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", end2.x, end2.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, start2.x, start2.y,
        "Z"
    ].join(" ");
};

const DashboardScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    
    if (!context) return null;
    const { username, userAvatar, totalNetWorth, assets, financialScore, growthMetrics } = context;

    const currentCurrency = { code: 'USD', symbol: '$', rate: 1 };
    
    const portfolioValue = (totalNetWorth * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 });

    const nextDistDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(15);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, []);

    const growthAmountDisplay = (Math.abs(growthMetrics.amount) * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 });
    const growthColorClass = growthMetrics.isPositive ? 'text-brand-emerald' : 'text-rose-500';
    const growthBgClass = growthMetrics.isPositive 
        ? 'bg-brand-emerald/10 border border-brand-emerald/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
        : 'bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
    const growthIcon = growthMetrics.isPositive ? 'trending_up' : 'trending_down';

    const assetConfig = [
        { key: 'equities', label: 'Equities', colorHex: '#10B981', bgClass: 'bg-[#10B981]' },    
        { key: 'fixedIncome', label: 'Fixed Inc.', colorHex: '#34D399', bgClass: 'bg-[#34D399]' }, 
        { key: 'insurance', label: 'Insurance', colorHex: '#2DD4BF', bgClass: 'bg-[#2DD4BF]' },    
        { key: 'fx', label: 'FX Holdings', colorHex: '#A3E635', bgClass: 'bg-[#A3E635]' },        
        { key: 'cash', label: 'Cash', colorHex: '#fbbf24', bgClass: 'bg-[#fbbf24]' },             
        { key: 'liabilities', label: 'Liabilities', colorHex: '#F59E0B', bgClass: 'bg-[#F59E0B]' } 
    ];

    const { chartSegments, totalAllocated } = useMemo(() => {
        const total = (Object.values(assets) as number[]).reduce((a, b) => a + b, 0);
        let currentAngle = 180; // Start at 9 o'clock
        const gap = 2; // Degrees of gap between segments
        
        const relevantAssets = assetConfig.filter(item => (assets[item.key as keyof Assets] || 0) > 0);
        
        const segments = relevantAssets.map(item => {
            const val = assets[item.key as keyof Assets] || 0;
            const share = val / total;
            const degrees = share * 180;
            
            const start = currentAngle;
            const end = currentAngle + degrees;
            
            // Adjust start/end for visual gap
            // Ensure we don't render a negative arc if slice is tiny
            const renderStart = start + (gap / 2);
            const renderEnd = Math.max(renderStart, end - (gap / 2));
            
            currentAngle += degrees;
            
            const labelPct = Math.round(share * 100) + '%';

            return {
                ...item,
                d: createArc(120, 120, 110, renderStart, renderEnd, 70),
                percentageStr: labelPct,
                value: val
            };
        });

        return { chartSegments: segments, totalAllocated: relevantAssets.length };
    }, [assets]);

    return (
        <AppShell>
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
                <div className="absolute -top-[100px] -left-[50px] w-[300px] h-[300px] bg-brand-emerald/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-[50px] right-[-50px] w-[250px] h-[250px] bg-accent-gold/5 rounded-full blur-[80px]"></div>
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-12 pb-2 sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05]">
                <div className="flex items-center gap-4">
                    <div onClick={() => navigate('/profile')} className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold via-white to-brand-emerald opacity-0 group-hover:opacity-100 rounded-full blur-md transition-opacity duration-500"></div>
                        <div className="relative size-[44px] rounded-full p-[2px] bg-gradient-to-tr from-white/10 to-white/30 group-hover:from-accent-gold group-hover:to-brand-emerald transition-colors duration-500">
                             <div className="h-full w-full rounded-full bg-background-dark bg-center bg-cover border border-white/10" style={{backgroundImage: `url("${userAvatar}")`}}></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5 opacity-80">Portfolio Overview</p>
                        <h2 className="text-xl font-bold leading-none text-white tracking-tight drop-shadow-sm">Hello, {username}</h2>
                    </div>
                </div>
            </header>

            <div className="px-5 pb-36 space-y-5 pt-6 relative z-10 animate-fade-in">
                
                {/* Hero Card: Deep Atmospheric Gradient */}
                <div className="relative overflow-hidden rounded-[24px] p-0 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] group border border-white/[0.08]">
                    {/* Rich Background Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#111f18] via-[#0A0F0D] to-[#050505]"></div>
                    <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.15),transparent_40%)]"></div>
                    
                    {/* Content Container */}
                    <div className="relative z-10 p-7">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-brand-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <p className="text-[11px] font-bold tracking-[0.2em] text-gray-300 uppercase">Net Worth</p>
                            </div>
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md ${growthBgClass}`}>
                                <Icon name={growthIcon} className={`text-xs ${growthColorClass}`} />
                                <span className={`text-[11px] font-black ${growthColorClass}`}>{Math.abs(growthMetrics.percent).toFixed(1)}%</span>
                            </div>
                        </div>
                        
                        <p className="text-[46px] font-medium leading-none tracking-tight text-white drop-shadow-md my-4">
                            <span className="text-2xl font-light text-gray-500 mr-1 align-top mt-2 inline-block opacity-60">{currentCurrency.symbol}</span>
                            {portfolioValue}
                        </p>

                        <div className="flex items-center gap-2 mb-7">
                             <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                                <span className={`${growthMetrics.isPositive ? 'text-brand-emerald' : 'text-rose-500'} font-bold`}>
                                    {growthMetrics.isPositive ? '+' : '-'}{currentCurrency.symbol}{growthAmountDisplay}
                                </span>
                                <span className="text-xs opacity-50 uppercase tracking-wide font-bold">Past Month</span>
                            </p>
                        </div>

                        {/* Stats Grid with inner borders */}
                        <div className="flex items-center justify-between border-t border-white/[0.08] pt-5">
                            <div className="group/stat cursor-pointer">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-white transition-colors">YTD Return</p>
                                <p className={`text-base font-bold ${growthMetrics.prevNetWorth === 0 && totalNetWorth === 0 ? 'text-gray-400' : 'text-brand-emerald'} drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]`}>
                                    {growthMetrics.prevNetWorth === 0 && totalNetWorth === 0 ? 'N/A' : '+18.4%'} 
                                </p>
                            </div>
                            <div className="text-right group/stat cursor-pointer">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-white transition-colors">Next Distribution</p>
                                <div className="flex items-center justify-end gap-1.5 text-gray-200">
                                    <Icon name="event" className="text-sm text-brand-emerald" />
                                    {totalNetWorth === 0 ? (
                                        <p className="text-sm font-bold">N/A</p>
                                    ) : (
                                        <p className="text-sm font-bold">{nextDistDate}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allocation Card: Frosted Glass */}
                <div className="rounded-[24px] bg-[#0A0F0D]/70 backdrop-blur-xl p-6 border border-white/[0.06] shadow-xl relative overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-base font-bold text-white tracking-wide">Allocation</h2>
                        <button onClick={() => navigate('/overview')} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-bold text-brand-emerald uppercase tracking-wider hover:bg-brand-emerald/10 hover:border-brand-emerald/20 transition-all active:scale-95 flex items-center gap-1">
                            Analysis <Icon name="chevron_right" className="text-xs" />
                        </button>
                    </div>
                    
                    {/* SVG Chart Container */}
                    <div className="flex flex-col items-center justify-center pb-8 relative z-10">
                        {/* Glow behind chart */}
                        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 bg-brand-emerald/5 rounded-full blur-[50px]"></div>
                        
                        <div className="relative w-[240px] h-[120px]">
                            <svg width="240" height="120" viewBox="0 0 240 120" className="overflow-visible">
                                <defs>
                                    <filter id="glow-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                        <feOffset dx="0" dy="0" result="offsetblur" />
                                        <feComponentTransfer>
                                            <feFuncA type="linear" slope="0.5" />
                                        </feComponentTransfer>
                                        <feMerge>
                                            <feMergeNode />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {chartSegments.map((seg, i) => (
                                    <path
                                        key={seg.key}
                                        d={seg.d}
                                        fill={seg.colorHex}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                                        filter="url(#glow-shadow)" // Apply subtle glow to segments
                                        onClick={() => navigate(`/asset-detail/${seg.key}`)}
                                    />
                                ))}
                            </svg>
                            
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-center pointer-events-none">
                                <p className="font-bold text-white leading-none drop-shadow-lg">
                                    <span className="text-3xl tracking-tighter">{totalAllocated}</span>
                                </p>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">Classes</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/[0.05] relative z-10">
                        {chartSegments.map((asset, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => navigate(`/asset-detail/${asset.key}`)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl transition-all hover:bg-white/[0.04] active:scale-95 group border border-transparent hover:border-white/[0.05]"
                            >
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className={`size-2 rounded-full ${asset.bgClass} shadow-[0_0_5px_currentColor]`}></div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tight group-hover:text-gray-300 transition-colors">{asset.label}</span>
                                </div>
                                <span className="text-sm font-bold text-white/90 group-hover:text-white">{asset.percentageStr}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Insights: Floating Pill */}
                <div onClick={() => navigate('/health')} className="group relative rounded-[20px] p-[1px] cursor-pointer active:scale-[0.98] transition-all">
                    {/* Gradient Border via Background */}
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-white/10 via-brand-emerald/30 to-white/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative flex items-center justify-between p-4 rounded-[19px] bg-[#0C1411] backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="relative flex flex-shrink-0 items-center justify-center size-12">
                                <svg className="size-full -rotate-90 transform group-hover:scale-110 transition-transform duration-500" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" fill="transparent" r="36" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="4"></circle>
                                    <circle cx="40" cy="40" fill="transparent" r="36" stroke="#10B981" strokeDasharray="226" strokeDashoffset={226 - (226 * financialScore / 100)} strokeLinecap="round" strokeWidth="4" className="drop-shadow-[0_0_4px_#10B981]"></circle>
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-xs font-black text-white">{financialScore}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest mb-0.5">AI Insights</p>
                                <p className="text-sm font-bold text-gray-200">Portfolio Health: {financialScore > 85 ? 'Excellent' : 'Good'}</p>
                            </div>
                        </div>
                        <div className="size-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-brand-emerald group-hover:text-white transition-all shadow-md">
                            <Icon name="arrow_forward" className="text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button: Jeweled Look - Moved up to bottom-36 */}
            <div className="fixed bottom-36 right-6 z-50 animate-fade-in-up">
                <Link to="/ai-concierge" className="group relative flex size-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 border border-white/20 overflow-hidden">
                    {/* Inner Shine */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald to-emerald-400"></div>
                    <Icon name="smart_toy" className="text-[26px] font-bold relative z-10 drop-shadow-sm" />
                    {/* Ring Pulse */}
                    <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-20"></div>
                </Link>
            </div>
        </AppShell>
    );
};

export default DashboardScreen;