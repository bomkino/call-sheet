// Renders Reel inserts from JSON specs (src/inserts/SPEC.md).
//
//   node scripts/render_inserts.mjs <specDir> [outDir] [--concurrency N] [--force]
//   node scripts/render_inserts.mjs --one <spec.json> [out.mp4]
//
// outDir defaults to out/inserts/<specDir's path under inserts/specs> (so
// inserts/specs/foryou renders into out/inserts/foryou), and out.mp4 to
// out/inserts/<spec name>.mp4. Every *.json under specDir (subfolders kept, folders starting with "_"
// skipped unless you point at one) becomes outDir/<same-name>.mp4 (H.264,
// silent, CRF 23, yuv420p, faststart) and outDir/<same-name>.jpg, a poster
// from near the end (JPEG q90; an old <same-name>.png poster is removed). Specs are validated first; one invalid spec stops the
// run before anything renders. Outputs newer than their spec and the insert
// source are skipped unless --force.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { cpus } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { posterFrame, validateSpec } from "../src/inserts/schema.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const option = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};

const usage = () => {
  console.error(
    "usage: node scripts/render_inserts.mjs <specDir> [outDir] [--concurrency N] [--force]\n" +
      "       node scripts/render_inserts.mjs --one <spec.json> [out.mp4]",
  );
  process.exit(2);
};

const force = flag("--force");
const one = flag("--one");
const concurrency = Math.max(1, Number(option("--concurrency") ?? 2) || 2);
if (args.length < 1 || args.length > 2) usage();
if (args.length === 1) {
  const first = resolve(args[0]);
  const specs = join(ROOT, "inserts/specs");
  const under = relative(specs, first);
  const name = one
    ? basename(first).replace(/\.json$/, ".mp4")
    : !under.startsWith("..") ? under : basename(first);
  args.push(join(ROOT, "out/inserts", name));
}

// ------------------------------------------------------------ the jobs

const customNames = readdirSync(join(ROOT, "src/inserts/custom"))
  .filter((f) => /^[a-z0-9]+(-[a-z0-9]+)*\.tsx$/.test(f))
  .map((f) => f.replace(/\.tsx$/, ""));

const walk = (dir, top = true) => {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith("_") && !e.name.startsWith(".")) out.push(...walk(p, false));
    } else if (e.name.endsWith(".json")) out.push(p);
  }
  return top ? out.sort() : out;
};

let jobs;
if (one) {
  const [spec, mp4] = args.map((a) => resolve(a));
  if (!mp4.endsWith(".mp4")) usage();
  jobs = [{ spec, mp4, poster: mp4.replace(/\.mp4$/, ".jpg") }];
} else {
  const [specDir, outDir] = args.map((a) => resolve(a));
  if (!existsSync(specDir) || !statSync(specDir).isDirectory()) {
    console.error(`No spec folder ${specDir}`);
    process.exit(2);
  }
  jobs = walk(specDir).map((spec) => {
    const rel = relative(specDir, spec).replace(/\.json$/, "");
    return { spec, mp4: join(outDir, `${rel}.mp4`), poster: join(outDir, `${rel}.jpg`) };
  });
  if (jobs.length === 0) {
    console.error(`No *.json specs in ${specDir}`);
    process.exit(2);
  }
}

// Validate everything before rendering anything.
const invalid = [];
for (const job of jobs) {
  try {
    job.raw = JSON.parse(readFileSync(job.spec, "utf8"));
    job.valid = validateSpec(job.raw, { customNames, file: relative(process.cwd(), job.spec) });
  } catch (err) {
    invalid.push(err instanceof SyntaxError ? `Invalid JSON in ${job.spec}: ${err.message}` : err.message);
  }
}
if (invalid.length > 0) {
  console.error(`\n${invalid.join("\n\n")}\n\n${invalid.length} invalid spec(s); nothing rendered.`);
  process.exit(1);
}

// Up to date when both outputs are newer than the spec and the insert source.
const newest = (dir) => {
  let t = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newest(p) : statSync(p).mtimeMs);
  }
  return t;
};
const sourceTime = Math.max(
  ...["src/inserts", "src/cs", "src/brand", "src/lib", "public/paper"].map((d) => newest(join(ROOT, d))),
);
const fresh = (job) =>
  [job.mp4, job.poster].every(
    (f) => existsSync(f) && statSync(f).mtimeMs >= Math.max(statSync(job.spec).mtimeMs, sourceTime),
  );

const todo = one || force ? jobs : jobs.filter((j) => !fresh(j));
const skipped = jobs.length - todo.length;

const kb = (f) => `${(statSync(f).size / 1024).toFixed(0)} KB`;
const report = (job, note = "") => {
  const seconds = job.valid.scenes.reduce((a, s) => a + s.seconds, 0);
  const bytes = statSync(job.mp4).size;
  const budget = (seconds / 4) * 1024 * 1024; // about 1 MB per 4 s
  const over = bytes > budget ? `  OVER the ~1 MB/4 s target (${(budget / 1024).toFixed(0)} KB)` : "";
  console.log(`${relative(process.cwd(), job.mp4)}  ${kb(job.mp4)}  ${seconds.toFixed(1)} s  |  poster ${kb(job.poster)}${note}${over}`);
};

if (todo.length === 0) {
  for (const j of jobs) report(j, "  (up to date)");
  console.log(`All ${jobs.length} insert(s) up to date. Use --force to render again.`);
  process.exit(0);
}

// ------------------------------------------------------------ render

console.log(`Bundling… (${todo.length} to render${skipped ? `, ${skipped} up to date` : ""})`);
const serveUrl = await bundle({
  entryPoint: join(ROOT, "src/index.ts"),
  rspack: true,
  publicDir: join(ROOT, "public"),
});
const browser = await openBrowser("chrome", { logLevel: "error" });
const perJob = Math.max(1, Math.floor(cpus().length / Math.min(concurrency, todo.length)));

const renderOne = async (job) => {
  const inputProps = { spec: job.raw };
  const composition = await selectComposition({ serveUrl, id: "Insert", inputProps, puppeteerInstance: browser, logLevel: "error" });
  mkdirSync(dirname(job.mp4), { recursive: true });
  const tmp = join(dirname(job.mp4), `.${basename(job.mp4, ".mp4")}.tmp.mp4`);
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: "h264",
    crf: 23,
    x264Preset: "slow",
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    imageFormat: "jpeg",
    jpegQuality: 92,
    muted: true,
    outputLocation: tmp,
    overwrite: true,
    concurrency: perJob,
    puppeteerInstance: browser,
    logLevel: "error",
  });
  // faststart: the index up front, so it plays before it's fully loaded.
  const moved = `${tmp}.fs.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-c", "copy", "-an", "-movflags", "+faststart", moved]);
  renameSync(moved, job.mp4);
  rmSync(tmp, { force: true });
  await renderStill({
    serveUrl,
    composition,
    inputProps,
    frame: Math.min(posterFrame(job.valid), composition.durationInFrames - 1),
    output: job.poster,
    imageFormat: "jpeg",
    jpegQuality: 90,
    overwrite: true,
    puppeteerInstance: browser,
    logLevel: "error",
  });
  rmSync(job.mp4.replace(/\.mp4$/, ".png"), { force: true }); // the old PNG poster
  report(job);
};

const failed = [];
const queue = [...todo];
const worker = async () => {
  while (queue.length > 0) {
    const job = queue.shift();
    try {
      await renderOne(job);
    } catch (err) {
      failed.push(job);
      console.error(`\nFAILED ${relative(process.cwd(), job.spec)}:\n${err?.message ?? err}\n`);
    }
  }
};
await Promise.all(Array.from({ length: Math.min(concurrency, todo.length) }, worker));
await browser.close({ silent: true });

if (!one) for (const j of jobs.filter((x) => !todo.includes(x))) report(j, "  (up to date)");
if (failed.length > 0) {
  console.error(`${failed.length} insert(s) failed: ${failed.map((j) => basename(j.spec)).join(", ")}`);
  process.exit(1);
}
console.log(`Rendered ${todo.length - failed.length} insert(s).`);
