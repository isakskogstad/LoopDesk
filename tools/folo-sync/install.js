#!/usr/bin/env node

/**
 * Folo Sync Daemon Installer for macOS
 *
 * Usage:
 *   node install.js                    # Install daemon
 *   node install.js --uninstall        # Uninstall daemon
 *   node install.js --status           # Check daemon status
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync, chmodSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
  label: "com.loopdesk.folo-sync",
  installDir: join(homedir(), ".config/folo-sync"),
  launchAgentsDir: join(homedir(), "Library/LaunchAgents"),
  logDir: join(homedir(), "Library/Logs/folo-sync"),
};

function log(message) {
  console.log(`[Folo Sync Installer] ${message}`);
}

function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function install() {
  log("Installing Folo Sync Daemon...\n");

  // Check for Node.js
  const nodePath = spawnSync("which", ["node"]).stdout.toString().trim();
  if (!nodePath) {
    log("ERROR: Node.js not found. Please install Node.js first.");
    process.exit(1);
  }
  log(`Using Node.js: ${nodePath}`);

  // Check for Folo app
  const foloPath = join(
    homedir(),
    "Library/Containers/is.follow/Data/Library/Application Support/Folo"
  );
  if (!existsSync(foloPath)) {
    log("WARNING: Folo app data not found. Make sure Folo is installed.");
  } else {
    log(`Found Folo data at: ${foloPath}`);
  }

  // Get configuration
  console.log("\n--- Configuration ---\n");

  let apiKey = process.env.FOLO_SYNC_API_KEY;
  if (!apiKey) {
    apiKey = await prompt("Enter your FOLO_SYNC_API_KEY: ");
    if (!apiKey) {
      log("ERROR: API key is required");
      process.exit(1);
    }
  }

  let userEmail = process.env.LOOPDESK_USER_EMAIL;
  if (!userEmail) {
    userEmail = await prompt("Enter your LoopDesk email: ");
    if (!userEmail) {
      log("ERROR: Email is required");
      process.exit(1);
    }
  }

  let apiUrl =
    process.env.LOOPDESK_API_URL ||
    "https://loopdesk-production.up.railway.app";
  const customUrl = await prompt(
    `LoopDesk API URL [${apiUrl}]: `
  );
  if (customUrl) {
    apiUrl = customUrl;
  }

  console.log("\n--- Installing ---\n");

  // Create directories
  for (const dir of [CONFIG.installDir, CONFIG.launchAgentsDir, CONFIG.logDir]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  }

  // Copy daemon files
  const filesToCopy = ["daemon.js", "package.json"];
  for (const file of filesToCopy) {
    const src = join(__dirname, file);
    const dst = join(CONFIG.installDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dst);
      log(`Copied: ${file}`);
    }
  }

  // Install npm dependencies
  log("Installing dependencies...");
  try {
    execSync("npm install --production", {
      cwd: CONFIG.installDir,
      stdio: "inherit",
    });
  } catch (error) {
    log("WARNING: Could not install dependencies. You may need to run 'npm install' manually.");
  }

  // Create plist with configuration
  const plistTemplate = readFileSync(
    join(__dirname, "com.loopdesk.folo-sync.plist"),
    "utf-8"
  );

  const plist = plistTemplate
    .replace(/__INSTALL_DIR__/g, CONFIG.installDir)
    .replace(/__LOG_DIR__/g, CONFIG.logDir)
    .replace(/__API_KEY__/g, apiKey)
    .replace(/__USER_EMAIL__/g, userEmail)
    .replace(/https:\/\/loopdesk-production\.up\.railway\.app/g, apiUrl)
    .replace(/\/opt\/homebrew\/bin\/node/g, nodePath);

  const plistPath = join(CONFIG.launchAgentsDir, `${CONFIG.label}.plist`);
  writeFileSync(plistPath, plist);
  log(`Created plist: ${plistPath}`);

  // Load the daemon
  log("Loading daemon...");
  try {
    // Unload if already loaded
    spawnSync("launchctl", ["unload", plistPath], { stdio: "ignore" });

    // Load
    const result = spawnSync("launchctl", ["load", plistPath]);
    if (result.status === 0) {
      log("Daemon loaded successfully!");
    } else {
      log(`Warning: launchctl returned ${result.status}`);
    }
  } catch (error) {
    log(`Warning: Could not load daemon: ${error.message}`);
  }

  console.log("\n--- Installation Complete ---\n");
  log("The daemon is now running and will start automatically on login.");
  log(`Logs: ${CONFIG.logDir}/folo-sync.log`);
  log(`Config: ${CONFIG.installDir}`);
  console.log("\nUseful commands:");
  console.log(`  View logs:     tail -f ${CONFIG.logDir}/folo-sync.log`);
  console.log(`  Check status:  launchctl list | grep folo-sync`);
  console.log(`  Stop daemon:   launchctl unload ${plistPath}`);
  console.log(`  Start daemon:  launchctl load ${plistPath}`);
  console.log(`  Uninstall:     node ${join(__dirname, "install.js")} --uninstall`);
}

function uninstall() {
  log("Uninstalling Folo Sync Daemon...\n");

  const plistPath = join(CONFIG.launchAgentsDir, `${CONFIG.label}.plist`);

  // Unload daemon
  if (existsSync(plistPath)) {
    log("Unloading daemon...");
    spawnSync("launchctl", ["unload", plistPath], { stdio: "ignore" });
    unlinkSync(plistPath);
    log(`Removed: ${plistPath}`);
  }

  // Remove install directory
  if (existsSync(CONFIG.installDir)) {
    log(`Removing: ${CONFIG.installDir}`);
    execSync(`rm -rf "${CONFIG.installDir}"`);
  }

  console.log("\n--- Uninstallation Complete ---\n");
  log("The daemon has been removed.");
  log(`Note: Logs are still available at: ${CONFIG.logDir}`);
}

function status() {
  log("Checking daemon status...\n");

  const plistPath = join(CONFIG.launchAgentsDir, `${CONFIG.label}.plist`);

  if (!existsSync(plistPath)) {
    log("Status: NOT INSTALLED");
    return;
  }

  log(`Plist: ${plistPath}`);

  // Check launchctl
  const result = spawnSync("launchctl", ["list"], { encoding: "utf-8" });
  const lines = result.stdout.split("\n").filter((l) => l.includes("folo-sync"));

  if (lines.length > 0) {
    log("Status: RUNNING");
    console.log(lines.join("\n"));
  } else {
    log("Status: STOPPED (installed but not running)");
  }

  // Show recent logs
  const logFile = join(CONFIG.logDir, "folo-sync.log");
  if (existsSync(logFile)) {
    console.log("\nRecent logs:");
    try {
      const logs = execSync(`tail -10 "${logFile}"`, { encoding: "utf-8" });
      console.log(logs);
    } catch {
      log("Could not read logs");
    }
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes("--uninstall")) {
  uninstall();
} else if (args.includes("--status")) {
  status();
} else {
  install().catch((error) => {
    log(`Error: ${error.message}`);
    process.exit(1);
  });
}
