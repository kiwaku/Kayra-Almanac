import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

// Assertions 20 + 21 — build + type check (astro check is invoked inside `astro build` via the `build` script).

test('npm run build exits 0', () => {
  // This also runs `astro check` via the script: `astro check && astro build`.
  try {
    execSync('npm run build', {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 180_000,
    });
  } catch (e: any) {
    const stdout = e.stdout?.toString() ?? '';
    const stderr = e.stderr?.toString() ?? '';
    throw new Error(`build failed:\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
  }
  expect(true).toBe(true);
});
