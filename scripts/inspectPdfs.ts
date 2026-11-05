import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

async function extract(path: string, outPath: string) {
  console.log("Loading", path);
  const buf = fs.readFileSync(path);
  const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  const parser = new PDFParse(uint8);
  await parser.load();
  const res = await parser.getText();
  console.log("Extracted text length:", res.text?.length, "Pages:", res.total);
  fs.writeFileSync(outPath, res.text || "", "utf8");
}

async function main() {
  await extract("public/assets/aistudio/Chemistry-Ar-EB-part1__1__7dd275d6.pdf", "part1_text.txt");
  await extract("public/assets/aistudio/_____________________________________________________2027________________________________________53bd65ca.pdf", "part2_text.txt");
  console.log("Both textbooks successfully extracted to text!");
}

main().catch(console.error);
