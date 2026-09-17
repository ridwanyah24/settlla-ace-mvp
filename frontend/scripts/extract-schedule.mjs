import fs from "fs";
import path from "path";

const drawer = path.join(process.cwd(), "src/components/BookingDrawer.tsx");
const out = path.join(process.cwd(), "src/lib/settlla/bookingSchedule.ts");
const lines = fs.readFileSync(drawer, "utf8").split(/\r?\n/);

const start = lines.findIndex((l) => l.includes("function generateClientSchedule"));
const end = lines.findIndex((l, i) => i > start && l.trim() === "}" && lines[i - 1]?.includes("return results"));
// find closing brace of generateClientSchedule - line 227 area
let endLine = start;
let depth = 0;
for (let i = start; i < lines.length; i++) {
  if (lines[i].includes("function generateClientSchedule")) depth = 0;
  for (const ch of lines[i]) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
  if (i > start && depth === 0) {
    endLine = i;
    break;
  }
}

const helpersStart = lines.findIndex((l) => l.includes("function parseTimeToMins"));
let helpersEnd = helpersStart;
depth = 0;
for (let i = helpersStart; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
  if (i > helpersStart && depth === 0) {
    helpersEnd = i;
    break;
  }
}
const formatEnd = helpersEnd + 15;
let formatLine = helpersEnd;
depth = 0;
for (let i = helpersEnd + 1; i < lines.length; i++) {
  if (!lines[i].includes("function formatMinsToTime")) continue;
  for (let j = i; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
    }
    if (j > i && depth === 0) {
      formatLine = j;
      break;
    }
  }
  break;
}

const body = lines
  .slice(start, endLine + 1)
  .join("\n")
  .replace(/^  function generateClientSchedule/, "export function generateClientSchedule")
  .replace(/^  function parseTimeToMins/, "function parseTimeToMins")
  .replace(/^  function formatMinsToTime/, "function formatMinsToTime");

const helperBlock = lines.slice(helpersStart, formatLine + 1).join("\n");

const header = `import { Listing } from "@/types/listing";
import { DaySchedule, TimeSlot } from "@/types/booking";

`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header + body + "\n\n" + helperBlock.replace(/^  /gm, ""));
