#!/usr/bin/env node
/**
 * Create a new branch from main: checkout main, pull latest, create branch, push with upstream.
 * Uses SSH for Git. If SSH_KEY_PASSPHRASE is set in .env, supplies it via SSH_ASKPASS.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.dirname(SCRIPT_DIR);

function loadEnv() {
  try {
    const dotenv = require('dotenv');
    const envLocal = path.join(PROJECT_ROOT, '.env.local');
    const env = path.join(PROJECT_ROOT, '.env');
    if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
    if (fs.existsSync(env)) dotenv.config({ path: env });
  } catch (_) {}
}

function hasPassphrase() {
  return Boolean((process.env.SSH_KEY_PASSPHRASE || '').trim());
}

function getGitEnv() {
  const env = { ...process.env };
  const passphrase = (process.env.SSH_KEY_PASSPHRASE || '').trim();
  if (passphrase) {
    const askpass = path.resolve(SCRIPT_DIR, 'ssh_askpass.js');
    if (fs.existsSync(askpass)) {
      try { fs.chmodSync(askpass, 0o755); } catch (_) {}
      env.SSH_ASKPASS = askpass;
      env.SSH_ASKPASS_REQUIRE = 'force';
    }
  }
  return env;
}

function runGit(args, options = {}) {
  return spawnSync('git', args, {
    cwd: PROJECT_ROOT,
    env: options.env || getGitEnv(),
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

function getDefaultBranch() {
  const r = runGit(['rev-parse', '--verify', 'main']);
  return r.status === 0 ? 'main' : 'master';
}

function question(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  loadEnv();
  const defaultBranch = getDefaultBranch();

  console.log(`Checking out ${defaultBranch}...`);
  let r = runGit(['checkout', defaultBranch]);
  if (r.status !== 0) {
    console.error('Error:', (r.stderr || r.stdout || '').toString());
    process.exit(1);
  }

  console.log(`Pulling latest from origin ${defaultBranch}...`);
  r = spawnSync('git', ['pull', 'origin', defaultBranch], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    stdio: hasPassphrase() ? ['ignore', 'inherit', 'inherit'] : 'inherit',
  });
  if (r.status !== 0) process.exit(1);

  const branchName = await question('Enter branch name (e.g. feature/my-feature): ');
  if (!branchName) {
    console.error('Branch name required.');
    process.exit(1);
  }

  console.log(`Creating branch ${branchName}...`);
  r = runGit(['checkout', '-b', branchName]);
  if (r.status !== 0) {
    console.error('Error:', (r.stderr || r.stdout || '').toString());
    process.exit(1);
  }

  console.log('Pushing to origin and setting upstream...');
  r = spawnSync('git', ['push', '-u', 'origin', branchName], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    stdio: hasPassphrase() ? ['ignore', 'inherit', 'inherit'] : 'inherit',
  });
  if (r.status !== 0) process.exit(1);

  console.log(`\nReady to work on branch: ${branchName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
