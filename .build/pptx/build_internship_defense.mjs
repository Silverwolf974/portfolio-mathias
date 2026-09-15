import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile, FileBlob } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/alyde/Documents/portefolio/toto/portfolio-mathias";
const SKILL_DIR = "C:/Users/alyde/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
const TMP_DIR = path.join(workspaceDir, ".build/pptx");
const FINAL_PPTX = path.join(workspaceDir, "output/presentations/Kali_Mana_Internship_Defense_v2.pptx");
const RUNTIME_PYTHON = "C:/Users/alyde/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const { applyPresentationChartFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const W = 1280;
const H = 720;
const FONT = "Arial";
const C = {
  navy: "#082C4C",
  blue: "#0B5B8C",
  turquoise: "#00A9B7",
  green: "#6F8F72",
  oat: "#D8B77B",
  oatLight: "#F4EBDD",
  ink: "#173244",
  slate: "#526878",
  light: "#E9F0F4",
  pale: "#F7FAFC",
  white: "#FFFFFF",
  grey: "#98A8B3",
  darkGrey: "#657783",
  red: "#B64A50",
  amber: "#C88A32",
};

const A = (name) => path.join(workspaceDir, ".build/report-images", name);
const ASSETS = {
  lab: A("p01_i03.jpg"),
  esiroi: A("p01_i01.jpg"),
  ur: A("p01_i02.png"),
  aut: A("p01_i04.png"),
  vr1: A("p10_i01.png"),
  vr2: A("p10_i02.png"),
  processFigure: A("p13_i01.png"),
  powders: A("p14_i01.jpg"),
  ultraturraxSmall: A("p14_i02.jpg"),
  rheometer: A("p15_i01.png"),
  cylinder: A("p15_i02.png"),
  freezeDry: A("p16_i01.jpg"),
  digestion: A("p16_i02.jpg"),
  distillation: A("p16_i03.jpg"),
  soyCurve: A("p21_i01.png"),
  riceCurve: A("p21_i02.png"),
  riceHeatCurve: A("p22_i01.png"),
  likingOriginal: A("p25_i01.png"),
  preferenceOriginal: A("p32_i01.png"),
  colorDevice: A("p33_i01.png"),
  oven: A("p33_i02.jpg"),
  caramel: A("p33_i03.jpg"),
  trays: A("p34_i01.jpg"),
  ultraturrax: A("p34_i02.jpg"),
  centrifuge: A("p34_i03.jpg"),
  rheometer2: A("p34_i04.jpg"),
  storage: A("p34_i05.jpg"),
  tulsi: A("p34_i06.jpg"),
  nzMap: path.join(workspaceDir, ".build/new-zealand-map.png"),
};

const imageCache = new Map();
async function bytes(file) {
  if (!imageCache.has(file)) imageCache.set(file, new Uint8Array(await fs.readFile(file)));
  return imageCache.get(file);
}
function mime(file) {
  const ext = path.extname(file).toLowerCase();
  return ext === ".png" ? "image/png" : "image/jpeg";
}

const pres = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, x, y, w, h, fill = "none", lineFill = "none", lineWidth = 0) {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: lineFill, width: lineWidth },
  });
}
function text(slide, value, x, y, w, h, size = 24, color = C.ink, opts = {}) {
  const s = shape(slide, "textbox", x, y, w, h, opts.fill ?? "none", opts.lineFill ?? "none", opts.lineWidth ?? 0);
  s.text = value;
  s.text.style = {
    typeface: FONT,
    fontSize: size,
    color,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "middle",
    autoFit: opts.autoFit ?? "shrinkText",
  };
  return s;
}
function addLine(slide, x, y, w, h, color = C.light, width = 2) {
  return shape(slide, "line", x, y, w, h, "none", color, width);
}
async function photo(slide, file, x, y, w, h, fit = "cover", radius = "rounded-xl", alt = "Internship photograph") {
  return slide.images.add({
    blob: await bytes(file),
    contentType: mime(file),
    alt,
    fit,
    geometry: radius ? "roundRect" : "rect",
    ...(radius ? { borderRadius: radius } : {}),
    position: { left: x, top: y, width: w, height: h },
  });
}
function baseSlide(title, section, backup = false) {
  const slide = pres.slides.add();
  slide.background.fill = backup ? C.pale : C.white;
  shape(slide, "rect", 0, 0, W, 10, backup ? C.oat : C.turquoise);
  text(slide, backup ? "BACKUP" : section.toUpperCase(), 60, 24, 220, 22, 12, backup ? C.amber : C.blue, { bold: true });
  text(slide, title, 60, 54, 1120, 60, 34, C.navy, { bold: true });
  addLine(slide, 60, 122, 1160, 1, C.light, 1);
  return slide;
}
function footer(slide, number, backup = false) {
  text(slide, backup ? "Appendix" : "Kali Mana, AUT 2026", 60, 686, 350, 18, 11, C.grey);
  text(slide, String(number).padStart(2, "0"), 1180, 684, 40, 20, 11, C.grey, { align: "right" });
}
function notes(slide, body, sourcePages) {
  const source = sourcePages ? `\n\nSource: Kali Mana, AUT Internship Report, 2026, ${sourcePages}.` : "";
  slide.speakerNotes.textFrame.setText(body + source);
}
function label(slide, value, x, y, w, color = C.blue) {
  text(slide, value.toUpperCase(), x, y, w, 24, 12, color, { bold: true });
}
function metric(slide, value, caption, x, y, w, accent = C.turquoise, size = 42) {
  text(slide, value, x, y, w, 58, size, accent, { bold: true });
  text(slide, caption, x, y + 52, w, 42, 16, C.slate);
}
function arrow(slide, x1, y1, x2, y2, color = C.turquoise, width = 3) {
  addLine(slide, x1, y1, x2 - x1, y2 - y1, color, width);
  shape(slide, "triangle", x2 - 8, y2 - 6, 14, 12, color);
}
function flatBlock(slide, titleValue, body, x, y, w, h, accent = C.turquoise, fill = C.pale) {
  shape(slide, "roundRect", x, y, w, h, fill, "none", 0);
  shape(slide, "rect", x, y, 7, h, accent);
  text(slide, titleValue, x + 22, y + 12, w - 36, 30, 18, C.navy, { bold: true });
  text(slide, body, x + 22, y + 44, w - 36, h - 54, 15, C.slate, { valign: "top" });
}
function styleChart(chart) {
  applyPresentationChartFont(chart, { fontFamily: FONT });
}
function nativeTable(slide, values, x, y, w, h, widths, fontSize = 14) {
  const table = slide.tables.add({ rows: values.length, columns: values[0].length, left: x, top: y, width: w, height: h, values, columnWidths: widths });
  table.borders.assign({ style: "solid", fill: C.light, width: 1 });
  table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: values[0].length }).assign({
    fill: C.navy,
    textStyle: { typeface: FONT, color: C.white, fontSize, bold: true },
    anchor: "middle",
  });
  if (values.length > 1) {
    table.cells.block({ row: 1, column: 0, rowCount: values.length - 1, columnCount: values[0].length }).assign({
      textStyle: { typeface: FONT, color: C.ink, fontSize },
      anchor: "middle",
      margins: { left: 7, right: 7, top: 4, bottom: 4 },
    });
  }
  for (let r = 1; r < values.length; r += 2) {
    table.cells.block({ row: r, column: 0, rowCount: 1, columnCount: values[0].length }).fill = C.pale;
  }
  return table;
}

// 1 — Cover
{
  const slide = pres.slides.add();
  slide.background.fill = C.navy;
  await photo(slide, ASSETS.lab, 690, 0, 590, 720, "cover", null, "AUT Food Science laboratory");
  shape(slide, "rect", 625, 0, 160, 720, C.navy);
  shape(slide, "rect", 640, 0, 10, 720, C.turquoise);
  label(slide, "Engineering internship defense", 70, 70, 480, C.turquoise);
  text(slide, "Protein Enrichment\nof an Oat-Based Beverage", 70, 116, 545, 170, 46, C.white, { bold: true, valign: "top" });
  text(slide, "Engineering Internship at Auckland University of Technology", 70, 305, 520, 70, 21, "#D9EAF1", { valign: "top" });
  text(slide, "Kali Mana", 70, 420, 300, 38, 24, C.white, { bold: true });
  text(slide, "Food Engineering, ESIROI\nAuckland, New Zealand\nApril – August 2026", 70, 462, 420, 92, 17, "#D9EAF1", { valign: "top" });
  await photo(slide, ASSETS.esiroi, 70, 618, 155, 54, "contain", null, "ESIROI logo");
  await photo(slide, ASSETS.ur, 250, 618, 190, 54, "contain", null, "Université de La Réunion logo");
  await photo(slide, ASSETS.aut, 475, 610, 120, 66, "contain", null, "AUT logo");
  notes(slide, "Good morning. My name is Kali Mana, and I completed this engineering internship at Auckland University of Technology from 24 April to 24 August 2026. The internship began with a virtual-reality research project and then moved to food formulation. Today I will focus mainly on the development of a protein-enriched oat-based beverage, from process design and protein incorporation to analytical characterisation and sensory evaluation.", "cover page and pp. 1–3");
}

// 2 — Overview
{
  const slide = baseSlide("Presentation overview", "Introduction");
  const items = [
    ["01", "AUT and internship context", C.blue],
    ["02", "From virtual reality to oat beverage development", C.turquoise],
    ["03", "Protein-enriched oat beverage project", C.green],
    ["04", "Results, recommendations and professional outcomes", C.oat],
  ];
  items.forEach(([n, v, color], i) => {
    const x = 70 + i * 298;
    text(slide, n, x, 190, 100, 70, 44, color, { bold: true });
    addLine(slide, x, 270, 250, 1, color, 4);
    text(slide, v, x, 294, 250, 112, 20, C.ink, { bold: true, valign: "top" });
    if (i < 3) arrow(slide, x + 250, 260, x + 282, 260, C.light, 2);
  });
  text(slide, "The oat beverage project forms the core of this defense.", 70, 520, 1140, 64, 25, C.navy, { bold: true, align: "center", fill: C.oatLight });
  footer(slide, 2);
  notes(slide, "I will begin by presenting the host environment and the overall trajectory of the internship. I will then explain why the initial virtual-reality project could not continue under reliable conditions. The main part of the presentation covers the oat beverage process, protein enrichment, Kjeldahl analysis and sensory evaluation. I will finish with the selected development candidate, the limitations of the study and the professional skills I developed.", "pp. 1–4");
}

// 3 — AUT environment
{
  const slide = baseSlide("Internship environment: Auckland University of Technology", "Context");
  await photo(slide, ASSETS.nzMap, 60, 145, 300, 470, "contain", null, "Stylised map of New Zealand with Auckland marker");
  text(slide, "NEW ZEALAND", 86, 598, 250, 28, 14, C.grey, { bold: true, align: "center" });
  arrow(slide, 375, 380, 440, 380, C.turquoise, 3);
  await photo(slide, ASSETS.lab, 455, 165, 430, 300, "cover", "rounded-2xl", "AUT Food Science laboratory");
  metric(slide, "AUT", "School of Science", 925, 170, 240, C.blue, 50);
  text(slide, "Food Science and Microbiology\nCity Campus, Auckland\nSupervised by Dr Nazimah Hamid", 925, 285, 250, 115, 18, C.ink, { valign: "top" });
  flatBlock(slide, "Experimental setting", "Food processing, rheology, centrifugation, freeze-drying, Kjeldahl analysis and sensory preparation within AUT Food Science facilities.", 455, 500, 720, 120, C.turquoise, C.pale);
  footer(slide, 3);
  notes(slide, "The placement took place in Auckland, New Zealand, within AUT’s School of Science. I worked in the Food Science and Microbiology environment at the City Campus under the supervision of Dr Nazimah Hamid. The facilities gave me access to food processing equipment and analytical methods that were new to me. I also had to learn how to organise work around shared laboratory equipment and AUT procedures, which became important when the project changed direction.", "pp. 1–2");
}

// 4 — Timeline
{
  const slide = baseSlide("One internship, two successive projects", "Trajectory");
  text(slide, "24 APRIL", 75, 160, 150, 28, 14, C.grey, { bold: true });
  text(slide, "24 AUGUST", 1050, 160, 150, 28, 14, C.grey, { bold: true, align: "right" });
  addLine(slide, 95, 220, 1080, 1, C.light, 6);
  shape(slide, "ellipse", 190, 207, 26, 26, C.blue);
  shape(slide, "ellipse", 610, 203, 34, 34, C.turquoise);
  shape(slide, "ellipse", 1080, 207, 26, 26, C.green);
  flatBlock(slide, "Phase 1 · April to mid-June", "Virtual Reality and Eating Behaviour\n\nUnity familiarisation\nPrevious project review\nHeadset testing\nFeasibility assessment", 80, 275, 390, 250, C.blue, "#EEF5F9");
  text(slide, "PROJECT REDIRECTION", 500, 320, 180, 66, 16, C.turquoise, { bold: true, align: "center" });
  arrow(slide, 505, 420, 675, 420, C.turquoise, 4);
  flatBlock(slide, "Phase 2 · Late June to 24 August", "Protein-enriched oat beverage\n\nProcess trials and formulation screening\nRheology and Kjeldahl analysis\nSensory test and candidate selection", 700, 250, 490, 300, C.green, C.oatLight);
  text(slide, "Phase 2 became the main experimental project.", 700, 575, 490, 42, 20, C.navy, { bold: true, align: "center" });
  footer(slide, 4);
  notes(slide, "The internship had two distinct phases. From April to mid-June, I prepared the virtual-reality project by reviewing previous work, learning Unity and testing the available headsets. In mid-June, the technical feasibility review showed that the planned protocol could not be implemented reliably. The internship then shifted to an existing oat beverage project. From late June until 24 August, I carried out the main experimental work presented here, including formulation trials, rheology, Kjeldahl analysis and sensory testing.", "pp. 2–3");
}

// 5 — Why change
{
  const slide = baseSlide("Why the original project changed", "Engineering decision");
  await photo(slide, ASSETS.vr1, 70, 160, 210, 165, "cover", "rounded-xl", "Virtual-reality headset assessed during the internship");
  text(slide, "Initial VR study", 70, 338, 210, 32, 20, C.navy, { bold: true, align: "center" });
  arrow(slide, 295, 245, 355, 245, C.turquoise, 3);
  flatBlock(slide, "Technical constraints", "Access delayed by about six weeks\nHigh-resolution headset incompatible with the system\nCustom Unity player unavailable\nOlder headset provided insufficient image quality\nICT troubleshooting could not restore the setup in time", 370, 150, 430, 250, C.blue, C.pale);
  arrow(slide, 815, 275, 875, 275, C.turquoise, 3);
  flatBlock(slide, "Scientific consequence", "Experimental reliability and reproducibility could not be guaranteed. No participants were recruited and no usable VR dataset was produced.", 890, 190, 300, 170, C.red, "#FBF1F1");
  arrow(slide, 640, 420, 640, 475, C.green, 4);
  text(slide, "ENGINEERING DECISION", 475, 475, 330, 30, 14, C.green, { bold: true, align: "center" });
  text(slide, "Redirect the internship toward an experimentally feasible oat beverage project", 280, 520, 720, 60, 26, C.navy, { bold: true, align: "center", fill: C.oatLight });
  text(slide, "The change preserved experimental reliability and allowed usable results within the remaining time.", 245, 596, 790, 44, 17, C.slate, { align: "center" });
  footer(slide, 5);
  notes(slide, "This change was an engineering decision rather than a failure. Access to the VR room was delayed by around one and a half months. When I could finally test the system, the higher-resolution headset was incompatible with the available computer, the previous Unity player was no longer accessible and the older Oculus headset did not provide sufficient image quality. Continuing would have produced a protocol that differed from the intended study and could not guarantee reliable data. We therefore redirected the project before recruiting participants.", "pp. 2–3");
}

// 6 — Challenge
{
  const slide = baseSlide("Protein enrichment as a formulation challenge", "Problem statement");
  text(slide, "How can the protein content be increased while acceptable sensory properties are maintained?", 145, 150, 990, 80, 30, C.navy, { bold: true, align: "center" });
  shape(slide, "ellipse", 520, 265, 240, 240, C.oatLight, C.oat, 3);
  text(slide, "2.39", 555, 302, 170, 65, 52, C.navy, { bold: true, align: "center" });
  text(slide, "g protein / 100 mL\nselected base", 555, 365, 170, 55, 15, C.slate, { align: "center" });
  text(slide, "≈4.85%", 555, 424, 170, 48, 31, C.turquoise, { bold: true, align: "center" });
  flatBlock(slide, "Nutritional objective", "Increase plant protein using soy, rice and pea powders while keeping the formulations comparable.", 80, 280, 350, 150, C.green, "#EFF5EF");
  flatBlock(slide, "Formulation risks", "Poor dispersion and lumps\nHigher viscosity\nPowdery or gritty mouthfeel\nBitterness and flavour changes", 850, 260, 350, 190, C.red, "#FBF1F1");
  text(slide, "The target must balance composition, process feasibility and sensory acceptance.", 210, 555, 860, 56, 23, C.ink, { bold: true, align: "center" });
  footer(slide, 6);
  notes(slide, "The new project involved more than adding a calculated mass of protein. Commercial plant protein powders can change dispersion, viscosity, flavour and mouthfeel. The selected oat beverage base later measured 2.39 grams of protein per 100 millilitres. The final enriched samples were estimated at approximately 4.85 percent protein. The engineering challenge was therefore to increase protein while controlling lumps, thickening, bitterness and particle-related sensations. This balance guided every stage of the experimental strategy.", "pp. 3–4 and 16–18");
}

// 7 — Experimental strategy
{
  const slide = baseSlide("Experimental strategy", "Project logic");
  const steps = [
    ["01", "Oat beverage\nproduction"],
    ["02", "Preliminary\nprotein trials"],
    ["03", "pH and rheology\nscreening"],
    ["04", "Kjeldahl\nanalysis"],
    ["05", "Protein basis\ncorrection"],
    ["06", "Final\nformulations"],
    ["07", "Sensory\nevaluation"],
    ["08", "Candidate\nselection"],
  ];
  steps.forEach(([n, v], i) => {
    const x = 55 + i * 151;
    shape(slide, "ellipse", x, 230, 72, 72, i < 3 ? C.blue : i < 6 ? C.turquoise : C.green);
    text(slide, n, x, 230, 72, 72, 22, C.white, { bold: true, align: "center" });
    text(slide, v, x - 28, 320, 128, 72, 16, C.ink, { bold: true, align: "center", valign: "top" });
    if (i < 7) arrow(slide, x + 78, 266, x + 140, 266, C.light, 3);
  });
  flatBlock(slide, "Sequential decision logic", "Each stage reduced uncertainty before the next formulation decision. Preliminary nominal protein levels were interpreted separately from the corrected final protein estimates.", 190, 480, 900, 110, C.turquoise, C.pale);
  footer(slide, 7);
  notes(slide, "The work followed a sequential strategy. I first established a workable oat beverage process and explored how the protein powders behaved. pH and rheology screening identified the main formulation constraints. I then used Kjeldahl analysis to replace the approximate one-percent protein assumption with an experimental value for the selected base. Using this corrected basis, I recalculated the final formulations, conducted a sensory evaluation and selected the strongest enriched candidate. This sequence helped separate early screening assumptions from the final interpretation.", "pp. 4–12");
}

// 8 — Process
{
  const slide = baseSlide("Oat beverage process", "Processing");
  await photo(slide, ASSETS.trays, 65, 160, 245, 190, "cover", "rounded-xl", "Shallow trays during oat beverage heating");
  await photo(slide, ASSETS.processFigure, 330, 160, 245, 190, "contain", "rounded-xl", "Oat beverage process overview from the internship report");
  await photo(slide, ASSETS.storage, 595, 160, 245, 190, "cover", "rounded-xl", "Refrigerated storage of prepared samples");
  metric(slide, "600 g + 3 L", "rolled oats + water", 880, 170, 300, C.navy, 35);
  text(slide, "BAN 528 µL\nAMG 198 µL", 880, 270, 260, 65, 19, C.turquoise, { bold: true });
  const ops = ["Mix", "Enzymatic\nhydrolysis", "Empirical final\nheating", "Hot\nfiltration", "Rapid\ncooling", "Functional\nformulation", "Protein\nenrichment"];
  ops.forEach((op, i) => {
    const x = 60 + i * 168;
    shape(slide, "roundRect", x, 430, 135, 74, i === 2 ? C.oatLight : C.pale, i === 2 ? C.oat : C.light, 1.5);
    text(slide, op, x + 8, 438, 119, 58, 15, C.ink, { bold: true, align: "center" });
    if (i < ops.length - 1) arrow(slide, x + 140, 467, x + 160, 467, C.turquoise, 2);
  });
  text(slide, "67 °C oven setpoint for 90 min", 200, 530, 350, 38, 18, C.blue, { bold: true, align: "center" });
  text(slide, "Final heating: oven set to 200 °C, stopped at visible boiling. Product temperature was not measured.", 580, 525, 610, 54, 17, C.red, { bold: true, align: "center", fill: "#FBF1F1" });
  text(slide, "≈2.5 L filtered beverage recovered", 420, 602, 440, 34, 19, C.green, { bold: true, align: "center" });
  footer(slide, 8);
  notes(slide, "The selected base used 600 grams of oats and 3 litres of water with BAN and AMG enzymes. The trays remained in an oven set to 67 degrees Celsius for 90 minutes to approach the intended hydrolysis conditions. A short empirical final heating step followed, with the oven set to 200 degrees and the process stopped after visible boiling as the display approached 180 degrees. This does not mean the beverage reached 180 degrees. Product temperature was not measured, so this was not a validated pasteurisation schedule.", "pp. 5–6");
}

// 9 — Functional formulation
{
  const slide = baseSlide("From selected base to functional beverage", "Formulation");
  await photo(slide, ASSETS.caramel, 70, 170, 350, 290, "cover", "rounded-2xl", "Coconut caramel preparation");
  shape(slide, "ellipse", 535, 230, 220, 220, C.oatLight, C.oat, 3);
  text(slide, "≈2.5 L", 560, 272, 170, 52, 42, C.navy, { bold: true, align: "center" });
  text(slide, "selected oat-beverage base", 560, 330, 170, 60, 17, C.slate, { align: "center" });
  const ingredients = [
    ["Coconut caramel", "375 g", 850, 165, C.oat],
    ["Tulsi extract", "50 mL", 950, 275, C.green],
    ["Xanthan gum", "3.25 g", 865, 390, C.blue],
    ["Salt", "5.00 g", 735, 500, C.turquoise],
  ];
  ingredients.forEach(([name, amount, x, y, color]) => {
    shape(slide, "ellipse", x, y, 105, 105, color);
    text(slide, amount, x + 8, y + 22, 89, 30, 19, C.white, { bold: true, align: "center" });
    text(slide, name, x - 20, y + 108, 145, 42, 14, C.ink, { bold: true, align: "center" });
  });
  arrow(slide, 425, 315, 520, 315, C.turquoise, 4);
  arrow(slide, 760, 340, 835, 340, C.turquoise, 4);
  text(slide, "Protein powders were added after the common functional base had been prepared.", 145, 590, 980, 44, 22, C.navy, { bold: true, align: "center", fill: C.pale });
  footer(slide, 9);
  notes(slide, "After filtration and cooling, the selected oat beverage became a common functional base. For approximately 2.5 litres, the formulation included coconut caramel, Tulsi extract, xanthan gum and salt. The protein powders were not added during enzymatic hydrolysis. They were incorporated only after the common functional beverage had been prepared. This order meant that the final sensory samples shared the same base and differed mainly in the source and quantity of the protein powders.", "pp. 6–7");
}

// 10 — Dispersion
{
  const slide = baseSlide("Protein incorporation: trial and error", "Formulation");
  await photo(slide, ASSETS.ultraturrax, 60, 160, 240, 240, "cover", "rounded-xl", "IKA T25 Ultra-Turrax");
  flatBlock(slide, "Ultra-Turrax", "High shear was useful for small-volume trials, but persistent lumps and powdery sensations remained. The available head was poorly suited to large batches.", 60, 420, 240, 150, C.blue, C.pale);
  await photo(slide, ASSETS.powders, 350, 160, 240, 240, "cover", "rounded-xl", "Protein powder preparation");
  flatBlock(slide, "Sonication", "Considered and tested during preliminary work. Undesirable flavour changes and persistent agglomerates prevented selection.", 350, 420, 240, 150, C.red, "#FBF1F1");
  shape(slide, "roundRect", 660, 150, 550, 420, C.oatLight, C.oat, 2);
  label(slide, "Selected practical method", 700, 180, 460, C.green);
  text(slide, "Mortar + sieve", 700, 216, 460, 48, 32, C.navy, { bold: true });
  const flow = ["1  Powder + small\nbeverage volume", "2  Paste\nformation", "3  Progressive\ndispersion", "4  Sieve and crush\nagglomerates", "5  Reincorporate\ninto full beverage"];
  flow.forEach((v, i) => {
    const x = 688 + (i % 3) * 165;
    const y = i < 3 ? 300 : 430;
    shape(slide, "roundRect", x, y, 140, 72, C.white, C.oat, 1);
    text(slide, v, x + 7, y + 8, 126, 56, 14, C.ink, { bold: true, align: "center" });
    if (i === 0 || i === 1) arrow(slide, x + 143, y + 36, x + 160, y + 36, C.green, 2);
    if (i === 3) arrow(slide, x + 143, y + 36, x + 160, y + 36, C.green, 2);
  });
  text(slide, "The most sophisticated equipment was not the most effective option under the available conditions.", 190, 608, 900, 38, 20, C.navy, { bold: true, align: "center" });
  footer(slide, 10);
  notes(slide, "Direct powder addition produced strong agglomeration, so I compared several dispersion approaches. The Ultra-Turrax provided high shear for small volumes but did not remove the powdery sensation or lumps sufficiently, and the small head was not adapted to the full batch size. Sonication also produced undesirable changes and was not retained. The most practical method was to form a concentrated paste in a mortar, add beverage progressively, pass the dispersion through a sieve and crush the remaining agglomerates before reincorporation.", "pp. 7 and 15");
}

// 11 — Screening
{
  const slide = baseSlide("Preliminary screening changed the formulation strategy", "Screening");
  const chart = slide.charts.add("bar", {
    position: { left: 70, top: 160, width: 620, height: 350 },
    categories: ["Control", "2% nominal", "4% nominal", "6% nominal"],
    series: [{ name: "Apparent viscosity", values: [30.0, 36.3, 61.0, 136.6], fill: C.blue, points: [{ idx: 3, fill: C.turquoise }] }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 55 },
    hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.slate }, line: { fill: C.light, width: 1 } },
    yAxis: { min: 0, max: 150, majorUnit: 50, title: "Apparent viscosity at ≈100 s⁻¹ (mPa·s)", textStyle: { typeface: FONT, fontSize: 12, fill: C.slate }, majorGridlines: { fill: C.light, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 13, fill: C.ink, bold: true } },
  });
  styleChart(chart);
  label(slide, "Soy protein screening", 95, 175, 300, C.blue);
  flatBlock(slide, "Viscosity", "Soy addition increased apparent viscosity from 30.0 to 136.6 mPa·s across the nominal screening range.", 750, 165, 420, 110, C.blue, C.pale);
  flatBlock(slide, "Thermal sensitivity", "The nominal 4% rice pilot increased from ≈11.6 to 86.1 mPa·s after exploratory heating.", 750, 300, 420, 110, C.oat, C.oatLight);
  flatBlock(slide, "Practical observations", "High additions produced lumps, powderiness, bitterness and an excessively thick or yoghurt-like texture.", 750, 435, 420, 110, C.red, "#FBF1F1");
  text(slide, "Decision: compare blends at a lower common enrichment target", 190, 585, 900, 50, 24, C.white, { bold: true, align: "center", fill: C.green });
  footer(slide, 11);
  notes(slide, "The preliminary trials identified the conditions that would not be suitable for the final sensory test. In the soy series, apparent viscosity at around 100 inverse seconds increased from 30.0 millipascal-seconds for the control to 136.6 at the nominal six-percent level. A separate rice pilot became much thicker after heating. Practical observations also showed lumps, powderiness, bitterness and, at high soy additions, a yoghurt-like texture. These results supported the decision to test blends at a lower common enrichment target.", "pp. 13–15");
}

// 12 — Kjeldahl
{
  const slide = baseSlide("Kjeldahl analysis corrected the protein basis", "Analytical characterisation");
  await photo(slide, ASSETS.freezeDry, 60, 170, 210, 180, "cover", "rounded-xl", "Freeze-dried oat beverage samples");
  await photo(slide, ASSETS.digestion, 290, 170, 210, 180, "cover", "rounded-xl", "Kjeldahl digestion rack");
  await photo(slide, ASSETS.distillation, 520, 170, 210, 180, "cover", "rounded-xl", "Kjeldahl distillation and titration setup");
  const stages = ["Freeze-dry", "Digest", "Distil", "Titrate", "Calculate N", "Convert to protein"];
  stages.forEach((v, i) => {
    const x = 55 + i * 120;
    text(slide, v, x, 380, 105, 32, 14, i < 4 ? C.blue : C.green, { bold: true, align: "center" });
    if (i < stages.length - 1) arrow(slide, x + 105, 396, x + 118, 396, C.light, 2);
  });
  shape(slide, "roundRect", 790, 155, 420, 330, C.navy);
  text(slide, "2.39 ± 0.17", 825, 210, 350, 75, 50, C.white, { bold: true, align: "center" });
  text(slide, "g protein / 100 mL", 825, 285, 350, 40, 22, "#BDEBF0", { bold: true, align: "center" });
  text(slide, "Selected oat-beverage base\nn = 3 analytical replicates", 825, 345, 350, 70, 18, C.white, { align: "center" });
  text(slide, "≈1.000 g dry sample, CuSO₄ + K₂SO₄ + H₂SO₄, 0.100 mol/L HCl, factor 5.83", 100, 505, 1080, 42, 16, C.slate, { align: "center" });
  text(slide, "This measured result replaced the previous 1% working assumption.", 225, 575, 830, 48, 23, C.navy, { bold: true, align: "center", fill: C.oatLight });
  footer(slide, 12);
  notes(slide, "The preliminary calculations assumed that the base contained about one percent protein. I performed Kjeldahl analysis to establish an experimental value. Freeze-dried samples were digested, distilled and titrated with 0.100 molar hydrochloric acid. Total nitrogen was converted using the oat-specific factor of 5.83. The selected batch contained 2.39 plus or minus 0.17 grams of protein per 100 millilitres. The three values represent analytical replicates from one homogenised batch, not independent production batches.", "pp. 9–10 and 16");
}

// 13 — Final formulations
{
  const slide = baseSlide("Final protein formulations", "Formulation design");
  text(slide, "All enriched samples were designed for a closely matched theoretical protein level.", 125, 145, 1030, 42, 23, C.navy, { bold: true, align: "center" });
  const samples = [
    ["156", "Pea / Rice\n50:50", 4.85, C.green],
    ["235", "Pea / Soy\n50:50", 4.85, C.blue],
    ["320", "Soy / Rice\n50:50", 4.85, C.blue],
    ["473", "Rice\n100%", 4.85, C.oat],
    ["589", "Soy\n100%", 4.85, C.blue],
    ["667", "Control", 2.39, C.navy],
    ["798", "Soy / Rice / Pea\n40:30:30", 4.85, C.turquoise],
  ];
  samples.forEach(([code, blend, protein, color], i) => {
    const x = 60 + i * 170;
    shape(slide, "roundRect", x + 30, 250, 95, 185, "#FDFBF7", color, 3);
    shape(slide, "rect", x + 34, 350, 87, 80, color);
    text(slide, code, x, 205, 155, 36, 20, color, { bold: true, align: "center" });
    text(slide, blend, x, 452, 155, 58, 14, C.ink, { bold: true, align: "center", valign: "top" });
    text(slide, `${protein.toFixed(2)}%`, x, 522, 155, 34, 18, color, { bold: true, align: "center" });
  });
  text(slide, "Calculated estimates based on measured base protein, added powder mass and declared powder protein content.", 110, 585, 1060, 36, 16, C.slate, { align: "center" });
  text(slide, "Soy 90%, rice 80%, pea 80%. Enriched products were not directly reanalysed by Kjeldahl.", 170, 625, 940, 30, 14, C.red, { bold: true, align: "center" });
  footer(slide, 13);
  notes(slide, "The final comparison included six enriched formulations and one control. Each enriched sample was calculated to contain approximately 4.85 percent protein, while the control remained at 2.39 percent. Keeping the estimated protein level similar allowed the sensory comparison to focus mainly on protein source and blend. These enriched values are theoretical estimates. They combine the measured protein in the base, the powder mass and the manufacturer declarations of 90 percent for soy and 80 percent for rice and pea. The enriched beverages were not directly reanalysed by Kjeldahl.", "pp. 10–11 and 17");
}

// 14 — Sensory design
{
  const slide = baseSlide("Sensory test design", "Sensory evaluation");
  metric(slide, "25", "participants", 70, 160, 180, C.navy, 48);
  metric(slide, "7", "coded samples", 270, 160, 180, C.blue, 48);
  metric(slide, "10 mL", "per sample, served cold", 470, 160, 220, C.turquoise, 42);
  metric(slide, "24 Aug", "AUT Food Lab", 730, 160, 220, C.green, 42);
  text(slide, "Randomised order in Qualtrics", 990, 175, 220, 62, 19, C.navy, { bold: true, align: "center", fill: C.oatLight });
  const journey = ["Receive coded sample", "Taste", "Rate in Qualtrics", "Rinse with water", "Next sample"];
  journey.forEach((v, i) => {
    const x = 65 + i * 240;
    shape(slide, "ellipse", x + 70, 335, 54, 54, i === 2 ? C.turquoise : C.blue);
    text(slide, String(i + 1), x + 70, 335, 54, 54, 18, C.white, { bold: true, align: "center" });
    text(slide, v, x, 405, 195, 44, 16, C.ink, { bold: true, align: "center" });
    if (i < 4) arrow(slide, x + 196, 362, x + 232, 362, C.light, 3);
  });
  text(slide, "Overall liking, colour, taste, flavour, consistency and mouthfeel", 125, 510, 1030, 34, 18, C.blue, { bold: true, align: "center" });
  text(slide, "JAR, CATA, purchase intention and final preference", 250, 555, 780, 34, 18, C.green, { bold: true, align: "center" });
  text(slide, "Protein dispersions rested for at least 30 min and were agitated before pouring.", 180, 610, 920, 32, 15, C.slate, { align: "center" });
  footer(slide, 14);
  notes(slide, "The exploratory sensory test took place on 24 August in the AUT Food Lab with 25 convenience participants. Every participant evaluated all seven coded formulations, served cold in 10-millilitre portions. Qualtrics randomised the sample order for each participant. The questionnaire combined overall liking and other hedonic attributes with just-about-right scales, check-all-that-apply descriptors, purchase intention and final preference. The enriched dispersions rested for at least 30 minutes and were agitated immediately before pouring to limit sedimentation effects.", "pp. 11–12");
}

// 15 — Main sensory results
{
  const slide = baseSlide("Overall liking identified candidate 798", "Results");
  const chart = slide.charts.add("bar", {
    position: { left: 60, top: 160, width: 760, height: 430 },
    categories: ["320\nSoy/Rice", "473\nRice", "589\nSoy", "667\nControl", "798\nS/R/P"],
    series: [{
      name: "Mean overall liking",
      values: [5.56, 6.27, 6.09, 7.04, 6.56],
      fill: C.grey,
      points: [
        { idx: 0, fill: C.grey }, { idx: 1, fill: C.green }, { idx: 2, fill: C.blue },
        { idx: 3, fill: C.navy }, { idx: 4, fill: C.turquoise },
      ],
    }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
    hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.slate }, line: { fill: C.light, width: 1 } },
    yAxis: { min: 0, max: 9, majorUnit: 1, title: "Overall liking (1–9)", textStyle: { typeface: FONT, fontSize: 12, fill: C.slate }, majorGridlines: { fill: C.light, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 14, fill: C.ink, bold: true } },
  });
  styleChart(chart);
  metric(slide, "7.04 / 9", "Control 667 · highest mean", 860, 170, 330, C.navy, 38);
  metric(slide, "6.56 / 9", "798 · best enriched mean", 860, 285, 330, C.turquoise, 38);
  text(slide, "40% soy / 30% rice / 30% pea", 860, 380, 330, 40, 17, C.ink, { bold: true });
  flatBlock(slide, "Overall formulation effect", "Friedman χ²(6) = 27.56\np < 0.001\nKendall's W = 0.184", 850, 445, 340, 120, C.blue, C.pale);
  text(slide, "Control vs 798: Holm-adjusted p = 0.104", 850, 585, 340, 44, 17, C.white, { bold: true, align: "center", fill: C.turquoise });
  footer(slide, 15);
  notes(slide, "Overall liking differed across the seven formulations. The Friedman test gave chi-squared 27.56 with p below 0.001, although Kendall’s W of 0.184 indicates a modest effect size. The control achieved the highest mean score at 7.04 out of 9. Candidate 798, containing 40 percent soy, 30 percent rice and 30 percent pea protein, was the best enriched formulation at 6.56. In the planned comparison, no significant difference was detected between the control and 798 after Holm adjustment, with p equal to 0.104. This does not establish equivalence.", "pp. 17–18");
}

// 16 — Why selected
{
  const slide = baseSlide("Why formulation 798 was selected", "Candidate selection");
  shape(slide, "ellipse", 470, 205, 340, 340, C.navy);
  text(slide, "798", 540, 260, 200, 70, 52, C.white, { bold: true, align: "center" });
  text(slide, "Selected development\ncandidate", 530, 335, 220, 70, 20, "#BDEBF0", { bold: true, align: "center" });
  text(slide, "40% soy\n30% rice\n30% pea", 550, 420, 180, 90, 17, C.white, { align: "center" });
  flatBlock(slide, "Overall liking", "6.56 / 9\nHighest mean among enriched formulations", 60, 175, 330, 120, C.turquoise, C.pale);
  flatBlock(slide, "Planned comparison", "No significant difference detected versus control\npHolm = 0.104", 60, 340, 330, 120, C.blue, C.pale);
  flatBlock(slide, "Balanced JAR profile", "Sweetness 84% · bitterness 60%\nFlavour intensity 88%\nCreaminess 84% · thickness 80%", 890, 175, 330, 150, C.green, "#EFF5EF");
  flatBlock(slide, "Descriptors", "Relatively low beany/soy-like perception and the lowest gritty/sandy frequency among enriched samples.", 890, 365, 330, 120, C.oat, C.oatLight);
  text(slide, "MAIN LIMITATION", 140, 535, 240, 24, 13, C.red, { bold: true, align: "center" });
  text(slide, "Powdery / chalky and gritty / sandy mouthfeel", 210, 565, 860, 50, 25, C.red, { bold: true, align: "center", fill: "#FBF1F1" });
  text(slide, "A promising candidate for development, not a validated commercial product.", 280, 625, 720, 30, 15, C.slate, { align: "center" });
  footer(slide, 16);
  notes(slide, "Formulation 798 was selected using several criteria rather than overall liking alone. It achieved the highest mean liking among the enriched samples, and the planned comparison with the control did not detect a significant difference. Its JAR profile was relatively balanced for sweetness, flavour intensity, creaminess and thickness. It also showed relatively low beany perception and the lowest gritty frequency among enriched products. However, particle-related mouthfeel remained the main limitation. For that reason, 798 is a development candidate, not a validated final product.", "p. 18");
}

// 17 — Roadmap
{
  const slide = baseSlide("Limitations translated into a development roadmap", "Next steps");
  const roadmap = [
    ["01", "Protein dispersion", "Prehydration, addition order, finer sieving, suitable homogenisation and particle-size measurement"],
    ["02", "Thermal validation", "Direct product-temperature monitoring with calibrated probes and data logging"],
    ["03", "Composition", "Direct protein analysis of the final enriched beverage"],
    ["04", "Repeatability", "At least three independent control and 798 batches; yield, pH, rheology, particle size and sedimentation"],
    ["05", "Food safety", "Microbiological analysis and shelf-life testing; pH alone is insufficient"],
    ["06", "Sensory confirmation", "A larger and more representative consumer panel"],
  ];
  roadmap.forEach(([n, titleValue, body], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 65 + col * 600;
    const y = 155 + row * 145;
    text(slide, n, x, y, 70, 70, 33, i < 2 ? C.blue : i < 4 ? C.turquoise : C.green, { bold: true, align: "center" });
    text(slide, titleValue, x + 90, y, 430, 30, 19, C.navy, { bold: true });
    text(slide, body, x + 90, y + 35, 430, 65, 14, C.slate, { valign: "top" });
    addLine(slide, x + 90, y + 108, 430, 1, C.light, 1);
  });
  text(slide, "Proposed next experiment", 80, 590, 220, 36, 15, C.white, { bold: true, align: "center", fill: C.navy });
  text(slide, "Control vs 798, replicated production, thermal monitoring, rheology, particle size, Kjeldahl and sensory confirmation", 320, 590, 870, 44, 17, C.navy, { bold: true, align: "center", fill: C.oatLight });
  footer(slide, 17);
  notes(slide, "Each limitation points to a specific next experiment. Protein dispersion should be improved through controlled hydration, a better addition sequence, finer separation and more suitable homogenisation. The thermal process requires direct product-temperature monitoring. The enriched beverage should be analysed directly for protein. Manufacturing repeatability should be tested with at least three independent control and 798 batches. Microbiological and shelf-life work is essential because pH alone cannot demonstrate safety. Finally, a larger consumer panel should confirm whether the sensory pattern remains stable.", "pp. 19–20");
}

// 18 — Outcomes and conclusion
{
  const slide = pres.slides.add();
  slide.background.fill = C.navy;
  await photo(slide, ASSETS.rheometer2, 860, 0, 420, 720, "cover", null, "Rheology work during the internship");
  shape(slide, "rect", 800, 0, 120, 720, C.navy);
  shape(slide, "rect", 815, 0, 8, 720, C.turquoise);
  label(slide, "Professional outcomes and conclusion", 60, 48, 620, C.turquoise);
  text(slide, "Engineering is also knowing when an experimental plan must change.", 60, 90, 680, 82, 32, C.white, { bold: true, valign: "top" });
  const conclusions = [
    ["ADAPTATION", "The VR study was redirected when experimental reliability could not be guaranteed."],
    ["ANALYTICAL RESULT", "Selected base: 2.39 ± 0.17 g protein / 100 mL."],
    ["DEVELOPMENT RESULT", "Theoretical enriched level ≈4.85%; 798 was the strongest enriched candidate, with powdery and gritty mouthfeel still unresolved."],
  ];
  conclusions.forEach(([k, v], i) => {
    const y = 210 + i * 102;
    text(slide, k, 60, y, 190, 25, 12, i === 2 ? C.oat : C.turquoise, { bold: true });
    text(slide, v, 250, y - 2, 500, 70, 17, C.white, { valign: "top" });
  });
  text(slide, "Technical", 60, 535, 170, 28, 16, C.turquoise, { bold: true });
  text(slide, "Processing, formulation, rheology, Kjeldahl and sensory preparation", 60, 568, 690, 28, 14, "#D9EAF1");
  text(slide, "Professional", 60, 610, 170, 28, 16, C.oat, { bold: true });
  text(slide, "Working in English, troubleshooting, autonomy, traceability and project redirection", 60, 643, 690, 30, 14, "#D9EAF1");
  text(slide, "Thank you\nQuestions?", 900, 520, 300, 100, 36, C.white, { bold: true, align: "center" });
  footer(slide, 18);
  notes(slide, "This internship developed both technical and professional skills. I gained practical experience in oat processing, enzyme-assisted production, plant protein formulation, rheology, freeze-drying, Kjeldahl analysis and sensory preparation. I also improved my data traceability, Qualtrics work and interpretation of non-parametric statistics. The main lesson was that engineering includes recognising when a plan can no longer produce reliable evidence and changing direction responsibly. The project established a measured base protein value and identified 798 as the strongest enriched candidate, while clearly defining the dispersion work still required. Thank you for listening. I am ready for your questions.", "pp. 19–20");
}

// 19 — Backup: detailed process
{
  const slide = baseSlide("Detailed oat beverage process", "", true);
  const values = [
    ["Stage", "Inputs / conditions", "Key control point"],
    ["Base", "600 g oats + 3.0 L water", "Hand mixing; shallow trays"],
    ["Enzymes", "BAN 528 µL + AMG 198 µL", "Scaled to batch size"],
    ["Hydrolysis", "Oven set to 67 °C for 90 min", "Product temperature not continuously measured"],
    ["Final heating", "Oven set to 200 °C, then stop at visible boiling", "Empirical inactivation step, not validated pasteurisation"],
    ["Recovery", "Hot filtration, then cold or iced-water cooling", "≈2.5 L filtered beverage"],
    ["Functional base", "375 g caramel, 50 mL Tulsi, 3.25 g xanthan and 5.00 g salt", "Protein added after this stage"],
  ];
  nativeTable(slide, values, 60, 155, 1160, 420, [190, 420, 550], 14);
  text(slide, "Coconut caramel: 400 g coconut cream + 250 g brown sugar + 5 g corn starch + 0.5 g salt + 2 g vanilla", 80, 602, 1120, 34, 15, C.slate, { align: "center" });
  footer(slide, 19, true);
  notes(slide, "Backup detail for questions about the selected oat beverage process.", "pp. 5–7");
}

// 20 — Backup: rheology
{
  const slide = baseSlide("Preliminary rheology", "", true);
  const c1 = slide.charts.add("bar", {
    position: { left: 55, top: 160, width: 570, height: 390 },
    categories: ["Control", "2%", "4%", "6%"],
    series: [{ name: "Soy screening", values: [30.0, 36.3, 61.0, 136.6], fill: C.blue }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 50 }, hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.slate } },
    yAxis: { min: 0, max: 150, majorUnit: 50, title: "mPa·s at ≈100 s⁻¹", majorGridlines: { fill: C.light, width: 1 }, textStyle: { typeface: FONT, fontSize: 12, fill: C.slate } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 13, fill: C.ink, bold: true } },
  }); styleChart(c1);
  label(slide, "Soy: nominal preliminary levels", 85, 172, 300, C.blue);
  const c2 = slide.charts.add("bar", {
    position: { left: 680, top: 160, width: 520, height: 390 },
    categories: ["Before heating", "After heating"],
    series: [{ name: "Rice 4% pilot", values: [11.6, 86.1], fill: C.oat, points: [{ idx: 1, fill: C.red }] }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 65 }, hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.slate } },
    yAxis: { min: 0, max: 100, majorUnit: 20, title: "mPa·s at ≈100 s⁻¹", majorGridlines: { fill: C.light, width: 1 }, textStyle: { typeface: FONT, fontSize: 12, fill: C.slate } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 13, fill: C.ink, bold: true } },
  }); styleChart(c2);
  label(slide, "Rice: exploratory heating pilot", 710, 172, 330, C.oat);
  text(slide, "Single screening runs. Preliminary nominal percentages used the earlier 1% base-protein assumption.", 160, 590, 960, 42, 16, C.red, { bold: true, align: "center" });
  footer(slide, 20, true);
  notes(slide, "Backup chart using the exact apparent-viscosity values reported at approximately 100 inverse seconds. Raw curve data were not included in the supplied report.", "pp. 14–15");
}

// 21 — Backup: Kjeldahl method
{
  const slide = baseSlide("Kjeldahl method", "", true);
  const stages = ["Freeze-drying", "≈1.000 g sample", "Digestion", "Distillation", "0.100 mol/L HCl", "Calculation"];
  stages.forEach((v, i) => {
    const x = 55 + i * 198;
    shape(slide, "roundRect", x, 170, 165, 70, i < 3 ? "#EEF5F9" : C.oatLight, i < 3 ? C.blue : C.oat, 1.5);
    text(slide, v, x + 8, 178, 149, 54, 15, C.ink, { bold: true, align: "center" });
    if (i < 5) arrow(slide, x + 168, 205, x + 192, 205, C.turquoise, 2);
  });
  text(slide, "Vcorrected = Vsample − Vblank", 90, 300, 500, 58, 26, C.navy, { bold: true, align: "center", fill: C.white, lineFill: C.light, lineWidth: 1 });
  text(slide, "Nitrogen (% DM) = Vcorrected × CHCl × 14.007 × 100 / (m × 1000)", 625, 300, 570, 58, 20, C.navy, { bold: true, align: "center", fill: C.white, lineFill: C.light, lineWidth: 1 });
  text(slide, "Protein (% DM) = Nitrogen (% DM) × 5.83", 90, 390, 500, 58, 22, C.green, { bold: true, align: "center", fill: "#EFF5EF" });
  text(slide, "Protein (g/100 mL) = Protein (% DM) × dry matter (g/100 mL) / 100", 625, 390, 570, 58, 19, C.green, { bold: true, align: "center", fill: "#EFF5EF" });
  flatBlock(slide, "Reagents", "≈0.5 g CuSO₄, 7 g K₂SO₄, 10 mL concentrated H₂SO₄ and boric-acid indicator solution", 190, 505, 900, 90, C.blue, C.pale);
  footer(slide, 21, true);
  notes(slide, "Backup equations and analytical workflow used for Kjeldahl protein determination.", "pp. 9–10");
}

// 22 — Backup: calculation example
{
  const slide = baseSlide("Kjeldahl calculation example: selected batch replicate 1", "", true);
  const calc = [
    ["Measured HCl", "13.95 mL"],
    ["Blank correction", "13.95 − 0.45 = 13.50 mL"],
    ["Nitrogen in dry matter", "1.8909%"],
    ["Protein in dry matter", "1.8909 × 5.83 = 11.024%"],
    ["Selected-batch dry matter", "14 g / 60 mL = 23.33 g/100 mL"],
    ["Protein in beverage", "11.024 × 23.33 / 100 = 2.572 g/100 mL"],
  ];
  calc.forEach(([k, v], i) => {
    const y = 150 + i * 76;
    text(slide, String(i + 1).padStart(2, "0"), 80, y, 60, 50, 24, i < 2 ? C.blue : i < 4 ? C.turquoise : C.green, { bold: true, align: "center" });
    text(slide, k, 165, y, 380, 48, 18, C.navy, { bold: true });
    text(slide, v, 570, y, 610, 48, 18, C.ink, { bold: i === 5, fill: i === 5 ? C.oatLight : C.white, align: i === 5 ? "center" : "left" });
  });
  text(slide, "Replicate result: 2.572 g protein / 100 mL", 330, 615, 620, 44, 24, C.white, { bold: true, align: "center", fill: C.navy });
  footer(slide, 22, true);
  notes(slide, "Backup calculation based on the first analytical replicate from the selected batch. The sample mass was approximately 1.000 g.", "Appendix A, p. 22");
}

// 23 — Backup: formulation table
{
  const slide = baseSlide("Complete final formulation table", "", true);
  const values = [
    ["Code", "Protein composition", "Soy (g)", "Rice (g)", "Pea (g)", "Total powder (g)", "Estimated protein (%)"],
    ["156", "Pea / Rice 50:50", "—", "6.45", "6.45", "12.90", "4.85"],
    ["235", "Pea / Soy 50:50", "6.06", "—", "6.06", "12.12", "4.85"],
    ["320", "Soy / Rice 50:50", "6.06", "6.06", "—", "12.12", "4.85"],
    ["473", "Rice 100%", "—", "12.91", "—", "12.91", "4.85"],
    ["589", "Soy 100%", "11.42", "—", "—", "11.42", "4.85"],
    ["667", "Control", "—", "—", "—", "0.00", "2.39"],
    ["798", "Soy / Rice / Pea 40:30:30", "4.91", "3.68", "3.68", "12.27", "4.85"],
  ];
  const table = nativeTable(slide, values, 45, 150, 1190, 430, [80, 320, 120, 120, 120, 190, 240], 13);
  table.getCell(6, 0).fill = "#DCE7EE"; table.getCell(6, 1).fill = "#DCE7EE"; table.getCell(6, 6).fill = "#DCE7EE";
  table.getCell(7, 0).fill = "#CDEFF1"; table.getCell(7, 1).fill = "#CDEFF1"; table.getCell(7, 6).fill = "#CDEFF1";
  text(slide, "The 4.85% values are corrected theoretical estimates, not direct Kjeldahl measurements of the enriched products.", 150, 610, 980, 42, 17, C.red, { bold: true, align: "center" });
  footer(slide, 23, true);
  notes(slide, "Backup table reproducing the final formulation design from the report.", "Table 6, p. 11");
}

// 24 — Backup: hedonic results
{
  const slide = baseSlide("Hedonic results: complete visual and reported values", "", true);
  await photo(slide, ASSETS.likingOriginal, 50, 155, 620, 375, "contain", "rounded-xl", "Overall liking chart from the supplied report");
  const values = [
    ["Code", "Formulation", "Mean ± SD / 9"],
    ["156", "Pea / Rice 50:50", "Not stated in report text"],
    ["235", "Pea / Soy 50:50", "Not stated in report text"],
    ["320", "Soy / Rice 50:50", "5.56 ± 1.66"],
    ["473", "Rice 100%", "6.27 ± 1.81"],
    ["589", "Soy 100%", "6.09 ± 1.83"],
    ["667", "Control", "7.04 ± 1.70"],
    ["798", "Soy / Rice / Pea 40:30:30", "6.56 ± 1.72"],
  ];
  nativeTable(slide, values, 700, 155, 535, 400, [75, 260, 200], 12);
  text(slide, "The chart shows all seven means. Exact mean ± SD values for 156 and 235 were not available in the supplied text, so they were not inferred.", 110, 585, 1060, 52, 16, C.red, { bold: true, align: "center", fill: "#FBF1F1" });
  footer(slide, 24, true);
  notes(slide, "Backup hedonic results. The original report chart is retained to show all seven products; the table includes every exact mean and standard deviation stated in the supplied materials.", "pp. 17–18");
}

// 25 — Backup: JAR
{
  const slide = baseSlide("JAR profile of candidate 798", "", true);
  const chart = slide.charts.add("bar", {
    position: { left: 100, top: 160, width: 760, height: 420 },
    categories: ["Sweetness", "Bitterness", "Flavour intensity", "Creaminess", "Thickness"],
    series: [{ name: "Central JAR region", values: [84, 60, 88, 84, 80], fill: C.turquoise, points: [{ idx: 1, fill: C.oat }] }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 45 }, hasLegend: false,
    xAxis: { min: 0, max: 100, majorUnit: 20, title: "Participants in central JAR region (%)", majorGridlines: { fill: C.light, width: 1 }, textStyle: { typeface: FONT, fontSize: 12, fill: C.slate } },
    yAxis: { textStyle: { typeface: FONT, fontSize: 14, fill: C.ink }, line: { fill: C.light, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 14, fill: C.ink, bold: true } },
  }); styleChart(chart);
  shape(slide, "roundRect", 915, 200, 250, 250, C.navy);
  text(slide, "798", 955, 235, 170, 60, 44, C.white, { bold: true, align: "center" });
  text(slide, "The most balanced JAR profile among the enriched formulations", 940, 310, 200, 100, 19, "#BDEBF0", { bold: true, align: "center" });
  text(slide, "Bitterness showed the lowest central response at 60%.", 900, 485, 280, 65, 16, C.slate, { align: "center" });
  footer(slide, 25, true);
  notes(slide, "Backup visual of the exact central JAR percentages reported for candidate 798.", "p. 18");
}

// 26 — Backup: CATA
{
  const slide = baseSlide("CATA descriptors linked to particle-related mouthfeel", "", true);
  const values = [
    ["Descriptor", "Control 667", "Enriched formulations", "Interpretation"],
    ["Powdery / chalky", "24%", "48–60%", "Protein enrichment increased powder-related perception"],
    ["Gritty / sandy", "0%", "20–36%", "Absent in control; present across enriched products"],
    ["Smooth", "60%", "32–48%", "Control was more often described as smooth"],
    ["Beany / soy-like", "—", "798 = 24%", "Lowest frequency among enriched formulations"],
  ];
  nativeTable(slide, values, 70, 170, 1140, 310, [260, 190, 260, 430], 14);
  text(slide, "Primary formulation issue", 120, 535, 260, 30, 14, C.red, { bold: true, align: "center" });
  text(slide, "Particle-related mouthfeel", 410, 515, 470, 70, 32, C.red, { bold: true, align: "center", fill: "#FBF1F1" });
  text(slide, "798 reduced, but did not eliminate, this limitation.", 900, 530, 260, 45, 16, C.slate, { align: "center" });
  footer(slide, 26, true);
  notes(slide, "Backup CATA summary using only frequencies and ranges explicitly reported in the supplied report.", "p. 18");
}

// 27 — Backup: purchase intention and preference
{
  const slide = baseSlide("Purchase intention and final preference", "", true);
  const chart = slide.charts.add("bar", {
    position: { left: 60, top: 160, width: 720, height: 410 },
    categories: ["156", "235", "320", "473", "589", "667", "798"],
    series: [{ name: "First-choice votes", values: [3, 1, 4, 3, 0, 11, 3], fill: C.grey, points: [{ idx: 5, fill: C.navy }, { idx: 6, fill: C.turquoise }] }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 40 }, hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 14, fill: C.slate } },
    yAxis: { min: 0, max: 12, majorUnit: 2, title: "First-choice votes", majorGridlines: { fill: C.light, width: 1 }, textStyle: { typeface: FONT, fontSize: 12, fill: C.slate } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 14, fill: C.ink, bold: true } },
  }); styleChart(chart);
  shape(slide, "roundRect", 850, 170, 330, 180, C.navy);
  text(slide, "44%", 900, 205, 230, 65, 46, C.white, { bold: true, align: "center" });
  text(slide, "Control 667\n11 of 25 first-choice votes", 900, 275, 230, 55, 17, "#BDEBF0", { bold: true, align: "center" });
  flatBlock(slide, "Positive purchase intention", "Control: 56%\nEnriched formulations: 16–28%", 850, 395, 330, 125, C.oat, C.oatLight);
  text(slide, "Preference varied across the enriched formulations.", 820, 555, 390, 42, 17, C.slate, { align: "center" });
  footer(slide, 27, true);
  notes(slide, "Backup preference and purchase-intention results using the exact values provided in the report.", "p. 18 and Appendix C");
}

// 28 — Backup: limitations
{
  const slide = baseSlide("Study limitations", "", true);
  const limitations = [
    ["Manufacturing", "One experimental preparation; no independent batch replication"],
    ["Kjeldahl", "Analytical replicates from one homogenised batch"],
    ["Sensory panel", "n = 25 convenience participants; limited habitual oat-beverage consumption"],
    ["Protein estimate", "Final enriched products were not directly analysed by Kjeldahl"],
    ["Thermal process", "No validated product-temperature profile"],
    ["Safety and shelf life", "No microbiological shelf-life validation"],
  ];
  limitations.forEach(([k, v], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    flatBlock(slide, k, v, 70 + col * 585, 155 + row * 145, 540, 110, i < 2 ? C.blue : i < 4 ? C.turquoise : C.red, C.white);
  });
  text(slide, "These results guide further development; they do not validate a commercial product or shelf life.", 175, 600, 930, 48, 20, C.white, { bold: true, align: "center", fill: C.navy });
  footer(slide, 28, true);
  notes(slide, "Backup summary of the principal study limitations that constrain interpretation and generalisation.", "p. 19");
}

const requirements = {
  explicitTotalSlideCount: 28,
  requiredNativeTableOwnerSlides: [19, 23, 24, 26],
  requiredNativeChartOwnerSlides: [11, 15, 20, 25, 27],
  materializeLiteralChartWorkbooks: true,
  nativeChartTargetApplication: "powerpoint",
};
const fontPolicy = { basis: "design", families: [FONT] };
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "Kali_Mana_Internship_Defense_v2_candidate.pptx");
await (await PresentationFile.exportPptx(pres)).save(candidatePath);

const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    ...requirements.requiredNativeTableOwnerSlides.flatMap((number) => ["--require-native-table-slide", String(number)]),
  ],
  requiredNativeTableOwnerSlides: requirements.requiredNativeTableOwnerSlides,
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "Kali_Mana_Internship_Defense_v2.validation.json"),
});

const finalPres = await PresentationFile.importPptx(await FileBlob.load(FINAL_PPTX));
const previewDir = path.join(TMP_DIR, "final-previews");
await fs.mkdir(previewDir, { recursive: true });
for (let i = 0; i < finalPres.slides.length; i++) {
  const rendered = await finalPres.export({ slide: finalPres.slides.getItemAt(i), format: "png", scale: 1 });
  await fs.writeFile(path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await rendered.arrayBuffer()));
}

console.log(JSON.stringify({ final: FINAL_PPTX, slides: finalPres.slides.length, validation: result }, null, 2));
