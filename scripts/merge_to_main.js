#!/usr/bin/env node
/**
 * Merge a branch into main and push. Handles common issues.
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

function getGitEnv() {
  const env = { ...process.env };
  const passphrase = (process.env.SSH_KEY_PASSPHRASE || '').trim();
  if (passphrase) {
    const askpass = path.join(SCRIPT_DIR, 'ssh_askpass.js');
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
    env: options.env ?? getGitEnv(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function getDefaultBranch() {
  const r = runGit(['rev-parse', '--verify', 'main']);
  return r.status === 0 ? 'main' : 'master';
}

function getCurrentBranch() {
  const r = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  return r.stdout.trim();
}

function hasUncommittedChanges() {
  const r = runGit(['status', '--porcelain']);
  return Boolean(r.stdout.trim());
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
  const currentBranch = getCurrentBranch();

  if (hasUncommittedChanges()) {
    console.error('You have uncommitted changes. Please commit or stash them first.');
    console.error('  git stash          # to stash changes');
    console.error('  git stash pop      # to restore after merge');
    process.exit(1);
  }

  const branchToMerge = await question(`Branch to merge into ${defaultBranch} [${currentBranch}]: `) || currentBranch;

  if (branchToMerge === defaultBranch) {
    console.log(`Already on ${defaultBranch}. Nothing to merge.`);
    process.exit(0);
  }

  console.log(`\nMerging ${branchToMerge} into ${defaultBranch}...`);
  console.log(`1. Checking out ${defaultBranch}...`);
  let r = runGit(['checkout', defaultBranch]);
  if (r.status !== 0) {
    console.error('Error:', (r.stderr || r.stdout || ''));
    process.exit(1);
  }

  console.log(`2. Pulling latest from origin ${defaultBranch}...`);
  r = spawnSync('git', ['pull', 'origin', defaultBranch], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(1);

  console.log(`3. Merging ${branchToMerge}...`);
  r = spawnSync('git', ['merge', branchToMerge, '--no-edit'], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    const out = (r.stdout + r.stderr);
    if (out.includes('CONFLICT')) {
      console.error('\nMerge conflict detected. Resolve conflicts manually:');
      console.error('  1. Fix conflicted files (search for <<<<<<<, =======, >>>>>>>)');
      console.error('  2. git add <resolved-files>');
      console.error("  3. git commit -m 'Resolve merge conflicts'");
      console.error('  4. git push origin', defaultBranch);
    } else {
      console.error(r.stderr || r.stdout || 'Merge failed.');
    }
    process.exit(1);
  }

  console.log(`4. Pushing ${defaultBranch} to origin...`);
  r = spawnSync('git', ['push', 'origin', defaultBranch], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    process.exit(1);
  }

  const switchBack = await question(`\nSwitch back to ${branchToMerge}? [y/N]: `);
  if (switchBack.toLowerCase() === 'y') {
    spawnSync('git', ['checkout', branchToMerge], { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }

  console.log(`\nMerge complete. ${branchToMerge} is now on ${defaultBranch}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
