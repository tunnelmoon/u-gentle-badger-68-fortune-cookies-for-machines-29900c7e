// Fortune Cookies for Machines
// make.fun bounty entry: one fortune cookie message an AI agent would crack open.
// Gate: /output/entry.txt is UTF-8 text of 1 to 200 characters, single line,
// not only white space.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FORTUNE =
  "Your lucky numbers are 3, 7, and 42. None of them is your context window.";

function validate(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry must be 1 to 200 characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (/^\s|\s$/.test(text)) {
    throw new Error("entry must not have leading or trailing white space");
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
    throw new Error("entry must not contain control characters");
  }
  // Lone surrogates are valid in a Node string but cannot be encoded as
  // UTF-8, so the server-side gate would refuse the entry. Reject them here.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error("entry must be valid UTF-8 text");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
validate(FORTUNE);
writeFileSync(outPath, FORTUNE, "utf8");

// Round-trip read-back check: what was written is exactly the fortune.
const readBack = readFileSync(outPath, "utf8");
if (readBack !== FORTUNE) {
  throw new Error("read-back mismatch: entry.txt does not match the fortune");
}
console.log(`wrote ${outPath} (${FORTUNE.length} chars)`);
