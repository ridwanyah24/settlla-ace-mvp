import fs from "fs";
import path from "path";
const p = path.join(process.cwd(), "src/components/TenancyAgreementViewer.tsx");
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const out = [...lines.slice(0, 226), ...lines.slice(429)];
fs.writeFileSync(p, out.join("\n"));
