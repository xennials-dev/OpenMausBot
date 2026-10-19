import { execSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";

console.log("Generating OpenMausBot showcase overview video...");

const slides = [
  { file: "docs/assets/infographic-features.jpg", duration: 4 },
  { file: "docs/assets/openmausbot-dashboard.png", duration: 4 },
  { file: "docs/assets/infographic-architecture.jpg", duration: 4 },
  { file: "docs/assets/openmausbot-models.png", duration: 4 },
  { file: "docs/assets/infographic-comparison.jpg", duration: 4 },
  { file: "docs/assets/openmausbot-settings.png", duration: 4 }
];

const segmentFiles = [];

for (let i = 0; i < slides.length; i++) {
  const slide = slides[i];
  const segFile = `seg_${i}.mp4`;
  segmentFiles.push(segFile);
  
  console.log(`Processing slide ${i + 1}/${slides.length}: ${slide.file}`);
  const cmd = `ffmpeg -y -loop 1 -t ${slide.duration} -i "${slide.file}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -preset fast -r 30 "${segFile}"`;
  execSync(cmd, { stdio: "inherit" });
}

// Write concat list
const listContent = segmentFiles.map(f => `file '${f}'`).join("\n");
writeFileSync("concat_list.txt", listContent);

console.log("Concatenating into docs/assets/openmausbot-overview.mp4...");
const concatCmd = `ffmpeg -y -f concat -safe 0 -i concat_list.txt -c copy -movflags +faststart "docs/assets/openmausbot-overview.mp4"`;
execSync(concatCmd, { stdio: "inherit" });

// Cleanup temporary files
for (const f of segmentFiles) {
  if (existsSync(f)) unlinkSync(f);
}
if (existsSync("concat_list.txt")) unlinkSync("concat_list.txt");
if (existsSync("seg1.mp4")) unlinkSync("seg1.mp4");

console.log("Showcase overview video generated successfully at docs/assets/openmausbot-overview.mp4!");
