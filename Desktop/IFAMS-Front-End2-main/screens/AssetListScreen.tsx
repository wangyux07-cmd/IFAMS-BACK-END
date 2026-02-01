import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';
import { Assets } from '../types';

const AssetListScreen = () => {
    const navigate = useNavigate();
    const { category } = useParams<{ category: keyof Assets }>();
    const context = useContext(AppContext);

    if (!context || !category) return null;

    const { assetItems, assets } = context;

    const filteredItems = assetItems.filter(item => item.assetKey === category);
    const totalValue = assets[category] || 0;

    const categoryTitles: { [key: string]: string } = {
        cash: 'Cash Assets',
        equities: 'Equities',
        fixedIncome: 'Fixed Income',
        fx: 'FX Holdings',
        insurance: 'Insurance Policies',
        liabilities: 'Liabilities'
    };
    
    const title = categoryTitles[category] || 'Assets';

    // Simple rate lookup for display (matching Context)
    const RATES: { [key: string]: number } = {
        'USD': 1,
        'EUR': 1.09,
        'GBP': 1.27,
        'HKD': 0.128,
        'CNY': 0.138,
        'JPY': 0.0068
    };

    return (
        <AppShell hideNav>
            <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
                <div className="px-4 py-4 flex items-center">
                    <button onClick={() => navigate('/overview')} className="text-white/60 hover:text-white transition-colors">
                        <Icon name="chevron_left" className="text-3xl" />
                    </button>
                    <h1 className="flex-1 text-center font-bold text-lg text-white">{title}</h1>
                    <div className="w-9"></div> {/* Spacer for center alignment */}
                </div>
                
                <div className="px-6 pb-6 pt-2 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Value (USD)</p>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        ${totalValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </h2>
                </div>
            </header>

            <div className="px-4 py-6 space-y-4 pb-20">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Icon name="folder_off" className="text-4xl mb-2 opacity-50" />
                        <p className="text-sm">No assets recorded in this category.</p>
                        <button 
                            onClick={() => navigate('/add-hub')} 
                            className="mt-4 text-brand-emerald text-sm font-bold uppercase tracking-wider"
                        >
                            Add New +
                        </button>
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const rate = RATES[item.currency] || 1;
                        const isForeign = item.currency !== 'USD';
                        const convertedValue = item.amount * rate;

                        return (
                            <div key={item.id} className="bg-card-dark rounded-2xl p-5 border border-white/5 animate-fade-in group hover:border-brand-emerald/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white text-base">{item.name}</h3>
                                        <p className="text-xs text-brand-emerald font-medium uppercase tracking-wide mt-0.5">{item.institution}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white text-lg">
                                            {item.currency} {item.amount.toLocaleString()}
                                        </p>
                                        {isForeign && (
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                ≈ ${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-gray-500 mt-0.5">{item.date}</p>
                                    </div>
                                </div>
                                
                                {/* Dynamic Attributes Display */}
                                {item.attributes && Object.keys(item.attributes).length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {Object.entries(item.attributes).map(([key, val]) => (
                                            <div key={key} className="px-2 py-1 bg-white/5 rounded-md border border-white/10 flex items-center gap-1.5">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase">{key}</span>
                                                <span className="text-[10px] font-bold text-white">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item.remarks && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-xs text-gray-400 italic">"{item.remarks}"</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </AppShell>
    );
};

export default AssetListScreen;