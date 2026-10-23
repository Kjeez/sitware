// Sitware palette: ink, copper and warm ivory, as on the storefront.
const INK = "#181411"
const COPPER = "#ac6035"
const PAPER = "#faf6ef"

export const storefrontUrl = () => (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])

/** Minimal branded email with one call-to-action button. */
export function renderActionEmail(opts: {
  subject: string
  heading: string
  paragraphs: string[]
  buttonLabel: string
  buttonUrl: string
  footnote?: string
}) {
  const paragraphs = opts.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a413a">${escapeHtml(p)}</p>`)
    .join("")
  const footnote = opts.footnote
    ? `<p style="margin:0;font-size:12px;color:#696059">${escapeHtml(opts.footnote)}</p>`
    : ""
  const html = `<!doctype html><html><body style="margin:0;background:${PAPER};font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" style="max-width:520px;background:#ffffff;border:1px solid #e0d2c2;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-family:Georgia,serif;font-size:20px;letter-spacing:6px;color:${INK}">SITWARE</p>
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:${INK}">${escapeHtml(opts.heading)}</h1>
${paragraphs}
<p style="margin:24px 0"><a href="${escapeHtml(opts.buttonUrl)}" style="display:inline-block;background:${COPPER};color:${PAPER};text-decoration:none;padding:12px 28px;border-radius:999px;font-size:13px;font-weight:bold;letter-spacing:1px">${escapeHtml(opts.buttonLabel)}</a></p>
${footnote}
</td></tr></table></td></tr></table></body></html>`
  const text = [opts.heading, "", ...opts.paragraphs, "", `${opts.buttonLabel}: ${opts.buttonUrl}`, opts.footnote ?? ""].join("\n")
  return { subject: opts.subject, html, text }
}
