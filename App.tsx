import React, { useContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import OverviewScreen from './screens/OverviewScreen';
import BookkeepingScreen from './screens/BookkeepingScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddHubScreen from './screens/AddHubScreen';
import AssetListScreen from './screens/AssetListScreen'; // Imported
import ProtectedScreen from './screens/ProtectedScreen'; // Import ProtectedScreen
import { 
    HealthScreen, 
    AIConciergeScreen, 
    SettingsScreen, 
    SimpleForm, 
    AnalysisTemplate 
} from './screens/DetailScreens';

const AppRoutes = () => {
    const context = useContext(AppContext);

    // Render a loading state or null if context is not yet available
    if (!context) {
        // You might want to render a loading spinner here
        return null;
    }

    const { 
        solvencyAnalysis, 
        liquidityAnalysis, 
        incomeStabilityAnalysis, 
        growthAnalysis, 
        riskResilienceAnalysis 
    } = context;

    return (
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
            <Route path="/protected" element={<ProtectedScreen />} />
            
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
                    type="solvency"
                    {...solvencyAnalysis}
                />
            } />
            <Route path="/liquidity-analysis" element={
                <AnalysisTemplate 
                    title="Liquidity Analysis" 
                    type="liquidity"
                    {...liquidityAnalysis}
                />
            } />
            <Route path="/income-stability-analysis" element={
                <AnalysisTemplate 
                    title="Income Stability" 
                    type="incomeStability"
                    {...incomeStabilityAnalysis}
                />
            } />
            <Route path="/growth-analysis" element={
                <AnalysisTemplate 
                    title="Growth Analysis" 
                    type="growth"
                    {...growthAnalysis}
                />
            } />
            <Route path="/risk-resilience-analysis" element={
                <AnalysisTemplate 
                    title="Risk & Resilience" 
                    type="riskResilience"
                    {...riskResilienceAnalysis}
                />
            } />
        </Routes>
    );
}

const App = () => {
    return (
        <AppProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AppProvider>
    );
};

export default App;