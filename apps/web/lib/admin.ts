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

const ADMIN_HEADERS = {
  Authorization: "Bearer test-token",
};

export async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers || {});

  for (const [key, value] of Object.entries(ADMIN_HEADERS)) {
    headers.set(key, value);
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api/proxy${path}`, {
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

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
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