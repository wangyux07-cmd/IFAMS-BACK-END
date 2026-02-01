import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { AppContextType, Assets, Activity, AssetItem, GrowthMetrics } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const RATES: { [key: string]: number } = {
    'USD': 1,
    'EUR': 1.09,
    'GBP': 1.27,
    'HKD': 0.128,
    'CNY': 0.138,
    'JPY': 0.0068
};

// Mock "Previous Month" Net Worth to simulate growth logic
// Based on initial mock data sum ~12.5M. We set previous to 12.2M to show realistic organic growth.
const PREVIOUS_MONTH_NET_WORTH = 12200000;

export const AppProvider = ({ children }: { children?: ReactNode }) => {
    const [username, setUsername] = useState("Julian");
    const [userAvatar, setUserAvatar] = useState("https://picsum.photos/200/200");
    const [activities, setActivities] = useState<Activity[]>([
        { id: 1, title: 'Uber Trip', category: 'Business', time: '2:30 PM', amount: '12.40', icon: 'directions_car' },
        { id: 2, title: 'Starbucks Coffee', category: 'Personal', time: '11:15 AM', amount: '5.50', icon: 'restaurant' }
    ]);

    // Detailed items list - Source of Truth
    const [assetItems, setAssetItems] = useState<AssetItem[]>([
        { 
            id: 101, assetKey: 'cash', name: 'Primary Savings', institution: 'Chase', amount: 240000, currency: 'USD', date: '2023-11-01', remarks: 'Emergency fund',
            attributes: { 'APY': '4.5%' }
        },
        { 
            id: 102, assetKey: 'cash', name: 'High Yield Deposit', institution: 'Marcus', amount: 1000000, currency: 'USD', date: '2023-10-15', remarks: 'Locked until Q4 2024',
            attributes: { 'APY': '5.1%', 'Term': '12 Months' }
        },
        { 
            id: 201, assetKey: 'equities', name: 'Tech Growth Fund', institution: 'Vanguard', amount: 4500000, currency: 'USD', date: '2023-09-20', remarks: 'Main portfolio',
            attributes: { 'Ticker': 'VGT', 'Return YTD': '+24%' }
        },
        { 
            id: 202, assetKey: 'equities', name: 'NVDA Position', institution: 'E*Trade', amount: 2350000, currency: 'USD', date: '2023-08-12', remarks: 'Direct stock holding',
            attributes: { 'Ticker': 'NVDA', 'Shares': '5,000' }
        },
        { 
            id: 301, assetKey: 'fixedIncome', name: 'Treasury Bonds', institution: 'TreasuryDirect', amount: 2100000, currency: 'USD', date: '2023-01-10', remarks: '10-year yield',
            attributes: { 'Yield': '3.8%', 'Maturity': '2033-01-10' }
        },
        { 
            id: 401, assetKey: 'fx', name: 'GBP Holdings', institution: 'Wise', amount: 420000, currency: 'GBP', date: '2023-12-01', remarks: 'London travel fund',
            attributes: { 'Base Rate': '1.27' }
        },
        { 
            id: 501, assetKey: 'insurance', name: 'Whole Life Policy', institution: 'Northwestern', amount: 2500000, currency: 'USD', date: '2020-05-15', remarks: 'Family protection',
            attributes: { 'Crediting Rate': '6.2%', 'Policy #': 'NW-8892', 'Death Benefit': '$5,000,000' }
        },
        { 
            id: 601, assetKey: 'liabilities', name: 'Mortgage', institution: 'Wells Fargo', amount: 660000, currency: 'USD', date: '2019-03-01', remarks: 'Primary residence',
            attributes: { 'APR': '3.1%', 'Monthly Pmt': '$3,200' }
        },
    ]);

    // Derived Assets State with FX Calculation
    const assets = useMemo(() => {
        const initial: Assets = {
            cash: 0,
            equities: 0,
            fixedIncome: 0,
            fx: 0,
            insurance: 0,
            liabilities: 0
        };

        return assetItems.reduce((acc, item) => {
            const rate = RATES[item.currency] || 1;
            const valueUSD = item.amount * rate;
            
            if (acc[item.assetKey] !== undefined) {
                acc[item.assetKey] += valueUSD;
            }
            return acc;
        }, initial);
    }, [assetItems]);

    const totalNetWorth = useMemo(() => {
        return (assets.cash + assets.equities + assets.fixedIncome + assets.fx + assets.insurance) - assets.liabilities;
    }, [assets]);

    // Calculate Dynamic Growth based on totalNetWorth vs PREVIOUS_MONTH_NET_WORTH
    const growthMetrics = useMemo<GrowthMetrics>(() => {
        const diff = totalNetWorth - PREVIOUS_MONTH_NET_WORTH;
        const percent = (diff / PREVIOUS_MONTH_NET_WORTH) * 100;
        return {
            amount: diff,
            percent: percent,
            isPositive: diff >= 0,
            prevNetWorth: PREVIOUS_MONTH_NET_WORTH
        };
    }, [totalNetWorth]);

    // Dynamic AI Score based on Solvency Ratio and Net Worth
    const financialScore = useMemo(() => {
        const ratio = (totalNetWorth + assets.liabilities) / (assets.liabilities || 1);
        let score = 75; 
        if (ratio > 5) score += 10;
        else if (ratio > 2) score += 5;
        const liquidity = assets.cash + assets.fx;
        if (liquidity > 500000) score += 5;
        if (liquidity > 1000000) score += 3;
        if (activities.length > 10) score -= 2;
        return Math.min(99, Math.max(1, score));
    }, [totalNetWorth, assets, activities]);

    const addActivity = (activity: Activity, sourceAssetId?: number, expenseCurrency: string = 'USD') => {
        setActivities(prev => [activity, ...prev]);
        
        // Double-Entry Logic: If a source account is selected, deduct the amount from that asset
        if (sourceAssetId) {
            setAssetItems(prevItems => prevItems.map(item => {
                if (item.id === sourceAssetId) {
                    const expenseAmount = parseFloat(activity.amount);
                    
                    // FX Logic:
                    // 1. Convert Expense Amount -> USD Value
                    const expenseRateToUSD = RATES[expenseCurrency] || 1;
                    const usdValue = expenseAmount * expenseRateToUSD;

                    // 2. Convert USD Value -> Asset Currency Amount
                    const assetRateToUSD = RATES[item.currency] || 1;
                    // Note: RATES are stored as 1 Unit = X USD. 
                    // So to get Units from USD, we divide by Rate.
                    const deductionInAssetCurrency = usdValue / assetRateToUSD;

                    return {
                        ...item,
                        amount: Math.max(0, item.amount - deductionInAssetCurrency) // Prevent negative balance for simplicity
                    };
                }
                return item;
            }));
        }
    };
    
    // Deprecated but kept for type compatibility if needed, though unused now
    const updateAsset = (key: keyof Assets, value: number) => {
        console.warn("updateAsset is deprecated. Use addAssetItem.");
    };

    const addAssetItem = (item: AssetItem) => {
        setAssetItems(prev => [item, ...prev]);
    };

    return (
        <AppContext.Provider value={{ 
            username, setUsername, 
            userAvatar, setUserAvatar,
            activities, addActivity, 
            assets, assetItems, addAssetItem, 
            totalNetWorth, updateAsset, 
            financialScore, growthMetrics 
        }}>
            {children}
        </AppContext.Provider>
    );
};