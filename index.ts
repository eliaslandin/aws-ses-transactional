import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESv2Client,
} from "@aws-sdk/client-sesv2";
import { readFileSync, writeFileSync } from "node:fs";
import path from "path";

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
  console.log(recipients);

  emailHtml = readFileSync(PATH_TO_EMAIL_HTML, "utf8");
} catch (e) {
  console.error(e);
}

if (!emailHtml || emailHtml.length === 0) {
  throw new Error("Email HTML couldn't be read from file.");
}

const failed: string[] = [];
const ses = new SESv2Client();
for (const recipient of recipients) {
  try {
    const params: SendEmailCommandInput = {
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
    };

    await ses.send(new SendEmailCommand(params));

    console.log(`Successfully sent email to ${recipient}`);
  } catch (e) {
    failed.push(recipient);
  }
}

if (failed.length > 0) {
  console.log(
    `Tried to send to ${recipients.length} recipients. ${failed.length} failed and ${recipients.length - failed.length} succeeded.`,
  );
  console.log("Failed to send to the following addresses:");
  failed.forEach((email) => console.log(email));

  writeFileSync("failed.csv", failed.toString());
  console.log("Wrote failed email addresses to failed.csv");
} else {
  console.log(`Successfully sent email to ${recipients.length} recipients!`);
}
