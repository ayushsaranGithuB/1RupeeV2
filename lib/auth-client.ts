"use client";

import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  magicLinkClient,
  phoneNumberClient,
} from "better-auth/client/plugins";

// Auth is first-party on the same origin (no proxy hop).
// Better Auth's basePath is appended to baseURL, so baseURL is the origin.
function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
}

export const authClient = createAuthClient({
  baseURL: resolveOrigin(),
  basePath: "/api/auth",
  plugins: [magicLinkClient(), phoneNumberClient(), adminClient()],
});

export const { useSession, signIn, signOut, getSession } = authClient;
export const adminAuth = authClient.admin;
export const phoneAuth = authClient.phoneNumber;
export const magicLinkAuth = authClient.magicLink;
