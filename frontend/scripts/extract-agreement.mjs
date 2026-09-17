import fs from "fs";
import path from "path";

const viewer = path.join(process.cwd(), "src/components/TenancyAgreementViewer.tsx");
const out = path.join(process.cwd(), "src/lib/settlla/generateClientAgreement.ts");
const lines = fs.readFileSync(viewer, "utf8").split(/\r?\n/);
const body = lines
  .slice(235, 434)
  .join("\n")
  .replace(/^  function generateClientAgreement/, "export function generateClientAgreement");
const header = `import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";

`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header + body);
