import twilio from "twilio";


const isDevBypass =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_BYPASS_OTP === "true";



const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms(
  to: string,
  body: string
): Promise<{ ok: boolean; debugCode?: string; error?: string }> {



if (isDevBypass) {
  console.log("⚡ DEV BYPASS:", body);

  return {
    ok: true,
    debugCode: process.env.DEV_OTP,
  };
}




  const FROM = process.env.TWILIO_FROM_NUMBER;

  if (!FROM) {
    const isDev = process.env.NODE_ENV === "development";

    console.log(`[SMS:DEV] -> ${to}: ${body}`);

    if (isDev) {
      return { ok: true, debugCode: body };
    }

    return {
      ok: false,
      error: "Twilio is not configured."
    };
  }

  try {

    await client.messages.create({
      body,
      from: FROM,
      to,
    });

    return { ok: true };

  } catch (e) {

    console.error("[SMS]", e);

    return {
      ok: false,
      error: (e as Error).message
    };
  }
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";

  const trimmed = phone.replace(/\s+/g, "");

  if (trimmed.length < 4) return "*".repeat(trimmed.length);

  const last2 = trimmed.slice(-2);

  const cc = trimmed.startsWith("+") ? trimmed.slice(0, 3) : "";

  return `${cc} ${"*".repeat(Math.max(trimmed.length - cc.length - 2, 4))} ${last2}`.trim();
}