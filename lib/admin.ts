export type AdminApiSuccess<T> = {
  success: true;
  data: T;
};

export type AdminApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type AdminApiResponse<T> = AdminApiSuccess<T> | AdminApiFailure;

export async function adminRequest<T>(
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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    return text as T;
  }

  const payload = (await response.json()) as AdminApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = payload.success
      ? `Request failed with status ${response.status}`
      : payload.error.message;
    throw new Error(message);
  }

  return payload.data;
}

// Amounts are stored in rupees; format them as INR currency
export function formatCurrency(amountInRupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountInRupees || 0);
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

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDuration(
  startedAt?: string | Date | null,
  finishedAt?: string | Date | null,
) {
  if (!startedAt || !finishedAt) {
    return "-";
  }

  const totalSeconds = Math.round(
    (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );
  if (totalSeconds < 0) {
    return "-";
  }
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
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