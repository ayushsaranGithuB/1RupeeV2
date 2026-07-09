export type ApiResponse<T = unknown> = {
    success: true;
    data: T;
} | {
    success: false;
    error: {
        code: string;
        message: string;
    };
};

export type ApiUser = {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    role: 'USER' | 'ADMIN';
    status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
};

export type ApiWallet = {
    id: string;
    user_id: string;
    cached_balance: number;
    created_at: Date;
    updated_at: Date;
};

export type ApiCampaign = {
    id: string;
    ngo_id: string;
    title: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    hero_image: string | null;
    goal_amount: number | null;
    raised_amount: number;
    supporter_count: number;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
};

export type ApiPledge = {
    id: string;
    user_id: string;
    campaign_tier_id: string;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    started_at: Date;
    paused_at: Date | null;
    cancelled_at: Date | null;
};

export type ApiStats = {
    total_pledgers: number;
    total_supporters: number;
    total_raised: number;
    active_campaigns: number;
    verified_ngos: number;
};

export type AuthContext = {
    user: ApiUser;
    role: 'USER' | 'ADMIN';
};

// Admin types
export type ApiNgo = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    website: string | null;
    verified: boolean;
    created_at: Date;
    updated_at: Date;
};

export type ApiTier = {
    id: string;
    campaign_id: string;
    title: string;
    description: string | null;
    monthly_amount: number;
    benefits: string | null;
    created_at: Date;
    updated_at: Date;
};

export type ApiPayout = {
    id: string;
    ngo_id: string;
    period_start: Date;
    period_end: Date;
    total_amount: number;
    status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'FAILED';
    razorpay_transfer_id: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
};

export type ApiPayoutLine = {
    id: string;
    payout_id: string;
    pledge_id: string;
    amount: number;
    month: string;
    created_at: Date;
};
