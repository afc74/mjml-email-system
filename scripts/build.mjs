import { mkdirp } from "mkdirp";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

let mjmlCli;
try {
  mjmlCli = require.resolve("mjml/bin/mjml");
} catch {
  mjmlCli = path.resolve("node_modules", "mjml", "bin", "mjml");
}

const slug = process.argv[2];

if (!slug) {
  console.error("Please provide an email slug, for example: npm run build -- email-1");
  process.exit(1);
}

const input = path.resolve("src", slug, "index.mjml");
const outputDir = path.resolve("dist", slug);
const output = path.join(outputDir, "index.html");

if (!existsSync(input)) {
  console.error(`Input file not found: ${path.relative(process.cwd(), input)}`);
  process.exit(1);
}

await mkdirp(outputDir);

try {
  await execFileAsync(
      process.execPath,
      [
        mjmlCli,
        input,
        "-o",
        output,
        "--config.allowIncludes",
        "true"
      ]
  );

  console.log(`Built ${path.relative(process.cwd(), output)}`);
} catch (error) {
  console.error("Build failed.");
  if (error.message) console.error(error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}
