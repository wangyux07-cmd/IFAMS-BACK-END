import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    
    if (!context) return null;
    const { username, userAvatar, setUserAvatar, totalNetWorth, financialScore } = context;

    const handleUpdateAvatar = () => {
        const newAvatar = `https://picsum.photos/seed/${Date.now()}/200/200`;
        setUserAvatar(newAvatar);
        setShowAvatarMenu(false);
    };

    // Updated menu items to include AI Concierge
    const menuItems = [
        { 
            title: 'Settings & Security', 
            subtitle: 'Biometrics, App Preferences', 
            icon: 'settings_suggest', 
            path: '/settings',
            color: 'text-gray-400 group-hover:text-brand-emerald'
        },
        { 
            title: 'AI Concierge', 
            subtitle: '24/7 Wealth Assistant & Support', 
            icon: 'smart_toy', 
            path: '/ai-concierge',
            color: 'text-brand-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
        },
    ];

    return (
        <AppShell>
            {/* 1. Enhanced Ambient Background - Deeper, Richer */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050505]">
                 <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[70%] rounded-full bg-gradient-radial from-brand-emerald/10 via-brand-dark/20 to-transparent opacity-50 blur-[120px]"></div>
                 <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[80%] rounded-full bg-gradient-radial from-blue-900/10 via-purple-900/5 to-transparent opacity-30 blur-[100px]"></div>
            </div>

            {/* Added pb-32 to ensure scrolling space for the Sign Out button above the nav bar */}
            <div className="relative z-10 flex flex-col min-h-full px-6 pt-12 pb-32">
                
                {/* 2. Header */}
                <header className="flex justify-center mb-8 animate-fade-in">
                     <div className="px-5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md shadow-lg">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Executive Profile</span>
                     </div>
                </header>

                {/* 3. Hero User Card */}
                <div className="flex flex-col items-center mb-10 animate-fade-in delay-75">
                    {/* Avatar with Complex Ring Animation */}
                    <div className="relative group mb-6 cursor-pointer" onClick={() => setShowAvatarMenu(true)}>
                        {/* Outer Glow Rings - Interactive */}
                        <div className="absolute inset-0 rounded-full border border-brand-emerald/30 scale-105 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-700 ease-out"></div>
                        <div className="absolute inset-0 rounded-full border border-white/10 scale-110 opacity-0 group-hover:scale-150 group-hover:opacity-40 transition-all duration-1000 delay-75 ease-out"></div>
                        
                        {/* Main Container */}
                        <div className="relative block rounded-full p-1.5 bg-gradient-to-tr from-brand-emerald via-cyan-600 to-transparent shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-transform duration-300">
                            <div className="size-32 rounded-full bg-[#050B08] p-1">
                                <div className="size-full rounded-full bg-cover bg-center border border-white/10 group-hover:grayscale-0 transition-all duration-500" style={{backgroundImage: `url("${userAvatar}")`}}></div>
                            </div>
                            
                            {/* Edit Badge */}
                            <div className="absolute bottom-1 right-1 size-9 rounded-full bg-[#15201B] border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:bg-brand-emerald group-hover:text-black transition-colors duration-300 z-20">
                                <Icon name="edit" className="text-sm" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">{username}</h2>
                    
                    <div className="flex items-center gap-2 mb-8">
                        <div className="px-3 py-1 rounded-full bg-[#0A0F0D] border border-brand-emerald/20 flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
                            <div className="size-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(16,185,129,1)] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">Premium Member</span>
                        </div>
                    </div>

                    {/* Stats Glass Panel - Refined */}
                    <div className="flex w-full max-w-[340px] bg-[#0A0F0D]/60 border border-white/[0.08] rounded-2xl p-0 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        {/* Gloss Top */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70"></div>

                        <div className="flex-1 flex flex-col items-center py-5 border-r border-white/[0.08] relative group/stat cursor-default">
                             <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                             <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 relative z-10">Net Worth</p>
                             <p className="text-lg font-black text-white tracking-tight relative z-10 group-hover/stat:scale-105 transition-transform duration-300 drop-shadow-sm">
                                ${(totalNetWorth / 1000000).toFixed(1)}M
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-5 relative group/stat cursor-default">
                             <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                             <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 relative z-10">Health Score</p>
                             <div className="relative z-10 group-hover/stat:scale-105 transition-transform duration-300 flex items-baseline">
                                 <p className={`text-lg font-black ${financialScore > 80 ? 'text-brand-emerald' : 'text-accent-gold'} drop-shadow-sm`}>
                                    {financialScore}
                                </p>
                                <span className="text-[10px] text-gray-600 font-bold ml-0.5">/100</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 4. Menu List - Glass Slabs */}
                <div className="space-y-4 animate-fade-in delay-150">
                    {menuItems.map((item, i) => (
                        <div 
                            key={i} 
                            onClick={() => navigate(item.path)}
                            className="group relative overflow-hidden flex items-center gap-5 p-5 rounded-[24px] bg-[#0A0F0D]/40 border border-white/[0.06] hover:bg-white/[0.04] hover:border-brand-emerald/30 active:scale-[0.98] transition-all duration-300 cursor-pointer backdrop-blur-lg shadow-sm hover:shadow-xl"
                        >
                             {/* Hover Shine */}
                             <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                             
                             {/* Icon Box */}
                            <div className={`relative z-10 size-12 rounded-2xl bg-[#151a18] border border-white/[0.08] flex items-center justify-center transition-all duration-300 shadow-inner group-hover:border-brand-emerald/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]`}>
                                <Icon name={item.icon} className={`text-2xl transition-colors ${item.color}`} />
                            </div>
                            
                            <div className="relative z-10 flex-1">
                                <h4 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors duration-300">{item.title}</h4>
                                <p className="text-xs text-gray-500 font-medium tracking-wide mt-0.5 group-hover:text-gray-400 transition-colors">{item.subtitle}</p>
                            </div>
                            
                            {/* Arrow Animation */}
                            <div className="relative z-10 size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-brand-emerald group-hover:text-white transition-all duration-300">
                                <Icon name="arrow_forward" className="text-xs transform group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 5. Sign Out - Distinct Button below menu */}
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-8 w-full h-14 flex items-center justify-center gap-2 rounded-2xl border border-rose-500/10 bg-rose-500/[0.03] text-rose-500/70 font-bold uppercase tracking-widest text-xs hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] active:scale-[0.98] transition-all duration-300 group"
                >
                    <Icon name="logout" className="text-base group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Avatar Selection Modal */}
            {showAvatarMenu && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowAvatarMenu(false)}>
                    <div className="w-full max-w-[430px] p-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#15201B]/90 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                            <div className="p-6 pb-2 text-center">
                                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4"></div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Update Profile Photo</h3>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                <button onClick={handleUpdateAvatar} className="w-full h-16 rounded-2xl bg-white/5 hover:bg-brand-emerald/10 border border-white/5 hover:border-brand-emerald/30 flex items-center justify-center gap-3 text-white transition-all duration-300 group">
                                    <div className="size-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-emerald group-hover:text-black transition-colors">
                                        <Icon name="photo_camera" className="text-gray-400 group-hover:text-black text-sm" />
                                    </div>
                                    <span className="text-sm font-bold">Take Photo</span>
                                </button>
                                <button onClick={handleUpdateAvatar} className="w-full h-16 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center gap-3 text-white transition-all duration-300 group">
                                    <div className="size-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                                        <Icon name="photo_library" className="text-gray-400 group-hover:text-black text-sm" />
                                    </div>
                                    <span className="text-sm font-bold">Choose from Library</span>
                                </button>
                            </div>
                            
                            <div className="p-4 pt-0">
                                <button 
                                    onClick={() => setShowAvatarMenu(false)}
                                    className="w-full h-14 rounded-2xl bg-transparent hover:bg-white/5 text-gray-500 font-bold text-sm transition-colors uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
};

export default ProfileScreen;