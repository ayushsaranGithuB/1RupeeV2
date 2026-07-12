export type DashboardApiSuccess<T> = {
  success: true;
  data: T;
};

export type DashboardApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type DashboardApiResponse<T> =
  | DashboardApiSuccess<T>
  | DashboardApiFailure;

export async function dashboardRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers || {});

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Auth is the Better Auth session cookie: sent automatically on this same-origin request.
  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as DashboardApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = payload.success
      ? `Request failed with status ${response.status}`
      : payload.error.message;
    throw new Error(message);
  }

  return payload.data;
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toQueryString(
  params: Record<string, string | number | undefined | null>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function calculateDonationRunway(
  walletBalancePaise: number,
  totalDailyAmountPaise: number,
): number {
  if (totalDailyAmountPaise <= 0) return 0;
  return Math.floor(walletBalancePaise / totalDailyAmountPaise);
}

export function formatRunwayDays(days: number): string {
  if (days === 0) return "0 days";
  if (days === 1) return "1 day";
  return `${days} days`;
}
