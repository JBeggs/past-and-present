#!/usr/bin/env node
/**
 * Helper for SSH_ASKPASS: writes SSH_KEY_PASSPHRASE from env to stdout.
 * Used by merge_to_main.js when SSH key has a passphrase.
 */
process.stdout.write(process.env.SSH_KEY_PASSPHRASE || '');
