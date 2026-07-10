type ApiSuccess<T> = {
    success: true;
    data: T;
};

type ApiFailure = {
    success: false;
    error: {
        code: string;
        message: string;
    };
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PublicCampaign = {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    hero_image: string | null;
    mobile_hero_image: string | null;
    tablet_hero_image: string | null;
    desktop_hero_image: string | null;
    goal_amount: number | null;
    raised_amount: number;
    supporter_count: number;
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
};

export type PublicStats = {
    total_pledgers: number;
    total_supporters: number;
    total_raised: number;
    active_campaigns: number;
    verified_ngos: number;
};

export type TransparencyReport = {
    id: string;
    title: string;
    file_url: string;
    report_type: string | null;
    created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

async function fetchApi<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        next: { revalidate: 60 },
    });

    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !payload.success) {
        throw new Error(payload.success ? `Request failed with status ${response.status}` : payload.error.message);
    }

    return payload.data;
}

export async function getPublicStats(): Promise<PublicStats | null> {
    try {
        return await fetchApi<PublicStats>("/stats");
    } catch {
        return null;
    }
}

export async function getActiveCampaigns(limit = 12): Promise<PublicCampaign[]> {
    try {
        return await fetchApi<PublicCampaign[]>(`/campaigns?status=ACTIVE&limit=${limit}&offset=0`);
    } catch {
        return [];
    }
}

export async function getCampaignBySlug(slug: string): Promise<PublicCampaign | null> {
    try {
        return await fetchApi<PublicCampaign>(`/campaigns/${slug}`);
    } catch {
        return null;
    }
}

export async function getTransparencyReports(): Promise<TransparencyReport[]> {
    try {
        return await fetchApi<TransparencyReport[]>("/stats/reports");
    } catch {
        return [];
    }
}

export function formatInrPaisa(value: number | null | undefined) {
    const amount = Math.max(0, Math.round((value || 0) / 100));
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}
