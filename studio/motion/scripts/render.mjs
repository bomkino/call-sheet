// Renders a scene at every size in src/sizes.json.
//
//   npm run render                       clean masters: out/EndCard-<size>.mp4
//   npm run render:cine                  printed to film: out/EndCard-<size>-cine.mp4
//   npm run render -- 1080x1440          just the sizes you name
//   npm run render -- MyScene            another scene's <Scene>-<size> compositions
//   npm run render:cine -- --look paper  the film look for bright grounds
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

const sizes = JSON.parse(
  readFileSync(new URL("../src/sizes.json", import.meta.url), "utf8"),
).map((size) => size.id);

const args = process.argv.slice(2);
const cine = args.includes("--cine");
const lookAt = args.indexOf("--look");
const look = lookAt === -1 ? "dark" : args[lookAt + 1];
const names = args.filter((a, i) => !a.startsWith("--") && i !== lookAt + 1);
const picked = names.filter((a) => sizes.includes(a));
const scene = names.find((a) => !sizes.includes(a)) ?? "Sting5s";

const run = (cmd, argv) => execFileSync(cmd, argv, { stdio: "inherit" });

for (const size of picked.length > 0 ? picked : sizes) {
  const id = `${scene}-${size}`;
  if (cine) {
    // The negative: the design alone as PNG frames, which the lab prints.
    const frames = `out/frames/${id}`;
    rmSync(frames, { recursive: true, force: true });
    run("npx", [
      "remotion",
      "render",
      id,
      frames,
      "--sequence",
      "--image-format=png",
    ]);
    run("python3", [
      "scripts/print_film.py",
      frames,
      `out/${id}-cine.mp4`,
      "--look",
      look,
    ]);
  } else {
    run("npx", [
      "remotion",
      "render",
      id,
      `out/${id}.mp4`,
      "--codec=h264",
      "--crf=16",
      "--x264-preset=slow",
      "--pixel-format=yuv420p",
      "--color-space=bt709",
      "--audio-codec=aac",
      "--audio-bitrate=320k",
    ]);
  }
}
