import browserSync from "browser-sync";
import chokidar from "chokidar";
import path from "node:path";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const devConfigPath = path.resolve("dev.config.json");
let config = {};

if (existsSync(devConfigPath)) {
  try {
    config = JSON.parse(readFileSync(devConfigPath, "utf8"));
  } catch (error) {
    console.warn(`Could not parse ${path.basename(devConfigPath)}: ${error.message}`);
  }
}

const slug = process.argv[2] || config.slug;

if (!slug) {
  console.error("Please provide an email slug (npm run dev -- email-1) or set \"slug\" in dev.config.json");
  process.exit(1);
}

const bs = browserSync.create();

const srcDir = path.resolve("src", slug);
const distDir = path.resolve("dist", slug);
const buildScript = path.resolve("scripts", "build.mjs");

if (!existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  process.exit(1);
}

const browser =
  typeof config.browser === "string" && config.browser.trim()
    ? config.browser.trim()
    : undefined;

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
        process.execPath,
        [buildScript, slug],
        { stdio: "inherit" }
    );

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

let building = false;
let queued = false;

async function rebuild() {
  if (building) {
    queued = true;
    return;
  }

  building = true;

  try {
    do {
      queued = false;
      console.log("Change detected, rebuilding...");
      await runBuild();
      bs.reload();
    } while (queued);
  } catch (error) {
    console.error(error.message);
  } finally {
    building = false;
  }
}

try {
  await runBuild();

  const bsOptions = {
    server: distDir,
    index: "index.html",
    open: true,
    notify: false
  };

  if (browser) {
    bsOptions.browser = browser;
  }

  bs.init(bsOptions);
  console.log(`Serving ${slug} from ${distDir}`);

  const watcher = chokidar.watch(srcDir, {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 25
    }
  });

  watcher.on("all", (event, filePath) => {
    if (!filePath.endsWith(".mjml") && !filePath.endsWith(".json")) {
      return;
    }

    console.log(`[watcher] ${event}: ${filePath}`);
    rebuild();
  });

  console.log(`Watching ${srcDir}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
