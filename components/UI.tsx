import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const AppShell = ({ children, hideNav = false }: { children?: React.ReactNode; hideNav?: boolean }) => {
    const location = useLocation();
    
    return (
        /* 
           Outer Wrapper: Centers the app on desktop and provides the dark background.
           Inner Shell: Strictly forces 430px width and adapts height (up to 932px on desktop) to simulate the device.
        */
        <div className="flex justify-center items-center min-h-[100dvh] bg-[#000000]">
            <div className="relative w-full max-w-[430px] h-[100dvh] md:h-[932px] bg-background-dark flex flex-col shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden md:rounded-[45px] md:border-[8px] md:border-[#121212] ring-1 ring-white/5">
                
                {/* Global Noise Texture Overlay */}
                <div className="bg-noise absolute inset-0 z-0 pointer-events-none"></div>

                {/* Main Content Area - Handles internal scrolling */}
                <div className="flex-1 flex flex-col relative z-10 overflow-y-auto hide-scrollbar scroll-smooth">
                    {children}
                </div>
                
                {!hideNav && (
                    <nav className="absolute bottom-0 left-0 right-0 z-50 w-full">
                        {/* Glassmorphism Navigation Bar */}
                        <div className="absolute inset-0 bg-[#0A0F0D]/80 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"></div>
                        
                        <div className="relative flex items-center justify-between px-2 pb-8 pt-4">
                            <Link to="/dashboard" className={`flex flex-col items-center gap-1.5 flex-1 group active:scale-95 transition-transform duration-200 ${location.pathname === '/dashboard' ? 'text-brand-emerald' : 'text-gray-500'}`}>
                                <div className="relative">
                                    <Icon name="dashboard" className={`text-[26px] transition-all duration-300 group-hover:-translate-y-1 ${location.pathname === '/dashboard' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                    {location.pathname === '/dashboard' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-emerald shadow-[0_0_5px_rgba(16,185,129,1)]"></div>}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${location.pathname === '/dashboard' ? 'opacity-100' : 'opacity-60'}`}>Home</span>
                            </Link>
                            
                            <Link to="/overview" className={`flex flex-col items-center gap-1.5 flex-1 group active:scale-95 transition-transform duration-200 ${location.pathname === '/overview' ? 'text-brand-emerald' : 'text-gray-500'}`}>
                                <Icon name="analytics" className={`text-[26px] transition-transform duration-300 group-hover:-translate-y-1 ${location.pathname === '/overview' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${location.pathname === '/overview' ? 'opacity-100' : 'opacity-60'}`}>Analytics</span>
                            </Link>
                            
                            {/* Exquisite Center Button - "The Gem" */}
                            <div className="relative -top-6 flex-1 flex justify-center z-10">
                                <Link to="/add-hub" className="group relative outline-none">
                                    {/* Dynamic Ambient Glow */}
                                    <div className="absolute inset-0 rounded-full bg-brand-emerald blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500 scale-110 group-active:scale-90"></div>
                                    
                                    {/* Main Button Structure */}
                                    <div className="relative size-[68px] rounded-full bg-gradient-to-b from-[#10B981] to-[#047857] flex items-center justify-center shadow-[0_10px_20px_rgba(4,120,87,0.4),0_-2px_4px_rgba(255,255,255,0.2)_inset] border border-white/10 group-active:scale-95 transition-all duration-300 overflow-hidden">
                                        
                                        {/* Glossy Top Highlight */}
                                        <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                                        
                                        {/* Icon with subtle text shadow */}
                                        <Icon name="add" className="text-[34px] font-bold text-white drop-shadow-md relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                                        
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                                    </div>
                                </Link>
                            </div>

                            <Link to="/bookkeeping" className={`flex flex-col items-center gap-1.5 flex-1 group active:scale-95 transition-transform duration-200 ${location.pathname === '/bookkeeping' ? 'text-brand-emerald' : 'text-gray-500'}`}>
                                <Icon name="menu_book" className={`text-[26px] transition-transform duration-300 group-hover:-translate-y-1 ${location.pathname === '/bookkeeping' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${location.pathname === '/bookkeeping' ? 'opacity-100' : 'opacity-60'}`}>Ledger</span>
                            </Link>
                            
                            <Link to="/profile" className={`flex flex-col items-center gap-1.5 flex-1 group active:scale-95 transition-transform duration-200 ${location.pathname === '/profile' ? 'text-brand-emerald' : 'text-gray-500'}`}>
                                <Icon name="person" className={`text-[26px] transition-transform duration-300 group-hover:-translate-y-1 ${location.pathname === '/profile' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${location.pathname === '/profile' ? 'opacity-100' : 'opacity-60'}`}>Profile</span>
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};