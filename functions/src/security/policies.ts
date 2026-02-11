import { HttpsError } from "firebase-functions/v2/https";

type AuthData = {
  uid: string;
  token?: Record<string, unknown>;
} | null;

/**
 * firebase-functions CallableOptions.authPolicy signature.
 * Keep these tiny and dependency-free so they can be reused across endpoints.
 */
export const requireSignedIn = (auth: AuthData): boolean => {
  return !!auth?.uid;
};

export const requireAdmin = (auth: AuthData): boolean => {
  if (!auth?.uid) return false;

  const token = auth.token || {};
  if (token.admin === true) return true;

  const raw = String(process.env.ADMIN_UIDS || "").trim();
  if (!raw) return false;

  const allow = new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return allow.has(auth.uid);
};

export const assertSignedIn = (auth: AuthData) => {
  if (!requireSignedIn(auth)) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
};

export const assertAdmin = (auth: AuthData) => {
  if (!requireAdmin(auth)) {
    throw new HttpsError("permission-denied", "Admin privileges required.");
  }
};

