import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import OverviewScreen from './screens/OverviewScreen';
import BookkeepingScreen from './screens/BookkeepingScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddHubScreen from './screens/AddHubScreen';
import AssetListScreen from './screens/AssetListScreen'; // Imported
import { 
    HealthScreen, 
    AIConciergeScreen, 
    SettingsScreen, 
    SimpleForm, 
    AnalysisTemplate 
} from './screens/DetailScreens';

const App = () => {
    return (
        <AppProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<LoginScreen />} />
                    <Route path="/dashboard" element={<DashboardScreen />} />
                    <Route path="/overview" element={<OverviewScreen />} />
                    <Route path="/bookkeeping" element={<BookkeepingScreen />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="/add-hub" element={<AddHubScreen />} />
                    <Route path="/ai-concierge" element={<AIConciergeScreen />} />
                    <Route path="/health" element={<HealthScreen />} />
                    <Route path="/settings" element={<SettingsScreen />} />
                    
                    {/* Asset Detail List */}
                    <Route path="/asset-detail/:category" element={<AssetListScreen />} />

                    {/* Add Forms */}
                    <Route path="/add-cash" element={<SimpleForm title="Add Cash" assetKey="cash" />} />
                    <Route path="/add-equities" element={<SimpleForm title="Add Equities" assetKey="equities" />} />
                    <Route path="/add-fixed-income" element={<SimpleForm title="Add Fixed Income" assetKey="fixedIncome" />} />
                    <Route path="/add-fx" element={<SimpleForm title="Add FX Holding" assetKey="fx" />} />
                    <Route path="/add-insurance" element={<SimpleForm title="Add Insurance" assetKey="insurance" />} />
                    <Route path="/add-liability" element={<SimpleForm title="Add Liability" assetKey="liabilities" />} />
                    <Route path="/add-expense" element={<SimpleForm title="Add Expense" />} />

                    {/* Analysis Routes */}
                    <Route path="/solvency-analysis" element={
                        <AnalysisTemplate 
                            title="Solvency Analysis" 
                            score={92} 
                            metricValue="4.25x Ratio" 
                            description="Healthy asset coverage against liabilities." 
                            formula="Total Assets / Total Liabilities"
                            formulaExplanation="This ratio measures the ability of your company to meet its long-term debts and other financial obligations."
                            insights={[
                                "Your assets cover liabilities 4.25x over, indicating exceptional financial health.",
                                "Insurance policies provide a strong safety net, contributing 30% to total solvency.",
                                "Recommendation: Consider leveraging high solvency for low-interest strategic loans."
                            ]}
                            drivers={[
                                { label: 'Total Assets', value: '$12.4M', trend: 'up' },
                                { label: 'Total Liabilities', value: '$2.9M', trend: 'down' },
                                { label: 'Debt Ratio', value: '0.23', trend: 'down' }
                            ]}
                        />
                    } />
                    <Route path="/liquidity-analysis" element={
                        <AnalysisTemplate 
                            title="Liquidity Analysis" 
                            score={85} 
                            metricValue="18 Mo. Runway" 
                            description="Strong cash position for short-term needs." 
                            formula="Current Assets / Monthly Expenses"
                            formulaExplanation="Calculates how many months you can sustain current spending using only liquid assets."
                            insights={[
                                "Current cash reserves cover 18 months of expenses. Recommended buffer is 6-12 months.",
                                "Excess liquidity of approx. $400k could be deployed into higher-yield vehicles.",
                                "Recent 'Uber Trip' and 'Dining' expenses remain within <2% of monthly budget."
                            ]}
                            drivers={[
                                { label: 'Liquid Cash', value: '$1.24M', trend: 'up' },
                                { label: 'Monthly Burn', value: '$68k', trend: 'neutral' },
                                { label: 'Quick Ratio', value: '1.8', trend: 'up' }
                            ]}
                        />
                    } />
                    <Route path="/income-stability-analysis" element={
                        <AnalysisTemplate 
                            title="Income Stability" 
                            score={64} 
                            metricValue="Moderate Risk" 
                            description="High variance in monthly inflows." 
                            formula="1 - (σ Income / μ Income)"
                            formulaExplanation="Measures the consistency of cash inflows over a rolling 12-month period. Lower scores indicate irregular income."
                            insights={[
                                "High variance detected due to irregular dividend payouts in Q3.",
                                "Base salary remains consistent, but reliance on performance bonuses increases volatility.",
                                "Diversifying into fixed-income bonds could smooth out quarterly fluctuations."
                            ]}
                            drivers={[
                                { label: 'Base Salary', value: '45%', trend: 'neutral' },
                                { label: 'Dividends', value: '35%', trend: 'up' },
                                { label: 'Bonus/Comm.', value: '20%', trend: 'down' }
                            ]}
                        />
                    } />
                    <Route path="/growth-analysis" element={
                        <AnalysisTemplate 
                            title="Growth Analysis" 
                            score={96} 
                            metricValue="18.4% YoY" 
                            description="Excellent portfolio appreciation." 
                            formula="(Current NW / Previous NW)^(1/n) - 1"
                            formulaExplanation="Compound Annual Growth Rate (CAGR) of your total net worth over the last fiscal year."
                            insights={[
                                "Equity portfolio outperformed S&P 500 by 4% due to strategic tech allocation.",
                                "Real estate holdings appreciated by 2.1% this quarter.",
                                "Projected to double net worth in 4.2 years at current trajectory."
                            ]}
                            drivers={[
                                { label: 'Equities ROI', value: '+22%', trend: 'up' },
                                { label: 'Alt. Invest.', value: '+8%', trend: 'up' },
                                { label: 'Inflation Adj.', value: '-3%', trend: 'down' }
                            ]}
                        />
                    } />
                    <Route path="/risk-resilience-analysis" element={
                        <AnalysisTemplate 
                            title="Risk & Resilience" 
                            score={78} 
                            metricValue="Beta 1.12" 
                            description="Slightly higher volatility than market." 
                            formula="∑ (Asset Weight * Asset Beta)"
                            formulaExplanation="Weighted average beta of the portfolio. A beta > 1 indicates higher volatility than the benchmark index."
                            insights={[
                                "Portfolio is slightly more volatile than the market, driven by 55% allocation in Equities.",
                                "FX exposure is currently unhedged against USD strengthening.",
                                "Insurance coverage is adequate for 95% of projected tail risks."
                            ]}
                            drivers={[
                                { label: 'Market Beta', value: '1.12', trend: 'up' },
                                { label: 'Sharpe Ratio', value: '1.8', trend: 'up' },
                                { label: 'Max Drawdown', value: '-12%', trend: 'neutral' }
                            ]}
                        />
                    } />
                </Routes>
            </HashRouter>
        </AppProvider>
    );
};

export default App;