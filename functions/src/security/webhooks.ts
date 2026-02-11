import * as logger from "firebase-functions/logger";
import crypto from "node:crypto";

export const shouldEnforceWebhookSignatures = (): boolean => {
  const v = String(process.env.WEBHOOK_SIGNATURE_ENFORCE || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
};

export const getRequestUrlForSignature = (req: any): string => {
  // Cloud Functions sits behind a proxy. Prefer forwarded headers.
  const proto = String(req.get?.("x-forwarded-proto") || "https")
    .split(",")[0]
    .trim();
  const host = String(req.get?.("x-forwarded-host") || req.get?.("host") || "").trim();

  const baseOverride = String(process.env.WEBHOOK_BASE_URL || "").trim();
  const base = baseOverride || (host ? `${proto}://${host}` : "");
  const path = String(req.originalUrl || req.url || "");
  return `${base}${path}`;
};

export const verifySendGridEventWebhook = (req: any): boolean => {
  // SendGrid "Signed Event Webhook" (Twilio SendGrid):
  // Headers:
  // - X-Twilio-Email-Event-Webhook-Signature (base64)
  // - X-Twilio-Email-Event-Webhook-Timestamp
  // Signed payload: timestamp + rawBody (as bytes)
  const publicKeyPem = String(process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY || "").trim();
  if (!publicKeyPem) return false;

  const sigB64 = String(req.get?.("x-twilio-email-event-webhook-signature") || "").trim();
  const ts = String(req.get?.("x-twilio-email-event-webhook-timestamp") || "").trim();
  if (!sigB64 || !ts) return false;

  const rawBody: Buffer | undefined = req.rawBody;
  if (!rawBody || !Buffer.isBuffer(rawBody)) return false;

  try {
    const signature = Buffer.from(sigB64, "base64");
    const signed = Buffer.concat([Buffer.from(ts, "utf8"), rawBody]);
    const key = crypto.createPublicKey(publicKeyPem);
    // For Ed25519, algorithm is null.
    return crypto.verify(null, signed, key, signature);
  } catch (e) {
    logger.warn("SendGrid webhook signature verification error", { error: String(e) });
    return false;
  }
};

