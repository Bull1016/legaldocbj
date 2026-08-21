export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey) {
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
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("Resend API error:", errText)
      } else {
        console.log(`[EMAIL SENT via Resend] To: ${to} | Subject: ${subject}`)
        return { success: true }
      }
    } catch (error) {
      console.error("Failed to send email via Resend:", error)
    }
  }

  // Fallback mode: log email content cleanly when API key is missing or failed
  console.log("==========================================")
  console.log(`[NOTIFICATION E-MAIL (Simulé / Log)]`)
  console.log(`À: ${to}`)
  console.log(`Sujet: ${subject}`)
  console.log(`Contenu: ${html.replace(/<[^>]+>/g, " ").slice(0, 300)}...`)
  console.log("==========================================")

  return { success: true, simulated: true }
}
