"use client";

import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  magicLinkClient,
  phoneNumberClient,
} from "better-auth/client/plugins";

// All auth traffic goes through the same-origin Next proxy (/api/proxy) so the
// Better Auth session cookie is first-party to the web app. The proxy strips
// `/api/proxy` and forwards to the API's `/auth/*` handler.
//
// `withPath` in Better Auth appends basePath to baseURL, so baseURL is just the
// origin and basePath carries the proxy + auth prefix.
function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveOrigin(),
  basePath: "/api/proxy/auth",
  plugins: [magicLinkClient(), phoneNumberClient(), adminClient()],
});

export const { useSession, signIn, signOut, getSession } = authClient;
export const adminAuth = authClient.admin;
export const phoneAuth = authClient.phoneNumber;
export const magicLinkAuth = authClient.magicLink;
