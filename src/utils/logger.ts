/**
 * Development-only logging helpers.
 * Use these instead of raw `console.log` / `console.warn` for noisy debug output
 * so production bundles stay quiet and less data leaks to the browser console.
 *
 * For genuine failures that should surface in all environments, use `console.error` directly.
 */

const isDev = import.meta.env.DEV;

export function devLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}

export function devWarn(...args: unknown[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

export function devError(...args: unknown[]): void {
  if (isDev) {
    console.error(...args);
  }
}

export const IS_DEV = isDev;
