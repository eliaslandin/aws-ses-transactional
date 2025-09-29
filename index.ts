import { readFileSync } from "node:fs";
import path from "path";

const PATH_TO_RECIPIENT_ADDRESSES = process.env.PATH_TO_RECIPIENT_ADDRESSES!;

let emails: string[] = [];
try {
  const csv = readFileSync(
    path.join(process.cwd(), PATH_TO_RECIPIENT_ADDRESSES),
    "utf8",
  );
  emails = csv.split("\n").filter((email) => email !== "");
} catch (e) {
  console.error(e);
}
