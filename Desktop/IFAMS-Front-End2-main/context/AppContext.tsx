import React, { createContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { AppContextType, Assets, Activity, AssetItem, GrowthMetrics } from '../types';
import { supabase } from '../src/supabaseClient'; // Import Supabase client
import { User } from '@supabase/supabase-js'; // Import User type from Supabase

// Interface for Supabase profiles table
interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    updated_at?: string;
}

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
const PREVIOUS_MONTH_NET_WORTH = 0; // 修改为0

export const AppProvider = ({ children }: { children?: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [assetItems, setAssetItems] = useState<AssetItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from Supabase
    const fetchUserProfile = async (userId: string) => {
        console.log('fetchUserProfile: Attempting to fetch profile for userId:', userId);
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("fetchUserProfile: Supabase请求超时（3秒未响应）")), 3000)
            );

            const fetchPromise = supabase.from('profiles').select('*').eq('id', userId).single();

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error) {
                if (error.code === 'PGRST116') {
                    console.warn('fetchUserProfile: No profile found for userId:', userId, '. This is expected for new users.');
                    setProfile(null);
                } else {
                    console.error('fetchUserProfile: Error fetching profile:', JSON.stringify(error, null, 2));
                    setProfile(null);
                }
            } else {
                console.log('fetchUserProfile: Successfully fetched profile:', data);
                setProfile(data);
            }
        } catch (err: any) {
            console.error('fetchUserProfile: Caught exception during profile fetch:', err.message, err);
            setProfile(null);
        }
    };

    // Fetch asset items from Supabase
    const fetchAssetItems = async (userId: string) => {
        console.log('fetchAssetItems: Attempting to fetch asset items for userId:', userId);
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("fetchAssetItems: Supabase请求超时（3秒未响应）")), 3000)
            );

            const fetchPromise = supabase.from('asset_items').select('*').eq('user_id', userId).order('date', { ascending: false });

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error) {
                console.error('fetchAssetItems: Error fetching asset items:', JSON.stringify(error, null, 2));
                setAssetItems([]);
            } else {
                console.log('fetchAssetItems: Successfully fetched asset items:', data);
                setAssetItems(data as AssetItem[]);
            }
        } catch (err: any) {
            console.error('fetchAssetItems: Caught exception during asset items fetch:', err.message, err);
            setAssetItems([]);
        }
    };

    // Fetch activities from Supabase
    const fetchActivities = async (userId: string) => {
        console.log('fetchActivities: Attempting to fetch activities for userId:', userId);
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("fetchActivities: Supabase请求超时（3秒未响应）")), 3000)
            );

            const query = supabase.from('activities').select('*').eq('user_id', userId).order('time', { ascending: false });
            console.log('fetchActivities: Supabase Query SQL:', query.toSql()); // 添加这一行

            const { data, error } = await Promise.race([query, timeoutPromise]);

            if (error) {
                console.error('fetchActivities: Error fetching activities:', JSON.stringify(error, null, 2));
                setActivities([]);
            } else {
                console.log('fetchActivities: Successfully fetched activities:', data);
                setActivities(data as Activity[]);
            }
        } catch (err: any) {
            console.error('fetchActivities: Caught exception during activities fetch:', err.message, err);
            setActivities([]);
        }
    };


    // Effect to handle initial session and auth state changes
    useEffect(() => {
        const getSessionAndFinishLoading = async () => {
            console.log('getSessionAndFinishLoading: Starting REAL session check.');
            setLoading(true);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('getSessionAndFinishLoading: Error getting session:', JSON.stringify(sessionError, null, 2));
                    setUser(null);
                } else {
                    setUser(session?.user || null);
                }
                
                console.log('getSessionAndFinishLoading: Current user session:', session?.user ? 'exists' : 'does not exist');

                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                    await fetchAssetItems(session.user.id);
                    await fetchActivities(session.user.id);
                }
            } catch (err: any) {
                console.error('getSessionAndFinishLoading: Caught unexpected exception:', err.message, err);
                setUser(null);
                setProfile(null);
                setActivities([]);
                setAssetItems([]);
            } finally {
                setLoading(false); // Ensure loading is always set to false
                console.log('getSessionAndFinishLoading: Finished REAL session check. Loading set to false.');
            }
        };

        getSessionAndFinishLoading();

        // This listener will handle subsequent auth state changes (login, logout, refresh)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('onAuthStateChange: Event:', event, 'Session user:', session?.user ? 'exists' : 'does not exist');
            setUser(session?.user || null);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
                await fetchAssetItems(session.user.id);
                await fetchActivities(session.user.id);
            } else {
                setProfile(null);
                setActivities([]);
                setAssetItems([]);
            }
            setLoading(false); // Ensure loading state is reset after any auth change
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

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
            
            // Access item.asset_key (snake_case)
            if (acc[item.asset_key] !== undefined) {
                acc[item.asset_key] += valueUSD;
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
        let percent = 0;
        if (PREVIOUS_MONTH_NET_WORTH === 0 && totalNetWorth === 0) {
            // 如果上月净资产和当前净资产都为0，增长百分比也视为0
            percent = 0;
        } else if (PREVIOUS_MONTH_NET_WORTH === 0 && totalNetWorth !== 0) {
            // 如果上月净资产为0，但当前净资产不为0，表示从无到有，增长百分比设为100% (代表有增长) 或一个特殊值
            // 为了避免Infinity，这里可以设定一个合理的默认值，比如初次增长
            percent = 100; // 或者设置为0，具体取决于产品需求
        } else {
            // 正常计算
            percent = (diff / PREVIOUS_MONTH_NET_WORTH) * 100;
        }

        return {
            amount: diff,
            percent: percent,
            isPositive: diff >= 0, // isPositive 仍然基于 diff
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

    // Supabase CRUD Operations for Activities
    const addActivity = async (activity: Omit<Activity, 'id' | 'user_id' | 'time'>, source_asset_id?: number, expenseCurrency: string = 'USD') => {
        if (!user) {
            console.warn('addActivity: No user logged in.');
            return;
        }
        const newActivity = { ...activity, user_id: user.id, time: new Date().toISOString() };
        console.log('addActivity: Attempting to insert activity:', newActivity);
        const { data, error } = await supabase.from('activities').insert([newActivity]).select().single();
        if (error) {
            console.error('addActivity: Error adding activity:', JSON.stringify(error, null, 2));
            return;
        }
        console.log('addActivity: Supabase insert result data structure:', data); // 添加日志
        console.log('addActivity: Successfully added activity:', data);
        setActivities(prev => [data, ...prev]);
        
        // Double-Entry Logic: If a source account is selected, deduct the amount from that asset
        if (source_asset_id) {
            const expenseAmount = parseFloat(activity.amount.toString());
            
            const { data: assetData, error: assetError } = await supabase.from('asset_items').select('*').eq('id', source_asset_id).single();
            if (assetError || !assetData) {
                console.error('addActivity: Error fetching asset for double-entry:', JSON.stringify(assetError, null, 2));
                return;
            }

            const item = assetData as AssetItem;

            const expenseRateToUSD = RATES[expenseCurrency] || 1;
            const usdValue = expenseAmount * expenseRateToUSD;
            const assetRateToUSD = RATES[item.currency] || 1;
            const deductionInAssetCurrency = usdValue / assetRateToUSD;

            const updatedAmount = Math.max(0, item.amount - deductionInAssetCurrency);
            console.log('addActivity: Updating asset for double-entry. Item ID:', source_asset_id, 'New Amount:', updatedAmount);
            const { error: updateError } = await supabase.from('asset_items')
                .update({ amount: updatedAmount })
                .eq('id', source_asset_id);
            
            if (updateError) {
                console.error('addActivity: Error updating asset item for double-entry:', JSON.stringify(updateError, null, 2));
            } else {
                console.log('addActivity: Asset item updated for double-entry.');
                // We need to re-fetch all items to get the newly inserted item with its generated ID
                fetchAssetItems(user.id);
            }
        }
    };

    const deleteActivity = async (id: number) => {
        if (!user) return;
        console.log('deleteActivity: Preparing to delete activity with ID:', id);
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (error) {
            console.error('deleteActivity: Error deleting activity:', JSON.stringify(error, null, 2));
        } else {
            console.log('deleteActivity: Successfully deleted activity with ID:', id);
            setActivities(prev => prev.filter(act => act.id !== id));
        }
    };
    
    // Supabase CRUD Operations for AssetItems
    const addAssetItem = async (item: Omit<AssetItem, 'id' | 'user_id'>) => {
        if (!user) {
            console.warn('addAssetItem: No user logged in.');
            return;
        }
        // Access item.asset_key (snake_case)
        const newItem = { ...item, user_id: user.id }; // 简化
        console.log('addAssetItem: Attempting to insert asset item:', newItem);
        const { data, error } = await supabase.from('asset_items').insert([newItem]).select().single();
        if (error) {
            console.error('addAssetItem: Error adding asset item:', JSON.stringify(error, null, 2));
            return;
        }
        console.log('addAssetItem: Supabase insert result data structure:', data); // 添加日志
        console.log('addAssetItem: Successfully added asset item:', data);
        setAssetItems(prev => [data, ...prev]);
    };

    const updateAssetItem = async (item: AssetItem) => {
        if (!user) return;
        console.log('updateAssetItem: Preparing to update asset item:', item);
        // 确保传递给 Supabase 的对象使用 asset_key
        const itemToUpdate = { ...item }; // 简化
        const { error } = await supabase.from('asset_items').update(itemToUpdate).eq('id', item.id);
        if (error) {
            console.error('updateAssetItem: Error updating asset item:', JSON.stringify(error, null, 2));
        } else {
            console.log('updateAssetItem: Successfully updated asset item with ID:', item.id);
            fetchAssetItems(user.id);
        }
    };

    const deleteAssetItem = async (id: number) => {
        if (!user) return;
        console.log('deleteAssetItem: Preparing to delete asset item with ID:', id);
        const { error } = await supabase.from('asset_items').delete().eq('id', id);
        if (error) {
            console.error('deleteAssetItem: Error deleting asset item:', JSON.stringify(error, null, 2));
        } else {
            console.log('deleteAssetItem: Successfully deleted asset item with ID:', id);
            setAssetItems(prev => prev.filter(asset => asset.id !== id));
        }
    };

    // User profile related setters, now using profile state
    const setUsername = async (newUsername: string) => {
        if (!user) return;
        console.log('setUsername: Attempting to update username to:', newUsername);
        const { error } = await supabase.from('profiles').update({ username: newUsername, updated_at: new Date().toISOString() }).eq('id', user.id);
        if (error) {
            console.error('setUsername: Error updating username:', JSON.stringify(error, null, 2));
        } else {
            console.log('setUsername: Successfully updated username to:', newUsername);
            setProfile(prev => prev ? { ...prev, username: newUsername } : null);
        }
    };

    const setUserAvatar = async (newAvatarUrl: string) => {
        if (!user) return;
        console.log('setUserAvatar: Attempting to update avatar URL to:', newAvatarUrl);
        const { error } = await supabase.from('profiles').update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() }).eq('id', user.id);
        if (error) {
            console.error('setUserAvatar: Error updating avatar:', JSON.stringify(error, null, 2));
        } else {
            console.log('setUserAvatar: Successfully updated avatar URL to:', newAvatarUrl);
            setProfile(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white text-lg bg-background-dark">
                Loading Application...
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ 
            username: profile?.username || 'Guest', 
            setUsername, 
            userAvatar: profile?.avatar_url || 'https://picsum.photos/200/200', 
            setUserAvatar,
            activities, 
            addActivity,
            deleteActivity,
            assets, 
            assetItems, 
            addAssetItem, 
            updateAsset: updateAssetItem, // Renamed for clarity and consistency
            deleteAssetItem,
            totalNetWorth, 
            financialScore, 
            growthMetrics 
        }}>
            {children}
        </AppContext.Provider>
    );
};