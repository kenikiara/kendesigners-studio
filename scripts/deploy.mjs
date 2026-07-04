// One-command deploy to a cPanel domain over FTP/FTPS.
// Run `npm run deploy` (it builds first, then uploads the out/ folder).
// Credentials come from a local .env.deploy file that you fill in and that
// is never committed. This script never prints your password.
import { Client } from "basic-ftp";
import { readFileSync, existsSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.deploy")) {
    console.error(
      "\nMissing .env.deploy\n" +
        "Copy .env.deploy.example to .env.deploy and fill in your cPanel FTP details.\n"
    );
    process.exit(1);
  }
  for (const line of readFileSync(".env.deploy", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = "21",
  FTP_SECURE = "true",
  FTP_REMOTE_DIR = "public_html",
} = process.env;

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error("FTP_HOST, FTP_USER and FTP_PASSWORD are required in .env.deploy");
  process.exit(1);
}

const client = new Client(30000);
client.ftp.verbose = false;

try {
  console.log(`Connecting to ${FTP_HOST} as ${FTP_USER} ...`);
  await client.access({
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASSWORD,
    port: Number(FTP_PORT),
    secure: FTP_SECURE === "true",
    secureOptions: { rejectUnauthorized: false },
  });

  console.log(`Uploading out/ to ${FTP_REMOTE_DIR} ...`);
  await client.ensureDir(FTP_REMOTE_DIR);
  // uploadFromDir mirrors the local folder into the remote one, overwriting
  // changed files. It does not delete unrelated files already on the server.
  await client.uploadFromDir("out");

  console.log("\nDone. Your live site has been updated.");
} catch (err) {
  console.error("\nDeploy failed:", err.message);
  console.error(
    "Check your .env.deploy values. If your host does not support FTPS, set FTP_SECURE=false."
  );
  process.exitCode = 1;
} finally {
  client.close();
}
