import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AppShell, Icon } from '../components/UI';
import { Assets } from '../types';
import { GoogleGenerativeAI, Chat, GenerateContentResponse } from "@google/generative-ai";

// --- UI COMPONENTS ---

// 1. Ultra-Premium Input (Micro-glow interaction)
// Updated to handle date inputs elegantly by masking the browser default placeholder
const PremiumInput = ({ label, value, onChange, placeholder, type = "text", icon, autoFocus = false, themeColor = "text-brand-emerald" }: any) => {
    const [focused, setFocused] = useState(false);
    
    // Logic to hide default browser date mask (e.g., "年/月/日") when empty
    // We show a text input with English placeholder initially, and switch to date on focus/value
    const isDate = type === 'date';
    const showDateInput = isDate && (focused || value);
    const inputType = showDateInput ? 'date' : (isDate ? 'text' : type);

    return (
        <div className="group space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] pl-1 transition-colors group-focus-within:text-white/80">{label}</label>
            <div className="relative transition-all duration-500">
                <input 
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={isDate ? "YYYY-MM-DD" : placeholder}
                    autoFocus={autoFocus}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    lang="en-US"
                    style={inputType === 'date' ? { colorScheme: 'dark' } : {}}
                    className={`
                        w-full h-14 bg-white/[0.03] border border-white/5 rounded-xl px-4 pl-12 
                        text-white text-base font-medium placeholder:text-gray-700 
                        focus:outline-none focus:bg-white/[0.06] focus:border-white/20 focus:ring-1 focus:ring-white/10
                        transition-all duration-300
                        ${inputType === 'date' ? 'uppercase tracking-wider' : ''}
                    `}
                />
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-300 ${focused ? themeColor : 'group-hover:text-gray-400'}`}>
                    <Icon name={icon || "edit"} className="text-xl" />
                </div>
                {/* Subtle glow effect on focus */}
                <div className={`absolute inset-0 rounded-xl pointer-events-none opacity-0 ${focused ? 'opacity-100' : ''} transition-opacity duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)]`}></div>
            </div>
        </div>
    );
};

// 2. Refined Pill Selector with Add Capability
const PillSelector = ({ options, value, onChange, label, activeClass = "bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20", onAdd }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newVal, setNewVal] = useState("");

    const handleAdd = () => {
        if (newVal.trim()) {
            if (onAdd) onAdd(newVal.trim());
            onChange(newVal.trim());
            setNewVal("");
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] pl-1">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: string) => (
                    <button 
                        key={opt} 
                        onClick={() => onChange(opt)}
                        className={`
                            px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                            ${value === opt 
                                ? `${activeClass} border-transparent transform scale-105` 
                                : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10 hover:bg-white/5'}
                        `}
                    >
                        {opt}
                    </button>
                ))}
                
                {onAdd && (
                    isAdding ? (
                         <div className="flex items-center gap-2 animate-fade-in">
                            <input 
                                autoFocus
                                value={newVal}
                                onChange={(e) => setNewVal(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleAdd();
                                    if(e.key === 'Escape') setIsAdding(false);
                                }}
                                className="w-24 bg-white/[0.05] border border-white/20 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-600"
                                placeholder="Custom..."
                            />
                            <button onClick={handleAdd} className="size-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-brand-emerald hover:text-white transition-colors">
                                <Icon name="check" className="text-sm" />
                            </button>
                             <button onClick={() => setIsAdding(false)} className="size-8 rounded-lg hover:bg-white/5 text-gray-500 flex items-center justify-center transition-colors">
                                <Icon name="close" className="text-sm" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1 group"
                        >
                            <Icon name="add" className="text-xs transition-transform group-hover:rotate-90" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Add</span>
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export const SimpleForm = ({ title, assetKey }: { title: string; assetKey?: keyof Assets }) => {
    // Re-implementing full SimpleForm to ensure no code loss
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const { addAssetItem, addActivity, assetItems } = context!;
    
    const isExpense = !assetKey;
    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [institution, setInstitution] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState("");
    
    const isEquities = assetKey === 'equities';
    const isFixedIncome = assetKey === 'fixedIncome';
    const isCash = assetKey === 'cash';
    const isFX = assetKey === 'fx';
    const isLiabilities = assetKey === 'liabilities';
    const isInsurance = assetKey === 'insurance';

    const [accountType, setAccountType] = useState("Savings");
    const [equityType, setEquityType] = useState("Stock");
    const [ticker, setTicker] = useState(""); 
    const [sharePrice, setSharePrice] = useState("");
    const [shareQuantity, setShareQuantity] = useState("");
    const [avgCost, setAvgCost] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [maturityDate, setMaturityDate] = useState(""); 
    const [paymentFrequency, setPaymentFrequency] = useState("Annually");
    const [costBasis, setCostBasis] = useState("");
    const [loanType, setLoanType] = useState("Mortgage");
    const [monthlyPayment, setMonthlyPayment] = useState("");
    const [policyType, setPolicyType] = useState("Whole Life");
    const [policyNumber, setPolicyNumber] = useState(""); 
    const [coverageAmount, setCoverageAmount] = useState("");
    const [policyTerm, setPolicyTerm] = useState("");

    const [expenseCategory, setExpenseCategory] = useState("Dining");
    const [availableCategories, setAvailableCategories] = useState(['Dining', 'Transport', 'Shopping', 'Bills', 'Travel', 'Business']);
    const [sourceAssetId, setSourceAssetId] = useState("");
    
    const currencies = ['USD', 'EUR', 'GBP', 'HKD', 'CNY', 'JPY'];
    const EXCHANGE_RATES: Record<string, number> = { 'USD': 1, 'EUR': 1.09, 'GBP': 1.27, 'HKD': 0.128, 'CNY': 0.138, 'JPY': 0.0068 };

    useEffect(() => {
        if (isFX && currency === 'USD') setCurrency('EUR');
    }, [isFX]);

    const handleAdd = async () => { // Marked as async
        const numAmount = parseFloat(amount) || 0;
        console.log('--- SimpleForm handleAdd ---');
        console.log('isExpense:', isExpense);
        console.log('amount (parsed):', numAmount);
        
        if (isExpense) {
            const newActivity = {
                title: name || "Expense",
                category: expenseCategory,
                amount: amount, // Keep as string for Activity type
                icon: getCategoryIcon(expenseCategory),
                source_asset_id: sourceAssetId ? parseInt(sourceAssetId) : undefined, // <-- 修改为 source_asset_id
                currency: currency,
            };
            console.log('Prepared Activity:', newActivity);
            // 这里的第二个参数现在应该从 newActivity 中获取，因为它已经有了 source_asset_id
            await addActivity(newActivity, newActivity.source_asset_id, currency); 
            console.log('addActivity called and awaited');
            navigate('/bookkeeping');
            return;
        }

        const attributes: Record<string, string | number> = {};
        if (isCash) {
            attributes['Type'] = accountType;
            if (interestRate) attributes['APY'] = interestRate + '%';
            if (accountType === 'CD' && maturityDate) attributes['Maturity'] = maturityDate;
        }
        if (isEquities) {
            attributes['Type'] = equityType;
            if (ticker) attributes['Ticker'] = ticker.toUpperCase();
            if (sharePrice) attributes['Current Price'] = `${currency} ${sharePrice}`;
            if (avgCost) attributes['Avg Cost'] = `${currency} ${avgCost}`;
            if (shareQuantity) attributes['Shares'] = shareQuantity;
            const currentP = parseFloat(sharePrice) || 0;
            const costP = parseFloat(avgCost) || 0;
            const qty = parseFloat(shareQuantity) || 0;
            if (currentP > 0 && costP > 0 && qty > 0) {
                const pnlValue = (currentP - costP) * qty;
                const pnlPercent = ((currentP - costP) / costP) * 100;
                attributes['Total Gain'] = `${pnlValue >= 0 ? '+' : ''}${currency} ${pnlValue.toLocaleString(undefined, {maximumFractionDigits:0})}`;
                attributes['Return'] = `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`;
            }
        }
        if (isFixedIncome) {
            if (interestRate) attributes['Coupon'] = interestRate + '%';
            if (maturityDate) attributes['Maturity'] = maturityDate;
            if (paymentFrequency) attributes['Frequency'] = paymentFrequency;
            const rate = parseFloat(interestRate) || 0;
            if (rate > 0 && numAmount > 0) {
                const annualInc = numAmount * (rate / 100);
                attributes['Est. Income'] = `${currency} ${annualInc.toLocaleString(undefined, {maximumFractionDigits:0})}`;
            }
        }
        if (isFX) {
            attributes['Currency'] = currency;
            if (costBasis) attributes['Cost Basis'] = costBasis;
            const rate = EXCHANGE_RATES[currency] || 1;
            attributes['USD Value'] = `$${(numAmount * rate).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
        }
        if (isInsurance) {
            attributes['Type'] = policyType;
            if (policyNumber) attributes['Policy #'] = policyNumber;
            if (coverageAmount) attributes['Death Benefit'] = `${currency} ${parseFloat(coverageAmount).toLocaleString()}`;
            if (interestRate) attributes['Crediting Rate'] = interestRate + '%';
            if (policyTerm) attributes['Term'] = policyTerm + ' Yrs';
        }
        if (isLiabilities) {
            attributes['Type'] = loanType;
            if (interestRate) attributes['APR'] = interestRate + '%';
            if (monthlyPayment) attributes['Monthly Pmt'] = `${currency} ${parseFloat(monthlyPayment).toLocaleString()}`;
            if (maturityDate) attributes['Payoff Date'] = maturityDate;
        }

        const newAssetItem = {
            asset_key: assetKey!, // <-- 修改为 asset_key
            name: name || "New Entry",
            institution: institution || "General",
            amount: numAmount, // amount is number in AssetItem for calculation
            currency: currency,
            date: date,
            remarks: remarks,
            attributes: attributes
        };
        console.log('Prepared AssetItem:', newAssetItem);
        await addAssetItem(newAssetItem); // Added await
        console.log('addAssetItem called and awaited');
        navigate(`/asset-detail/${assetKey}`);
    };

    const getCategoryIcon = (cat: string) => {
        const lower = cat.toLowerCase();
        if (lower.includes('din') || lower.includes('food')) return 'restaurant';
        if (lower.includes('car') || lower.includes('transport') || lower.includes('uber')) return 'directions_car';
        if (lower.includes('shop') || lower.includes('store')) return 'shopping_bag';
        if (lower.includes('bill') || lower.includes('util')) return 'receipt';
        if (lower.includes('travel') || lower.includes('flight')) return 'flight';
        if (lower.includes('work') || lower.includes('business')) return 'work';
        return 'payments';
    }

    const getTheme = () => {
        if (isExpense) return { 
            bg: 'bg-cyan-400', 
            text: 'text-cyan-400', 
            caret: 'caret-cyan-400', 
            glow: 'shadow-cyan-400/20', 
            gradient: 'from-cyan-400/20 to-blue-500/10', 
            pill: 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' 
        };
        
        // Unified Premium Emerald Theme for all Asset Classes
        return { 
            bg: 'bg-brand-emerald', 
            text: 'text-brand-emerald', 
            caret: 'caret-brand-emerald', 
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]', 
            gradient: 'from-brand-emerald/10 via-[#064E3B]/10 to-transparent', 
            pill: 'bg-brand-emerald text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] border border-brand-emerald/20' 
        };
    };

    const theme = getTheme();
    const paySources = assetItems.filter(i => ['cash', 'liabilities'].includes(i.asset_key));

    return (
        <AppShell hideNav>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-[20%] -left-[10%] w-[150%] h-[60%] rounded-full bg-gradient-radial ${theme.gradient} opacity-40 blur-[100px] animate-fade-in`}></div>
            </div>
            <header className="px-6 pt-12 pb-2 flex items-center relative z-20">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    <Icon name="close" className="text-xl" />
                </button>
                <div className="flex-1 text-center pr-10">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 opacity-80">{title}</span>
                </div>
            </header>
            {/* Main content now flex-1 to fill remaining space in AppShell */}
            <div className="flex flex-col flex-1 min-h-0 relative z-10">
                <div className="flex-shrink-0 flex flex-col items-center justify-center py-10 px-6 relative">
                    <div className="relative mb-6">
                         <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`appearance-none bg-white/5 border border-white/5 rounded-full py-1.5 pl-4 pr-9 text-[10px] font-bold text-gray-300 uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/10 cursor-pointer hover:bg-white/10 transition-colors`}>
                            {currencies.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                        </select>
                        <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                    </div>
                    <div className="w-full relative flex justify-center items-baseline gap-2">
                         <span className={`text-4xl font-light text-gray-600 select-none animate-fade-in`}>$</span>
                        {/* 无论是否是Equities，都显示一个可输入的input */}
                        <input className={`w-full bg-transparent text-[64px] font-medium text-white text-center leading-none tracking-tighter placeholder:text-white/10 focus:outline-none ${theme.caret} p-0 border-none focus:ring-0 max-w-[80%]`} placeholder="0" type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus={!isEquities || isExpense} />
                    </div>
                    {/* 移除 Equities 时的 Calculated Market Value 提示，因为它现在是直接输入的 */}
                    {/* {isEquities && (
                         <div className="flex items-center gap-1.5 mt-3 opacity-60">
                             <Icon name="calculate" className="text-xs text-brand-emerald" />
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Calculated Market Value</p>
                         </div>
                    )} */}

                </div>
                <div className="flex-1 bg-card-dark/80 backdrop-blur-xl rounded-t-[40px] border-t border-white/5 p-8 space-y-8 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-fade-in overflow-y-auto hide-scrollbar pb-32">
                    {isExpense ? (
                        <div className="space-y-6">
                            <PremiumInput themeColor={theme.text} label="Merchant / Title" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. Starbucks" icon="store" autoFocus />
                            <PillSelector activeClass={theme.pill} label="Category" options={availableCategories} value={expenseCategory} onChange={setExpenseCategory} onAdd={(newCat: string) => setAvailableCategories(prev => [...prev, newCat])} />
                            <div className="grid grid-cols-1 gap-4">
                                <PremiumInput themeColor={theme.text} label="Date" value={date} onChange={(e: any) => setDate(e.target.value)} type="date" icon="event" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] pl-1">Pay With</label>
                                    <div className="relative">
                                        <select value={sourceAssetId} onChange={(e) => setSourceAssetId(e.target.value)} className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-xl px-4 pl-12 text-white text-base font-medium appearance-none focus:bg-white/[0.06] focus:border-white/20 focus:outline-none transition-all">
                                            <option value="" className="text-black">No Linked Account</option>
                                            {paySources.map(acc => (<option key={acc.id} value={acc.id} className="text-black">{acc.name} ({acc.currency} {acc.amount.toLocaleString()})</option>))}
                                        </select>
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 ${theme.text}`}><Icon name="credit_card" className="text-xl" /></div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><Icon name="expand_more" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {isEquities && <PremiumInput themeColor={theme.text} label="Ticker Symbol" value={ticker} onChange={(e: any) => setTicker(e.target.value)} placeholder="e.g. NVDA" icon="show_chart" autoFocus />}
                                <PremiumInput themeColor={theme.text} label={isFixedIncome ? "Instrument Name" : isLiabilities ? "Loan Name" : "Asset Name"} value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. Primary Holdings" icon="description" />
                                {!isFX && (<PremiumInput themeColor={theme.text} label={isLiabilities ? 'Lender' : 'Institution'} value={institution} onChange={(e: any) => setInstitution(e.target.value)} placeholder="e.g. Chase Bank" icon="account_balance" />)}
                            </div>
                            {isEquities && (
                                <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <PremiumInput themeColor={theme.text} label="Price" value={sharePrice} onChange={(e: any) => setSharePrice(e.target.value)} placeholder="0.00" type="number" icon="attach_money" />
                                    <PremiumInput themeColor={theme.text} label="Shares" value={shareQuantity} onChange={(e: any) => setShareQuantity(e.target.value)} placeholder="0" type="number" icon="numbers" />
                                    <div className="col-span-2 pt-2"><PillSelector activeClass={theme.pill} label="Equity Type" options={['Stock', 'ETF', 'Fund', 'Crypto']} value={equityType} onChange={setEquityType} /></div>
                                </div>
                            )}
                            {(isCash || isLiabilities) && (<PillSelector activeClass={theme.pill} label={isLiabilities ? "Loan Type" : "Account Type"} options={isLiabilities ? ['Mortgage', 'Auto', 'Loan', 'Credit Card'] : ['Checking', 'Savings', 'CD', 'Money Mkt']} value={isLiabilities ? loanType : accountType} onChange={isLiabilities ? setLoanType : setAccountType} />)}
                            {(interestRate || maturityDate || isLiabilities || isFixedIncome || isInsurance) && (
                                <div className="grid grid-cols-2 gap-5">
                                    {(isCash || isFixedIncome || isLiabilities || isInsurance) && (<PremiumInput themeColor={theme.text} label={isLiabilities ? 'APR %' : 'Yield %'} value={interestRate} onChange={(e: any) => setInterestRate(e.target.value)} placeholder="0.00" type="number" icon="percent" />)}
                                    {(accountType === 'CD' || isFixedIncome || isLiabilities) && (<PremiumInput themeColor={theme.text} label="Maturity Date" value={maturityDate} onChange={(e: any) => setMaturityDate(e.target.value)} type="date" icon="event" />)}
                                </div>
                            )}
                        </>
                    )}
                    <div className="space-y-8 pt-4">
                        {!isExpense && <PremiumInput themeColor={theme.text} label="Remarks (Optional)" value={remarks} onChange={(e: any) => setRemarks(e.target.value)} placeholder="Notes..." icon="edit_note" />}
                        <button onClick={handleAdd} className={`w-full h-14 ${theme.bg} text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg ${theme.glow} active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2 group`}>
                            <span>{isExpense ? 'Record Transaction' : 'Confirm Position'}</span>
                            <Icon name={isExpense ? 'receipt_long' : 'arrow_forward'} className="text-lg group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="h-10"></div>
                </div>
            </div>
        </AppShell>
    );
};

export const AnalysisTemplate = ({ title, score, metricValue, description, formula, formulaExplanation, insights, drivers }: {
    title: string; score: number; metricValue: string; description: string; formula: string; formulaExplanation: string; insights: string[]; drivers: { label: string; value: string; trend: string }[];
}) => {
    // Analysis Template implementation remains largely same but ensures imports/layout consistency
    const navigate = useNavigate();
    const getColor = (s: number) => {
        if (s >= 80) return { text: 'text-brand-emerald', bg: 'bg-brand-emerald', border: 'border-brand-emerald', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' };
        if (s >= 60) return { text: 'text-accent-gold', bg: 'bg-accent-gold', border: 'border-accent-gold', glow: 'shadow-[0_0_20px_rgba(212,175,55,0.3)]' };
        return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' };
    };
    const theme = getColor(score);

    return (
        <AppShell hideNav>
             <header className="flex items-center justify-between px-6 pt-12 pb-2 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors"><Icon name="arrow_back" className="text-2xl" /></button>
                <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
                <div className="w-6"></div> 
            </header>
            <div className="p-6 space-y-6 pb-24">
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#15231D] to-[#0A0F0D] p-8 border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-24 bg-brand-emerald/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex flex-col items-center">
                        <div className="relative size-40 mb-4">
                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
                                <circle cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * score / 100)} className={`${theme.text} transition-all duration-1000 ease-out`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">{score}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80 ${theme.text}`}>Index Score</span>
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold text-white mb-2 tracking-tight`}>{metricValue}</h3>
                        <p className="text-sm text-gray-400 text-center leading-relaxed max-w-[280px]">{description}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1"><Icon name="tune" className="text-brand-emerald text-sm" /><h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Key Drivers</h4></div>
                    <div className="grid grid-cols-3 gap-3">
                        {drivers.map((d, i) => (
                            <div key={i} className="bg-card-dark p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-lg">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide truncate w-full mb-1">{d.label}</span>
                                <span className="text-sm font-black text-white mb-2">{d.value}</span>
                                <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${d.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : d.trend === 'down' ? 'bg-rose-500/10 text-rose-500' : 'bg-gray-500/10 text-gray-400'}`}><Icon name={d.trend === 'up' ? 'trending_up' : d.trend === 'down' ? 'trending_down' : 'remove'} className="text-[10px] font-bold" /></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1"><Icon name="tips_and_updates" className="text-accent-gold text-sm" /><h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Executive Insights</h4></div>
                    <div className="space-y-2">
                        {insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/5">
                                <div className="mt-0.5 flex-shrink-0"><div className="size-1.5 rounded-full bg-brand-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div></div>
                                <p className="text-sm text-gray-300 font-medium leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                    <details className="group cursor-pointer">
                        <summary className="list-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 select-none"><Icon name="function" className="text-sm" /><span>Technical Calculation</span><Icon name="expand_more" className="text-sm group-open:rotate-180 transition-transform" /></summary>
                        <div className="bg-black/30 rounded-xl p-4 space-y-2">
                            <code className="block font-mono text-xs text-brand-emerald bg-brand-emerald/5 p-2 rounded border border-brand-emerald/10 text-center">{formula}</code>
                            <p className="text-[11px] text-gray-500 leading-relaxed text-center">{formulaExplanation}</p>
                        </div>
                    </details>
                </div>
            </div>
        </AppShell>
    );
};

export const HealthScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const { financialScore } = context!;
    const items = [
        { title: 'Solvency Analysis', path: '/solvency-analysis', icon: 'account_balance', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', desc: 'Assets vs Liabilities' },
        { title: 'Liquidity Analysis', path: '/liquidity-analysis', icon: 'water_drop', color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Cash Flow Health' },
        { title: 'Income Stability', path: '/income-stability-analysis', icon: 'timeline', color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Revenue Consistency' },
        { title: 'Growth Analysis', path: '/growth-analysis', icon: 'trending_up', color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Net Worth Velocity' },
        { title: 'Risk & Resilience', path: '/risk-resilience-analysis', icon: 'shield', color: 'text-rose-400', bg: 'bg-rose-400/10', desc: 'Portfolio Volatility' },
    ];
    const statusText = financialScore > 85 ? 'Excellent' : financialScore > 70 ? 'Good' : 'Needs Attention';
    const statusColor = financialScore > 85 ? 'text-brand-emerald' : financialScore > 70 ? 'text-accent-gold' : 'text-rose-500';

    return (
         <AppShell hideNav>
            <header className="flex items-center justify-between px-6 pt-12 pb-2 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors"><Icon name="arrow_back" className="text-2xl" /></button>
                <h2 className="text-lg font-bold text-white tracking-tight">Financial Health</h2>
                <div className="w-6"></div> 
            </header>
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-[#15231D] to-[#0D1A14] p-8 shadow-2xl border border-white/5 text-center group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 bg-brand-emerald/5 rounded-full blur-3xl group-hover:bg-brand-emerald/10 transition-colors duration-700"></div>
                    <div className="relative z-10">
                        <div className="relative inline-flex justify-center items-center mb-4">
                            <svg className="size-48 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="transparent" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                                <circle cx="50" cy="50" fill="transparent" r="45" stroke="#10B981" strokeDasharray="283" strokeDashoffset={283 - (283 * financialScore / 100)} strokeLinecap="round" strokeWidth="6" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-white tracking-tighter">{financialScore}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Score</span>
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold ${statusColor} mb-2`}>{statusText}</h3>
                        <p className="text-sm text-gray-400 max-w-[260px] mx-auto leading-relaxed">Your portfolio demonstrates strong solvency and consistent growth. Consider optimizing liquidity.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1"><Icon name="analytics" className="text-brand-emerald text-sm" /><h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Deep Dive Analysis</h3></div>
                    {items.map((item, i) => (
                        <div key={i} onClick={() => navigate(item.path)} className="group bg-card-dark p-4 rounded-2xl border border-white/5 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer hover:bg-white/[0.03] hover:border-white/10 shadow-lg">
                            <div className={`size-14 rounded-2xl flex items-center justify-center ${item.bg} border border-white/5 group-hover:scale-110 transition-transform`}><Icon name={item.icon} className={`text-2xl ${item.color}`} /></div>
                            <div className="flex-1"><h4 className="font-bold text-white text-base mb-0.5 group-hover:text-brand-emerald transition-colors">{item.title}</h4><p className="text-xs text-gray-500 font-medium tracking-wide">{item.desc}</p></div>
                            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-brand-emerald group-hover:text-white transition-all"><Icon name="arrow_forward" className="text-lg" /></div>
                        </div>
                    ))}
                </div>
            </div>
         </AppShell>
    );
};

// --- SETTINGS SCREEN OPTIMIZED ---

export const SettingsScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    // Destructure username and setUsername from context
    const { username, setUsername } = context!;
    
    // Settings States
    const [faceId, setFaceId] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [currency, setCurrency] = useState("USD");
    
    // Interaction States
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    
    // Name Change States
    const [showNameModal, setShowNameModal] = useState(false);
    const [newName, setNewName] = useState(username);

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const handleSave = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleNameChange = () => {
        if (newName.trim()) {
            setUsername(newName.trim());
            setShowNameModal(false);
            handleSave("Identity Updated");
        }
    };

    // Improved Toggle with smooth transition and shadow
    const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
        <button 
            onClick={(e) => { e.stopPropagation(); onChange(!value); }}
            className={`
                relative w-12 h-7 rounded-full p-1 transition-all duration-300 ease-in-out border
                ${value 
                    ? 'bg-brand-emerald/20 border-brand-emerald/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 border-white/10'
                }
            `}
        >
            <div className={`
                size-4.5 rounded-full shadow-md transform transition-transform duration-300
                ${value ? 'translate-x-5 bg-brand-emerald' : 'translate-x-0 bg-gray-400'}
            `}></div>
        </button>
    );

    // Section Container with Frosted Glass
    const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
        <div className="space-y-4 mb-8 animate-fade-in">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 pl-2 opacity-80">{title}</h3>
            <div className="bg-[#121B17]/60 backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden shadow-xl">
                {children}
            </div>
        </div>
    );

    // Row Item with enhanced hover state
    const Row = ({ icon, label, action, onClick }: { icon: string, label: string, action: React.ReactNode, onClick?: () => void }) => (
        <div 
            onClick={onClick} 
            className={`
                relative flex items-center justify-between p-5 border-b border-white/[0.03] last:border-0
                transition-all duration-300 group
                ${onClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''}
            `}
        >
             {/* Hover Glow Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-4">
                <div className={`
                    size-9 rounded-lg flex items-center justify-center transition-colors duration-300
                    ${onClick ? 'bg-white/5 text-gray-400 group-hover:text-brand-emerald group-hover:bg-brand-emerald/10' : 'bg-transparent text-gray-400'}
                `}>
                    <Icon name={icon} className="text-xl" />
                </div>
                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{label}</span>
            </div>
            {action}
        </div>
    );

    return (
        <AppShell hideNav>
             <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050B08]">
                 <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[80%] rounded-full bg-gradient-radial from-brand-emerald/5 via-transparent to-transparent opacity-40 blur-[100px]"></div>
                 {/* Noise overlay */}
                 <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
             </div>

             <header className="px-6 pt-12 pb-4 flex items-center sticky top-0 z-40 bg-[#050B08]/80 backdrop-blur-xl border-b border-white/5 transition-all">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95">
                    <Icon name="arrow_back" className="text-xl" />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Settings</h2>
                </div>
            </header>

            <div className="px-6 pt-6 pb-20 relative z-10">
                {/* Security Section */}
                <Section title="Security">
                    <Row 
                        icon="face" 
                        label="Face ID Login" 
                        action={<Toggle value={faceId} onChange={(v) => { setFaceId(v); handleSave(v ? "Face ID Enabled" : "Face ID Disabled"); }} />} 
                    />
                     <Row 
                        icon="badge" 
                        label="Change Display Name" 
                        action={<Icon name="chevron_right" className="text-gray-500 group-hover:text-white transition-colors" />} 
                        onClick={() => { setNewName(username); setShowNameModal(true); }}
                    />
                    <Row 
                        icon="lock" 
                        label="Change Passcode" 
                        action={<Icon name="chevron_right" className="text-gray-500 group-hover:text-white transition-colors" />} 
                        onClick={() => setShowPasscodeModal(true)}
                    />
                </Section>

                {/* Notifications Section */}
                <Section title="Notifications">
                    <Row 
                        icon="notifications" 
                        label="Push Notifications" 
                        action={<Toggle value={notifications} onChange={(v) => { setNotifications(v); handleSave("Settings Updated"); }} />} 
                    />
                    <Row 
                        icon="mail" 
                        label="Email Digests" 
                        action={<Toggle value={emailAlerts} onChange={(v) => { setEmailAlerts(v); handleSave("Email Preferences Saved"); }} />} 
                    />
                </Section>

                {/* Preferences Section */}
                <Section title="Preferences">
                    <Row 
                        icon="dark_mode" 
                        label="Dark Mode" 
                        action={<Toggle value={darkMode} onChange={() => handleSave("Theme Locked by System")} />} 
                    />
                    <div onClick={() => setShowCurrencyModal(true)} className="group relative flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.03] transition-colors">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="size-9 rounded-lg bg-white/5 text-gray-400 group-hover:text-brand-emerald group-hover:bg-brand-emerald/10 flex items-center justify-center transition-colors">
                                <Icon name="currency_exchange" className="text-xl" />
                            </div>
                            <span className="text-sm font-bold text-gray-200 group-hover:text-white">Base Currency</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-brand-emerald uppercase tracking-wider group-hover:border-brand-emerald/30 transition-colors">
                                {currency}
                             </div>
                             <Icon name="expand_more" className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Section>

                <div className="pt-8 text-center opacity-40">
                    <div className="size-8 mx-auto bg-white/5 rounded-lg flex items-center justify-center mb-3 border border-white/5">
                         <Icon name="shield" className="text-xs text-gray-500" />
                    </div>
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">SmartAM v1.0.0</p>
                     <p className="text-[9px] text-gray-600">Encrypted & Secure</p>
                </div>
            </div>

            {/* Change Name Modal - Matches Passcode Modal Style */}
            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowNameModal(false)}>
                    <div 
                        className="w-full max-w-[340px] relative overflow-hidden rounded-[32px] bg-[#0F1613] p-1 shadow-2xl ring-1 ring-white/10" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative Gradient Top */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-emerald/10 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 bg-[#0F1613]/90 backdrop-blur-xl rounded-[28px] p-6 text-center">
                            
                            {/* Icon */}
                            <div className="mx-auto mb-5 size-16 rounded-full bg-gradient-to-tr from-brand-emerald/20 to-transparent p-[1px] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <div className="size-full rounded-full bg-[#0A0F0D] flex items-center justify-center border border-white/5">
                                    <Icon name="badge" className="text-2xl text-brand-emerald drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white tracking-tight mb-1">Update Identity</h3>
                            <p className="text-[11px] text-gray-500 font-medium mb-6">Enter your preferred display name.</p>

                            <div className="space-y-3">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-brand-emerald">
                                        <Icon name="person" className="text-lg" />
                                    </div>
                                    <input 
                                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 pl-10 text-white font-medium text-base focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700" 
                                        placeholder="Full Name" 
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button 
                                    onClick={() => setShowNameModal(false)} 
                                    className="h-11 rounded-xl bg-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleNameChange} 
                                    className="h-11 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-500 text-xs font-bold text-white shadow-lg shadow-brand-emerald/20 hover:shadow-brand-emerald/40 active:scale-95 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Passcode Modal - Redesigned */}
            {showPasscodeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowPasscodeModal(false)}>
                    <div 
                        className="w-full max-w-[340px] relative overflow-hidden rounded-[32px] bg-[#0F1613] p-1 shadow-2xl ring-1 ring-white/10" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative Gradient Top */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-emerald/10 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 bg-[#0F1613]/90 backdrop-blur-xl rounded-[28px] p-6 text-center">
                            
                            {/* Icon */}
                            <div className="mx-auto mb-5 size-16 rounded-full bg-gradient-to-tr from-brand-emerald/20 to-transparent p-[1px] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <div className="size-full rounded-full bg-[#0A0F0D] flex items-center justify-center border border-white/5">
                                    <Icon name="lock" className="text-2xl text-brand-emerald drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white tracking-tight mb-1">Security Update</h3>
                            <p className="text-[11px] text-gray-500 font-medium mb-6">Enter your current passcode to verify.</p>

                            <div className="space-y-3">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-brand-emerald">
                                        <Icon name="key" className="text-lg" />
                                    </div>
                                    <input 
                                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 pl-10 text-white text-center font-mono tracking-[0.3em] text-sm focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:font-sans" 
                                        placeholder="Current Passcode" 
                                        type="password" 
                                        maxLength={6}
                                        autoFocus 
                                    />
                                </div>
                                
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-brand-emerald">
                                        <Icon name="lock_reset" className="text-lg" />
                                    </div>
                                    <input 
                                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 pl-10 text-white text-center font-mono tracking-[0.3em] text-sm focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:font-sans" 
                                        placeholder="New Passcode" 
                                        type="password" 
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button 
                                    onClick={() => setShowPasscodeModal(false)} 
                                    className="h-11 rounded-xl bg-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => { setShowPasscodeModal(false); handleSave("Passcode Updated"); }} 
                                    className="h-11 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-500 text-xs font-bold text-white shadow-lg shadow-brand-emerald/20 hover:shadow-brand-emerald/40 active:scale-95 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Currency Modal (Bottom Sheet) */}
            {showCurrencyModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowCurrencyModal(false)}>
                     <div className="w-full max-w-[430px] bg-[#15201B] rounded-t-[40px] border-t border-white/10 overflow-hidden shadow-2xl animate-fade-in-up ring-1 ring-white/5" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-8"></div>
                            <h3 className="text-center text-sm font-bold text-white uppercase tracking-widest mb-8">Select Currency</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'HKD'].map(curr => (
                                    <button 
                                        key={curr} 
                                        onClick={() => { setCurrency(curr); setShowCurrencyModal(false); }}
                                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${currency === curr ? 'bg-brand-emerald/10 border-brand-emerald text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <span className="font-bold">{curr}</span>
                                        {currency === curr && <Icon name="check" className="text-brand-emerald text-sm" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0D1A14] border border-brand-emerald/30 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-fade-in-up z-50 flex items-center gap-3">
                    <div className="size-5 rounded-full bg-brand-emerald flex items-center justify-center text-black">
                        <Icon name="check" className="text-xs font-bold" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">{toastMsg}</span>
                </div>
            )}
        </AppShell>
    );
};

export const AIConciergeScreen = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        {role: 'model', text: "Hello! I'm your dedicated financial concierge. I can analyze your portfolio, suggest allocations, or answer market questions. How can I assist?"}
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<Chat | null>(null);

    useEffect(() => {
        console.log("Vite环境变量:", import.meta.env); // 打印 import.meta.env 的完整内容
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY; // 确保在 useEffect 内部获取最新值

        // 添加条件：如果 chatSession 未初始化，或 geminiApiKey 改变，则重新初始化
        if (!chatSession.current || chatSession.current.apiKey !== geminiApiKey) { 
            if (!geminiApiKey) {
                console.error("Gemini API Key is not set. Please add VITE_GEMINI_API_KEY to your .env file.");
                alert("错误：Gemini API Key 未设置。请检查您的 .env.local 文件并确保已重启开发服务器。"); // 添加 alert 提示
                return;
            }
            console.log("初始化GoogleGenerativeAI时的Key:", geminiApiKey); 
            const ai = new GoogleGenerativeAI({ apiKey: geminiApiKey });
            const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
            chatSession.current = model.startChat({
                config: {
                    systemInstruction: "You are a sophisticated AI financial concierge for an exclusive wealth management app. You have access to general financial knowledge. Be concise, professional, and helpful.",
                },
            });
            // 将新的 API Key 存储到 chatSession.current 中，以便下次检查
            chatSession.current.apiKey = geminiApiKey;
        }
    }, [import.meta.env.VITE_GEMINI_API_KEY]); // <-- 修改依赖项为 VITE_GEMINI_API_KEY

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession.current) return;
        const userText = input;
        setInput("");
        setMessages(prev => [...prev, {role: 'user', text: userText}]);
        setLoading(true);

        try {
            const result = await chatSession.current.sendMessage(userText);
            const responseText = result.text || "I'm sorry, I couldn't generate a response.";
            setMessages(prev => [...prev, {role: 'model', text: responseText}]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {role: 'model', text: "I apologize, but I am unable to process your request at this moment."}]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell hideNav>
            {/* 1. Ambient Background specific to this screen for extra depth */}
             <div className="fixed inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[50%] rounded-full bg-gradient-radial from-brand-emerald/10 via-transparent to-transparent opacity-40 blur-[100px]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-gradient-radial from-blue-900/10 to-transparent opacity-30 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 z-40 bg-[#050B08]/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"><Icon name="arrow_back" className="text-xl" /></button>
                <div className="flex flex-col items-center">
                    <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Private Concierge</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="size-1.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[9px] font-bold text-brand-emerald uppercase tracking-widest">Live Intelligence</span>
                    </div>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            {/* Chat Area - Now uses flex-1 min-h-0 to adapt to parent height instead of viewport calculation */}
            <div className="flex flex-col flex-1 min-h-0 relative z-10">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
                    {/* Welcome Message or Empty State if needed, but we have initial state */}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                             {/* AI Icon if model */}
                             {msg.role === 'model' && (
                                 <div className="flex-shrink-0 mr-3 mt-1">
                                     <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                         <Icon name="smart_toy" className="text-brand-emerald text-sm" />
                                     </div>
                                 </div>
                             )}

                             {/* Bubble */}
                             <div className={`
                                relative max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md border shadow-lg
                                ${msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-brand-emerald to-[#059669] text-white border-white/10 rounded-br-none shadow-[0_4px_15px_rgba(16,185,129,0.2)]' 
                                    : 'bg-[#121B17]/80 text-gray-200 border-white/5 rounded-bl-none'
                                }
                             `}>
                                {msg.text}
                             </div>
                        </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-start w-full animate-fade-in">
                             <div className="flex-shrink-0 mr-3 mt-1">
                                 <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                     <Icon name="smart_toy" className="text-brand-emerald text-sm opacity-50" />
                                 </div>
                             </div>
                             <div className="bg-[#121B17]/60 border border-white/5 p-4 rounded-2xl rounded-bl-none backdrop-blur-md flex items-center gap-1.5 h-12">
                                <div className="size-1.5 bg-brand-emerald/60 rounded-full animate-bounce"></div>
                                <div className="size-1.5 bg-brand-emerald/60 rounded-full animate-bounce delay-75"></div>
                                <div className="size-1.5 bg-brand-emerald/60 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 px-6 pb-8 bg-gradient-to-t from-[#050B08] via-[#050B08] to-transparent z-20">
                    <div className="relative group">
                         {/* Input Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-emerald/20 to-cyan-500/20 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-md"></div>
                        
                        <div className="relative flex items-center bg-[#0F1613] border border-white/10 rounded-full shadow-2xl overflow-hidden backdrop-blur-xl">
                             <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about markets, analysis..."
                                className="flex-1 bg-transparent h-14 pl-6 pr-4 text-white placeholder:text-gray-600 focus:outline-none text-sm font-medium"
                             />
                             <button 
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="mr-2 size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-emerald hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400 transition-all duration-300"
                            >
                                <Icon name="arrow_upward" className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};