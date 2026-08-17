import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Module resolve hook for the standalone test runner.
 *
 * Source files are written the way Next expects: the `@/*` alias, and relative
 * imports without a file extension. Plain ESM understands neither. Rather than
 * adding a test framework or a bundler to run a handful of unit tests, this
 * hook resolves both the way TypeScript would. Node strips the types itself.
 */

const root = process.cwd();
const CANDIDATES = ["", ".ts", ".tsx", ".js", "/index.ts", "/index.tsx"];

function firstExisting(basePath) {
  for (const suffix of CANDIDATES) {
    const candidate = `${basePath}${suffix}`;
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  // `@/foo` -> `<root>/src/foo`
  if (specifier.startsWith("@/")) {
    const match = firstExisting(resolvePath(root, "src", specifier.slice(2)));
    if (!match) {
      throw new Error(`Could not resolve "${specifier}" via the @/ alias.`);
    }
    return nextResolve(pathToFileURL(match).href, context);
  }

  // Relative imports: let Node try first, then fill in the extension it needs.
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    try {
      return await nextResolve(specifier, context);
    } catch (error) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const match = firstExisting(resolvePath(parentDir, specifier));
      if (!match) throw error;
      return nextResolve(pathToFileURL(match).href, context);
    }
  }

  return nextResolve(specifier, context);
}
