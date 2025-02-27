import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Load environment variables securely
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const VERIFIED_EMAIL = process.env.SENDGRID_VERIFIED_EMAIL;

if (!SENDGRID_API_KEY || !VERIFIED_EMAIL) {
  console.error("❌ Missing SendGrid API Key or Verified Email.");
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Email Sending Function
const sendEmail = async (email, url, device, MB, grams, resourceSizeData, resourceCountData) => {
  const resourceSizeTable = resourceSizeData
    .map((item) => `<tr><td>${item.name}</td><td>${item.value} KB</td></tr>`)
    .join("");

  const resourceCountTable = resourceCountData
    .map((item) => `<tr><td>${item.name}</td><td>${item.count}</td></tr>`)
    .join("");

  const msg = {
    to: email,
    from: VERIFIED_EMAIL,
    subject: `Webpage Carbon Analysis Report for ${url}`,
    html: `
      <h2>Webpage Carbon Footprint Analysis</h2>
      <p><strong>Device:</strong> ${device}</p>
      <p><strong>Page Weight:</strong> ${MB} MB</p>
      <p><strong>CO₂ Emission:</strong> ${grams} g</p>
      
      <h3>Resource Size Breakdown:</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr><th>Resource Type</th><th>Size (KB)</th></tr>
        ${resourceSizeTable}
      </table>

      <h3>Resource Count Breakdown:</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr><th>Resource Type</th><th>Count</th></tr>
        ${resourceCountTable}
      </table>

      <p>Thank you for using our tool!</p>
    `,
  };

  await sgMail.send(msg);
};

// API Route Handler (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, url, device, MB, grams, resourceSizeData, resourceCountData } = body;

    if (!email || !url || !device || !MB || !grams || !resourceSizeData || !resourceCountData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await sendEmail(email, url, device, MB, grams, resourceSizeData, resourceCountData);
    return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 200 });

  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
