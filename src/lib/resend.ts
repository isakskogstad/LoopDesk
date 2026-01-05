import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && process.env.NODE_ENV !== "test") {
  console.warn("RESEND_API_KEY is not set. Email sending will fail.");
}

export const resend = new Resend(apiKey || "");
