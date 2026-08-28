export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "LegalDoc BJ <noreply@legaldoc.bj>",
          to: [to],
          subject,
          html,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errText = await response.text()
        console.error("Resend API error status:", response.status)
        return { success: false, error: errText }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log(`[EMAIL SENT via Resend] To: ${to} | Subject: ${subject}`)
        } else {
          console.log(`[EMAIL SENT via Resend] Subject: ${subject}`)
        }
        return { success: true }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Failed to send email via Resend:", error)
      return { success: false, error: String(error) }
    }
  }

  // Fallback mode: used ONLY when RESEND_API_KEY is absent
  if (process.env.NODE_ENV === "development") {
    console.log("==========================================")
    console.log(`[NOTIFICATION E-MAIL (Simulé / Log)]`)
    console.log(`À: ${to}`)
    console.log(`Sujet: ${subject}`)
    console.log(`Contenu: ${html.replace(/<[^>]+>/g, " ").slice(0, 300)}...`)
    console.log("==========================================")
  } else {
    console.log(`[NOTIFICATION E-MAIL (Simulé)] Subject: ${subject}`)
  }

  return { success: true, simulated: true }
}
