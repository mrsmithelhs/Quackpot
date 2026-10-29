// Opens only the report-local Plan 32 preview in an isolated visible Chrome profile.
// Run through Plan 25's bounded-node-run.ps1; this file never starts a web server.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const previewPath = path.resolve(root, "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/index.html");
const outputDir = path.resolve(root, "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews");
const chromePath = process.env.QUACKPOT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = mkdtempSync(path.join(os.tmpdir(), "quackpot-plan32-preview-"));
const RUN_LIMIT_MS = 80000;
const CLEANUP_WAIT_MS = 3000;

let chrome;
let timer;
let stopping = false;
let chromeClosed = false;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function stopOwnedChrome() {
  if (!chrome || chrome.exitCode !== null || chrome.signalCode !== null || stopping) return;
  stopping = true;
  if (process.platform === "win32" && chrome.pid) {
    const killer = spawn("taskkill.exe", ["/PID", String(chrome.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true
    });
    await Promise.race([
      new Promise((resolve) => killer.once("close", resolve)),
      delay(CLEANUP_WAIT_MS).then(() => undefined)
    ]);
    if (killer.exitCode === null && killer.signalCode === null) killer.kill();
  } else {
    chrome.kill();
  }
  await Promise.race([
    new Promise((resolve) => chrome.once("close", resolve)),
    delay(CLEANUP_WAIT_MS).then(() => undefined)
  ]);
}

function removeTemporaryProfile() {
  if (chrome && !chromeClosed) {
    console.error(`Owned Chrome did not confirm exit; preserving its temporary profile for safe cleanup: ${profile}`);
    return;
  }
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch (error) {
    console.error(`Temporary profile cleanup failed; inspect and remove only this owned path: ${profile} (${error.message})`);
  }
}

async function run() {
  if (process.platform !== "win32") throw new Error("This bounded runner is scoped to the authorized Windows host.");
  if (!existsSync(previewPath)) throw new Error(`Preview page not found: ${previewPath}`);
  if (!existsSync(chromePath)) throw new Error(`Chrome executable not found at ${chromePath}; set QUACKPOT_CHROME_PATH if needed.`);
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(path.join(profile, "Default"), { recursive: true });
  writeFileSync(path.join(profile, "Default", "Preferences"), JSON.stringify({
    download: {
      default_directory: outputDir,
      prompt_for_download: false,
      directory_upgrade: true
    }
  }));

  const previewUrl = pathToFileURL(previewPath).href;
  chrome = spawn(chromePath, [
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--disable-default-apps",
    "--disable-component-update",
    "--disable-features=MediaRouter",
    `--user-data-dir=${profile}`,
    `--download-default-directory=${outputDir}`,
    "--window-size=1120,850",
    previewUrl
  ], { stdio: "ignore", windowsHide: false });

  chrome.on("error", (error) => {
    console.error(`Isolated Chrome launch failed: ${error.message}`);
  });
  chrome.on("close", () => { chromeClosed = true; });

  console.log(`Opened report-local preview: ${previewPath}`);
  console.log(`WAV downloads, if manually requested, are limited to: ${outputDir}`);
  console.log(`Close this isolated Chrome window when finished. Owned browser-run limit: ${RUN_LIMIT_MS} ms.`);

  await Promise.race([
    new Promise((resolve, reject) => {
      chrome.once("close", resolve);
      chrome.once("error", reject);
    }),
    new Promise((resolve) => {
      timer = setTimeout(async () => {
        console.error("Owned Plan 32 preview browser reached its time limit; closing the owned browser process tree.");
        await stopOwnedChrome();
        resolve();
      }, RUN_LIMIT_MS);
    })
  ]);
}

try {
  await run();
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
  await stopOwnedChrome();
  removeTemporaryProfile();
}
