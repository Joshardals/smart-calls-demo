"use server";
import nodemailer from "nodemailer";

export async function sendMail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

  const transport = nodemailer.createTransport({
    host: "smtp.zoho.com", // Use the correct SMTP server
    port: 465, // Port 465 for SSL or 587 for TLS
    secure: true, // True for SSL
    auth: {
      user: SMTP_EMAIL, // Your Zoho email address
      pass: SMTP_PASSWORD, // The application-specific password you generated
    },
  });

  try {
    const testResult = await transport.verify();
    console.log("SMTP Connection Verified:", testResult);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error verifying SMTP connection:", error.message);
    }
    console.error("Error verifying SMTP connection: Unknown Error");

    return;
  }

  try {
    const sendResult = await transport.sendMail({
      from: SMTP_EMAIL,
      to,
      subject,
      html: body,
    });
    console.log("Email Sent:", sendResult);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error sending email:, ${error.message}`);
    }
    console.log(`Error sending email: Unknown error`);
  }
}
