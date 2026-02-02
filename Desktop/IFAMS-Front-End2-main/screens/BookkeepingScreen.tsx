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

    const filterActivitiesByTimeframe = (acts: Activity[], tf: string): Activity[] => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay; // 近似值
        const oneYear = 365 * oneDay; // 近似值

        return acts.filter(activity => {
            const activityTime = new Date(activity.time);
            const diff = now.getTime() - activityTime.getTime(); // 距离现在的毫秒数

            switch (tf) {
                case '1d': return diff <= oneDay;
                case '1w': return diff <= oneWeek;
                case '1m': return diff <= oneMonth;
                case '1y': return diff <= oneYear;
                case 'all': return true;
                default: return true;
            }
        });
    };

    const filteredActivities = useMemo(() => filterActivitiesByTimeframe(activities, timeframe), [activities, timeframe]);

    const currentListTotal = filteredActivities.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

    // Helper to get time boundaries based on timeframe
    const getTimeBoundaries = (tf: string, acts: Activity[]) => { // acts needed for 'all' case
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);

        switch (tf) {
            case '1d': 
                start.setHours(0, 0, 0, 0); 
                end.setHours(23, 59, 59, 999);
                return { start, end, interval: 'hour' };
            case '1w': 
                start.setDate(now.getDate() - 6); // Last 7 days
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end, interval: 'day' };
            case '1m': 
                start.setDate(now.getDate() - 29); // Last 30 days
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end, interval: 'day' };
            case '1y': 
                start.setFullYear(now.getFullYear() - 1);
                start.setMonth(now.getMonth() + 1); // Start of last year to current month
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end, interval: 'month' };
            case 'all': 
                const minTime = acts.length > 0 
                    ? new Date(Math.min(...acts.map(a => new Date(a.time).getTime()))) 
                    : new Date(now.getFullYear() - 5, 0, 1); // 5 years back if no activities
                start = minTime;
                end = now;
                return { start, end, interval: 'month' }; // Aggregate by month for 'all'
            default: 
                return { start: now, end: now, interval: 'hour' };
        }
    };

    // Main function to aggregate activities for chart
    const getChartDataPoints = (acts: Activity[], tf: string, width: number, height: number) => {
        if (acts.length === 0) return [];

        const { start, end, interval } = getTimeBoundaries(tf, acts); // Pass acts here
        const timeRangeMs = end.getTime() - start.getTime();

        // Aggregate spending by interval
        const aggregatedData: { [key: number]: number } = {};
        acts.forEach(activity => {
            const activityDate = new Date(activity.time);
            let key: number; // Timestamp representing the start of the interval

            if (interval === 'hour') {
                key = activityDate.setMinutes(0, 0, 0);
            } else if (interval === 'day') {
                key = activityDate.setHours(0, 0, 0, 0);
            } else if (interval === 'month') {
                key = new Date(activityDate.getFullYear(), activityDate.getMonth(), 1).getTime();
            } else {
                 key = activityDate.getTime(); // Fallback to exact timestamp
            }
            
            if (key >= start.getTime() && key <= end.getTime()) {
                aggregatedData[key] = (aggregatedData[key] || 0) + parseFloat(activity.amount || '0');
            }
        });

        // Sort by time and map to SVG coordinates
        const sortedKeys = Object.keys(aggregatedData).map(Number).sort((a, b) => a - b);
        if (sortedKeys.length === 0) return [];

        const maxSpending = Math.max(...Object.values(aggregatedData));
        const minTime = sortedKeys[0];
        const maxTime = sortedKeys[sortedKeys.length - 1];
        
        // Add start and end points for context, even if no spending there
        let dataPoints: {x: number, y: number}[] = [];
        // Ensure starting point is aligned with the timeframe's start
        dataPoints.push({x: 0, y: height}); 

        sortedKeys.forEach(time => {
            const x = (time - start.getTime()) / (timeRangeMs || 1) * width; // Normalize X to SVG width based on full time range
            const y = height - (aggregatedData[time] / (maxSpending || 1)) * (height - 20) - 10; // Normalize Y to SVG height (inverted for SVG), with padding
            dataPoints.push({x, y});
        });

        // Ensure ending point is aligned with the timeframe's end
        dataPoints.push({x: width, y: height}); 

        return dataPoints;
    };

    const chartDataPoints = useMemo(() => getChartDataPoints(filteredActivities, timeframe, 500, 150), [filteredActivities, timeframe]); // Pass width/height
    
    const totalSpending = useMemo(() => {
        return currentListTotal; // 直接使用筛选后的总金额
    }, [currentListTotal]);

    const spendingPath = useMemo(() => {
        if (chartDataPoints.length < 2) {
            return ""; 
        }

        const tension = 0.5; // 控制曲线的“紧绷”程度，0到1之间

        let d = `M ${chartDataPoints[0].x},${chartDataPoints[0].y}`;

        for (let i = 0; i < chartDataPoints.length - 1; i++) {
            const p0 = chartDataPoints[i];
            const p1 = chartDataPoints[i + 1];

            // Consider previous and next points for smoother transitions
            const prevPoint = i > 0 ? chartDataPoints[i - 1] : p0;
            const nextPoint = i < chartDataPoints.length - 2 ? chartDataPoints[i + 2] : p1;

            // Calculate control points for a smooth Bezier curve
            // cp1: control point for current point p0
            const cp1x = p0.x + (p1.x - prevPoint.x) * tension;
            const cp1y = p0.y + (p1.y - prevPoint.y) * tension;

            // cp2: control point for next point p1
            const cp2x = p1.x - (nextPoint.x - p0.x) * tension;
            const cp2y = p1.y - (nextPoint.y - p0.y) * tension;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        }
        return d;
    }, [chartDataPoints]);

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
                        {filteredActivities.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-8">
                                No activities found for this timeframe.
                            </div>
                        ) : (
                            filteredActivities.map((act) => (
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
                            ))
                        )}
                        
                        {/* Empty State Spacer */}
                        <div className="h-4"></div>
                        <div className="flex items-center justify-center gap-2 opacity-30">
                            <div className="h-px w-8 bg-gray-500"></div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">End of List</p>
                            <div className="h-px w-8 bg-gray-500"></div>
                        </div>
                    </div>                </div>
            </div>
        </AppShell>
    );
};

export default BookkeepingScreen;