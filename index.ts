import { readFileSync } from "node:fs";

const PATH_TO_EMAILS = process.env.PATH_TO_EMAILS!;

let emails: string[] = [];
try {
  const csv = readFileSync(PATH_TO_EMAILS, "utf8");
  emails = csv.split("\n").filter((email) => email !== "");
} catch (e) {
  console.error(e);
}
