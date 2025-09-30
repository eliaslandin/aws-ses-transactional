import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { readFileSync, writeFileSync } from "node:fs";
import { styleText } from "node:util";
import path from "path";
import readline from "node:readline/promises";

const PATH_TO_RECIPIENT_ADDRESSES = process.env.PATH_TO_RECIPIENT_ADDRESSES!;
const PATH_TO_EMAIL_HTML = process.env.PATH_TO_EMAIL_HTML!;
const FROM_EMAIL_ADDRESS = process.env.FROM_EMAIL_ADDRESS!;
const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT!;

let recipients: string[] = [];
let emailHtml: string | null = null;
try {
  const csv = readFileSync(
    path.join(process.cwd(), PATH_TO_RECIPIENT_ADDRESSES),
    "utf8",
  );
  recipients = csv.split("\n").filter((email) => email.includes("@"));

  emailHtml = readFileSync(PATH_TO_EMAIL_HTML, "utf8");
} catch (e) {
  console.error(e);
}

if (!emailHtml || emailHtml.length === 0) {
  throw new Error("Email HTML couldn't be read from file.");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const answer = await rl.question(
  "Send email: " +
    styleText(["blue"], PATH_TO_EMAIL_HTML) +
    "\nTo recipients: " +
    styleText(["blue"], PATH_TO_RECIPIENT_ADDRESSES) +
    "\nFrom address: " +
    styleText(["blue"], FROM_EMAIL_ADDRESS) +
    "\nSubject line: " +
    styleText(["blue"], EMAIL_SUBJECT) +
    "\nAWS profile: " +
    styleText(["blue"], process.env.AWS_PROFILE!) +
    "\n\nContinue? (y/n) ",
);

if (answer.trim().toLowerCase() !== "y") {
  console.log("Program stopped");
  process.exit(0);
}

rl.close();

const failed: string[] = [];
const ses = new SESv2Client();
for (const recipient of recipients) {
  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM_EMAIL_ADDRESS,
        Destination: {
          ToAddresses: [recipient],
        },
        Content: {
          Simple: {
            Subject: {
              Data: EMAIL_SUBJECT,
            },
            Body: {
              Html: {
                Data: emailHtml,
              },
            },
          },
        },
      }),
    );

    console.log(`Successfully sent email to ${recipient}`);
  } catch (e) {
    failed.push(recipient);
  }
}

if (failed.length > 0) {
  console.log(
    `\nTried to send to ${recipients.length} recipients. ${failed.length} failed and ${recipients.length - failed.length} succeeded.`,
  );
  console.log(styleText(["red"], "Failed to send to the following addresses:"));
  failed.forEach((email) => console.log(styleText(["red"], email)));

  writeFileSync("failed.csv", failed.toString());
  console.log("\nWrote failed email addresses to failed.csv");
} else {
  console.log(`Successfully sent email to ${recipients.length} recipients!`);
}
