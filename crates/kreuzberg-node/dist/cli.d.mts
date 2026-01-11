#!/usr/bin/env node
/**
 * Proxy entry point that forwards to the Rust-based Kreuzberg CLI.
 *
 * This keeps `npx kreuzberg` working without shipping an additional TypeScript CLI implementation.
 */
declare global {
    var __filename: string | undefined;
    var __dirname: string | undefined;
}
declare function main(argv: string[]): number;

export { main };
