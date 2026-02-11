#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * One-time utility to set a Firebase Auth custom claim:
 *   admin=true
 *
 * Usage:
 *   node scripts/set-admin-claim.cjs --uid <FIREBASE_UID>
 *   node scripts/set-admin-claim.cjs --uid <UID> --project <projectId>
 *   node scripts/set-admin-claim.cjs --uid <UID> --service-account ./serviceAccountKey.json
 *
 * Notes:
 * - Prefer passing a service account JSON (or set GOOGLE_APPLICATION_CREDENTIALS).
 * - This script is meant to be run by a trusted operator on a trusted machine.
 */

const path = require("node:path");
const fs = require("node:fs");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key] = val;
  }
  return out;
}

function usage(msg) {
  if (msg) console.error(`\n${msg}\n`);
  console.error(
    [
      "Usage:",
      "  node scripts/set-admin-claim.cjs --uid <FIREBASE_UID> [--service-account <path>] [--project <projectId>]",
      "",
      "Examples:",
      "  node scripts/set-admin-claim.cjs --uid abc123 --service-account ./serviceAccountKey.json",
      "  node scripts/set-admin-claim.cjs --uid abc123 --project your-firebase-project-id",
    ].join("\n"),
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const uid = args.uid;
  if (!uid) usage("Missing --uid");

  const serviceAccountPath =
    args["service-account"] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, "..", "serviceAccountKey.json");

  // eslint-disable-next-line import/no-extraneous-dependencies
  const admin = require("firebase-admin");

  if (admin.apps.length === 0) {
    const maybePath = String(serviceAccountPath || "").trim();
    if (maybePath && fs.existsSync(maybePath)) {
      const p = path.isAbsolute(maybePath) ? maybePath : path.join(process.cwd(), maybePath);
      const raw = fs.readFileSync(p, "utf8");
      const json = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(json),
        projectId: args.project || json.project_id,
      });
      console.log(`Using service account: ${p}`);
    } else {
      // Fall back to ADC (useful on CI/GCP)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: args.project,
      });
      console.log("Using application default credentials (GOOGLE_APPLICATION_CREDENTIALS / ADC).");
    }
  }

  const claims = { admin: true };
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log(`Set custom claims for uid=${uid}: ${JSON.stringify(claims)}`);
  console.log("Next: sign out/in on the client to refresh the ID token.");
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

