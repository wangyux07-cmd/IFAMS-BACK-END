export interface Activity {
    id: number;
    title: string;
    category: string;
    time: string;
    amount: string;
    icon: string;
    source_asset_id?: number; // Optional linkage to an asset
}

export interface Assets {
    cash: number;
    equities: number;
    fixedIncome: number;
    fx: number;
    insurance: number;
    liabilities: number;
}

export interface AssetItem {
    id: number;
    asset_key: keyof Assets; // Changed from assetKey to asset_key
    name: string;
    institution: string;
    amount: number;
    currency: string;
    date: string;
    remarks?: string;
    attributes?: Record<string, string | number>; // Flexible storage for category-specific data
}

export interface GrowthMetrics {
    amount: number;
    percent: number;
    isPositive: boolean;
    prevNetWorth: number; // The baseline for calculation
}

export interface AppContextType {
    username: string;
    setUsername: (name: string) => void;
    userAvatar: string;
    setUserAvatar: (url: string) => void;
    activities: Activity[];
    addActivity: (activity: Activity, sourceAssetId?: number, expenseCurrency?: string) => void;
    assets: Assets;
    assetItems: AssetItem[];
    addAssetItem: (item: AssetItem) => void;
    updateAsset: (item: AssetItem) => void;
    totalNetWorth: number;
    growthMetrics: GrowthMetrics;
    financialScore: number;
}