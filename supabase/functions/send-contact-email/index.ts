import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  location?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: ContactPayload = await req.json();

    if (!payload.name || !payload.email || !payload.message) {
      return new Response(
        JSON.stringify({ error: "name, email and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Recipient: configurable from the admin (site_settings), with a fallback.
    let recipient = Deno.env.get("CONTACT_FALLBACK_EMAIL") || "contact@exmar-oi.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      const admin = createClient(supabaseUrl, serviceKey);
      const { data } = await admin
        .from("site_settings")
        .select("value")
        .eq("key", "contact_notification_email")
        .maybeSingle();
      if (data?.value) recipient = data.value;
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    // Sender must be a domain verified in Resend. Configurable via env.
    const fromAddress = Deno.env.get("CONTACT_FROM_EMAIL") || "EXMAR-OI <onboarding@resend.dev>";

    if (!resendApiKey) {
      // Not configured yet: the submission is still saved in the DB by the
      // front-end. We skip the email instead of failing the request.
      return new Response(
        JSON.stringify({ ok: true, emailed: false, reason: "RESEND_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rows: [string, string][] = [
      ["Nom", payload.name || ""],
      ["Email", payload.email || ""],
      ["Téléphone", payload.phone || ""],
      ["Société", payload.company || ""],
      ["Zone", payload.location || ""],
      ["Sujet", payload.subject || ""],
    ];
    const tableRows = rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#475569">${k}</td><td style="padding:4px 0;color:#0f172a">${escapeHtml(v)}</td></tr>`)
      .join("");
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px">
        <h2 style="color:#0f172a">Nouveau message — site EXMAR-OI</h2>
        <table style="border-collapse:collapse;margin-bottom:16px">${tableRows}</table>
        <div style="padding:16px;background:#f8fafc;border-radius:8px;white-space:pre-wrap;color:#0f172a">${escapeHtml(payload.message || "")}</div>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipient],
        reply_to: payload.email,
        subject: `Contact site — ${payload.subject || "Demande"} (${payload.name})`,
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return new Response(
        JSON.stringify({ ok: false, emailed: false, error: detail }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, emailed: true, recipient }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
