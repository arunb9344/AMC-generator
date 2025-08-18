export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the Brevo API key from environment variables
    const apiKey = process.env.BREVO_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: "Brevo API key not configured. Please contact administrator.",
      })
    }

    // Extract email data from request body
    const { to, subject, htmlContent, attachment } = req.body

    // Validate required fields
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        error: "Missing required fields: to, subject, htmlContent",
      })
    }

    // Prepare the email payload for Brevo API
    const emailPayload = {
      sender: {
        name: "Eye Tech Securities",
        email: "no-reply@eyetechsecurities.in",
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    }

    // Add attachment if provided
    if (attachment && attachment.name && attachment.content) {
      emailPayload.attachment = [
        {
          name: attachment.name,
          content: attachment.content,
        },
      ]
    }

    // Send email via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(emailPayload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({
        error: `Email sending failed: ${errorData.message || response.statusText}`,
      })
    }

    const result = await response.json()
    return res.status(200).json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Email sending error:", error)
    return res.status(500).json({
      error: "Internal server error while sending email",
    })
  }
}
