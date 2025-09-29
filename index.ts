import { readFileSync } from "node:fs";
import path from "path";

const PATH_TO_RECIPIENT_ADDRESSES = process.env.PATH_TO_RECIPIENT_ADDRESSES!;
const PATH_TO_EMAIL_HTML = process.env.PATH_TO_EMAIL_HTML!;

let recipients: string[] = [];
let emailHtml: string;
try {
  const csv = readFileSync(
    path.join(process.cwd(), PATH_TO_RECIPIENT_ADDRESSES),
    "utf8",
  );
  recipients = csv.split("\n").filter((email) => email.includes("@"));
  console.log(recipients);

  emailHtml = readFileSync(PATH_TO_EMAIL_HTML, "utf8");
} catch (e) {
  console.error(e);
}
