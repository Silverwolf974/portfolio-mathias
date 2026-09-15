import fs from "node:fs/promises";
import path from "node:path";
import { PresentationFile, FileBlob } from "@oai/artifact-tool";

const root = "C:/Users/alyde/Documents/portefolio/toto/portfolio-mathias";
const source = path.join(root, "output/presentations/Kali_Mana_Internship_Defense_v2.pptx");
const out = path.join(root, ".build/pptx/final-previews-v2");
await fs.mkdir(out, { recursive: true });
const pres = await PresentationFile.importPptx(await FileBlob.load(source));
for (let i = 0; i < 28; i++) {
  const rendered = await pres.export({ slide: pres.slides.getItem(i), format: "png", scale: 1 });
  await fs.writeFile(path.join(out, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await rendered.arrayBuffer()));
}
const montage = await pres.export({ format: "png", montage: { columns: 4, slideWidth: 320, padding: 12, gap: 12, background: "#DDE6EC" } });
await fs.writeFile(path.join(root, ".build/pptx/slides-montage-v2.png"), new Uint8Array(await montage.arrayBuffer()));
