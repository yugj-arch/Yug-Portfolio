// One-command deploy: npm run ship -- "what changed"
//
// 1. Type-check, run the chatbot eval, and build (stops on any failure).
// 2. Commit everything with your message and push to main.
// 3. Wait for Vercel's deployment of that commit and check the live site.
//
// Vercel deploys automatically on every push to main; this script just makes
// sure a broken build never gets pushed and tells you when it's live.

import { execSync, spawnSync } from "node:child_process";

const SITE = "https://yug-portfolio-rosy.vercel.app";
const REPO = "yugj-arch/Yug-Portfolio";
const message = process.argv.slice(2).join(" ").trim() || "Update portfolio";

const sh = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const step = (label) => console.log(`\n▶ ${label}`);
const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};
function run(cmd) {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) fail(`"${cmd}" failed. Nothing was committed or pushed.`);
}
// tsc -b rewrites these tracked build-info files; never commit that noise.
const resetBuildInfo = () => {
  try {
    sh("git checkout -- tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo");
  } catch {
    /* not tracked or unchanged */
  }
};

// 0. Anything to ship?
const branch = sh("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") fail(`You're on "${branch}". Vercel deploys from main: switch with "git checkout main".`);
sh("git fetch -q origin main");
const dirty = sh("git status --porcelain");
const ahead = Number(sh("git rev-list --count origin/main..HEAD"));
const behind = Number(sh("git rev-list --count HEAD..origin/main"));
if (behind > 0) fail(`GitHub has ${behind} commit(s) you don't have. Run "git pull" first.`);
if (!dirty && !ahead) {
  console.log("Nothing new to deploy: your code already matches what's live.");
  process.exit(0);
}

// 1. Checks
step("Type-checking");
run("npx tsc -b");
resetBuildInfo();
step("Chatbot accuracy eval");
run("npm run eval:bot");
step("Production build");
run("npm run build");

// 2. Commit + push
if (dirty) {
  step("Committing");
  sh("git add -A");
  const files = sh("git diff --cached --name-only").split("\n").filter(Boolean);
  const secrets = files.filter((f) => /(^|\/)\.env(\.|$)|\.pem$|\.key$/i.test(f));
  if (secrets.length) {
    sh("git reset -q");
    fail(`Refusing to commit secret-looking files: ${secrets.join(", ")}. Add them to .gitignore.`);
  }
  console.log(files.map((f) => `  ${f}`).join("\n"));
  const r = spawnSync("git", ["commit", "-q", "-m", message], { stdio: "inherit" });
  if (r.status !== 0) fail("git commit failed.");
}
step("Pushing to GitHub");
run("git push origin main");
const sha = sh("git rev-parse HEAD");

// 3. Wait for Vercel
step("Waiting for Vercel (up to 5 minutes)");
let state = "unknown";
let hasGh = true;
try {
  sh("gh --version");
} catch {
  hasGh = false;
}
if (hasGh) {
  for (let i = 0; i < 30; i++) {
    try {
      state = sh(`gh api repos/${REPO}/commits/${sha}/statuses --jq ".[0].state"`) || "pending";
    } catch {
      state = "pending";
    }
    if (["success", "failure", "error"].includes(state)) break;
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 10_000));
  }
  console.log(`\nVercel: ${state}`);
} else {
  console.log("GitHub CLI (gh) not found: skipping the wait. Check the Vercel dashboard.");
}

if (state === "failure" || state === "error") {
  fail(`Vercel build failed. Logs: run "vercel inspect --logs" or open the Vercel dashboard.`);
}

const res = await fetch(SITE).catch(() => null);
console.log(res?.ok ? `\n✓ Live: ${SITE}` : `\n⚠ Pushed, but ${SITE} answered ${res?.status ?? "nothing"}. Check Vercel.`);
