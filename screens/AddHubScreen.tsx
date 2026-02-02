import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Icon } from '../components/UI';

const AddHubScreen = () => {
    const navigate = useNavigate();

    // Consistent color mapping with Dashboard & Overview
    const categories = [
        { name: 'Cash & Deposits', icon: 'account_balance_wallet', path: '/add-cash', color: 'text-[#FCD34D]', bg: 'bg-[#FCD34D]/10', border: 'border-[#FCD34D]/20', gradient: 'from-[#FCD34D]/5 to-transparent' },
        { name: 'Equities', icon: 'monitoring', path: '/add-equities', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20', gradient: 'from-[#10B981]/5 to-transparent' },
        { name: 'Fixed Income', icon: 'receipt_long', path: '/add-fixed-income', color: 'text-[#6EE7B7]', bg: 'bg-[#6EE7B7]/10', border: 'border-[#6EE7B7]/20', gradient: 'from-[#6EE7B7]/5 to-transparent' },
        { name: 'FX Holdings', icon: 'currency_exchange', path: '/add-fx', color: 'text-[#A3E635]', bg: 'bg-[#A3E635]/10', border: 'border-[#A3E635]/20', gradient: 'from-[#A3E635]/5 to-transparent' },
        { name: 'Insurance', icon: 'verified_user', path: '/add-insurance', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10', border: 'border-[#2DD4BF]/20', gradient: 'from-[#2DD4BF]/5 to-transparent' },
        { name: 'Liabilities', icon: 'credit_card_off', path: '/add-liability', color: 'text-[#D97706]', bg: 'bg-[#D97706]/10', border: 'border-[#D97706]/20', gradient: 'from-[#D97706]/5 to-transparent' }
    ];

    return (
        <AppShell>
            {/* Header: Cleaned up - Removed Icon */}
            <header className="px-6 pt-12 pb-4 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Portfolio Management</p>
                    <h2 className="text-xl font-bold text-white tracking-tight">Add New Holding</h2>
                 </div>
            </header>
            
            <div className="px-5 pt-6 pb-32 space-y-6">
                
                {/* Intro / Context Card */}
                <div className="relative overflow-hidden rounded-2xl bg-card-dark border border-white/5 p-5">
                    <div className="absolute top-0 right-0 p-16 bg-brand-emerald/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10 flex gap-4">
                        <div className="size-10 rounded-full bg-brand-emerald/10 flex items-center justify-center flex-shrink-0">
                            <Icon name="playlist_add" className="text-brand-emerald text-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">Select Asset Class</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Choose a category below to record a new position. All entries automatically update your Net Worth and Solvency metrics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat, i) => (
                        <button 
                            key={i} 
                            onClick={() => navigate(cat.path)} 
                            className={`
                                group relative overflow-hidden flex flex-col justify-between
                                h-[160px] rounded-[24px] bg-card-dark p-5 border border-white/5
                                transition-all duration-300 active:scale-[0.96] hover:border-white/10 hover:shadow-2xl
                            `}
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            
                            {/* Top: Icon in Glass Container */}
                            <div className="relative z-10 flex justify-between items-start">
                                <div className={`size-12 rounded-2xl flex items-center justify-center backdrop-blur-md ${cat.bg} ${cat.border} border transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                                    <Icon name={cat.icon} className={`text-2xl ${cat.color}`} />
                                </div>
                                <div className="size-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -mr-1 -mt-1 transform translate-x-2 group-hover:translate-x-0">
                                     <Icon name="arrow_forward" className="text-white text-[10px]" />
                                </div>
                            </div>
                            
                            {/* Bottom: Label */}
                            <div className="relative z-10 text-left">
                                <h4 className="text-sm font-bold text-white tracking-wide group-hover:translate-x-1 transition-transform duration-300">{cat.name}</h4>
                                <div className={`h-0.5 w-0 group-hover:w-6 ${cat.bg.replace('/10', '')} mt-2 rounded-full transition-all duration-500`}></div>
                            </div>
                        </button>
                    ))}
                </div>
                
                {/* Removed Quick Expense Button */}
                
            </div>
        </AppShell>
    );
};

export default AddHubScreen;