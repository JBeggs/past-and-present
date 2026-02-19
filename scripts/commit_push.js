#!/usr/bin/env node
/**
 * Run lint and tests, then add, commit, and push changes.
 * On failure, stops and exits. Uses SSH for Git.
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
      env.SSH_ASKPASS = askpass;
      env.SSH_ASKPASS_REQUIRE = 'force';
    }
  }
  return env;
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

  console.log('Running lint...');
  const lintResult = spawnSync('npm', ['run', 'lint'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (lintResult.status !== 0) {
    console.error('\nLint failed. Fix the issues and run this script again.');
    process.exit(1);
  }

  const pkg = require(path.join(PROJECT_ROOT, 'package.json'));
  if (pkg.scripts && pkg.scripts.test) {
    console.log('\nRunning tests...');
    const testResult = spawnSync('npm', ['run', 'test'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    if (testResult.status !== 0) {
      console.error('\nTests failed. Fix the failures and run this script again.');
      process.exit(1);
    }
  }

  console.log('\nStaging changes...');
  spawnSync('git', ['add', '-A'], { cwd: PROJECT_ROOT, stdio: 'inherit' });

  const commitMsg = await question('Enter commit message: ');
  if (!commitMsg) {
    console.error('Commit message required.');
    process.exit(1);
  }

  console.log('Committing...');
  const commitResult = spawnSync('git', ['commit', '-m', commitMsg], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (commitResult.status !== 0) {
    const err = (commitResult.stderr || commitResult.stdout || '').toLowerCase();
    if (err.includes('nothing to commit') || err.includes('no changes')) {
      console.log('Nothing to commit (working tree clean).');
      process.exit(0);
    }
    console.error(commitResult.stderr || commitResult.stdout || 'Commit failed.');
    process.exit(1);
  }

  console.log('Pushing to remote...');
  const pushResult = spawnSync('git', ['push'], {
    cwd: PROJECT_ROOT,
    env: getGitEnv(),
    stdio: 'inherit',
  });
  if (pushResult.status !== 0) {
    process.exit(1);
  }

  console.log('\nCommit and push complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
