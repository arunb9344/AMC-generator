export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY

    if (!BREVO_API_KEY) {
      return res.status(500).json({ error: "Brevo API key not configured" })
    }

    const formData = req.body
    const {
      customerEmail,
      customerName,
      reportNumber,
      serviceDate,
      serviceType,
      equipmentType,
      technicianName,
      issueDescription,
      technicianComments,
      sendToCustomer,
    } = formData

    // Convert PDF buffer to base64
    const pdfBuffer = req.files?.pdf?.data
    if (!pdfBuffer) {
      return res.status(400).json({ error: "PDF file is required" })
    }
    const pdfBase64 = pdfBuffer.toString("base64")

    const emails = []

    // Customer email
    if (sendToCustomer === "true" && customerEmail) {
      emails.push({
        to: [{ email: customerEmail, name: customerName }],
        subject: `Service Report - ${reportNumber} - Eye Tech Securities`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Eye Tech Securities</h1>
              <p style="margin: 5px 0 0 0;">Service Report</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${customerName},</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Thank you for choosing Eye Tech Securities for your security system maintenance needs. 
                Please find attached your service report for the recent service visit.
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Service Details:</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li><strong>Report Number:</strong> ${reportNumber}</li>
                  <li><strong>Service Date:</strong> ${serviceDate}</li>
                  <li><strong>Service Type:</strong> ${serviceType}</li>
                  <li><strong>Equipment Type:</strong> ${equipmentType}</li>
                  <li><strong>Technician:</strong> ${technicianName}</li>
                </ul>
              </div>
              
              ${
                issueDescription
                  ? `
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Service Summary:</h3>
                <p style="color: #4b5563; line-height: 1.6;">${issueDescription}</p>
              </div>
              `
                  : ""
              }
              
              ${
                technicianComments
                  ? `
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Technician Notes:</h3>
                <p style="color: #4b5563; line-height: 1.6;">${technicianComments}</p>
              </div>
              `
                  : ""
              }
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                If you have any questions about this service report or need additional support, 
                please don't hesitate to contact us.
              </p>
              
              <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 14px;">
                  <strong>Contact Information:</strong><br>
                  Phone: 9962835944<br>
                  Email: support@eyetechsecurities.in<br>
                  Address: No.56/80, Medavakkam Main Road, Keelkattalai, Chennai-600117
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for your continued trust in Eye Tech Securities.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Best regards,<br>
                <strong>Eye Tech Securities Team</strong>
              </p>
            </div>
            
            <div style="background-color: #374151; color: #d1d5db; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2025 Eye Tech Securities. All rights reserved.</p>
            </div>
          </div>
        `,
        attachment: [
          {
            content: pdfBase64,
            name: `Service_Report_${reportNumber}.pdf`,
            type: "application/pdf",
          },
        ],
      })
    }

    // Admin email (always sent)
    emails.push({
      to: [{ email: "support@eyetechsecurities.in", name: "Eye Tech Securities Admin" }],
      subject: `New Service Report Generated - ${reportNumber}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Eye Tech Securities</h1>
            <p style="margin: 5px 0 0 0;">New Service Report Generated</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Service Report Details</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Report Information:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li><strong>Report Number:</strong> ${reportNumber}</li>
                <li><strong>Service Date:</strong> ${serviceDate}</li>
                <li><strong>Service Type:</strong> ${serviceType}</li>
                <li><strong>Equipment Type:</strong> ${equipmentType}</li>
                <li><strong>Technician:</strong> ${technicianName}</li>
              </ul>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Customer Information:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li><strong>Customer Name:</strong> ${customerName}</li>
                <li><strong>Customer Email:</strong> ${customerEmail}</li>
                <li><strong>Email Sent to Customer:</strong> ${sendToCustomer === "true" ? "Yes" : "No"}</li>
              </ul>
            </div>
            
            ${
              issueDescription
                ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Issue Description:</h3>
              <p style="color: #4b5563; line-height: 1.6;">${issueDescription}</p>
            </div>
            `
                : ""
            }
            
            ${
              technicianComments
                ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Technician Comments:</h3>
              <p style="color: #4b5563; line-height: 1.6;">${technicianComments}</p>
            </div>
            `
                : ""
            }
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Action Required:</strong> Please review the attached service report and follow up with the customer if necessary.
              </p>
            </div>
          </div>
          
          <div style="background-color: #374151; color: #d1d5db; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2025 Eye Tech Securities - Internal System</p>
          </div>
        </div>
      `,
      attachment: [
        {
          content: pdfBase64,
          name: `Service_Report_${reportNumber}.pdf`,
          type: "application/pdf",
        },
      ],
    })

    // Send emails
    for (const email of emails) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "Eye Tech Securities", email: "no-reply@eyetechsecurities.in" },
          to: email.to,
          subject: email.subject,
          htmlContent: email.htmlContent,
          attachment: email.attachment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Brevo API error: ${response.status} - ${errorData}`)
      }
    }

    res.status(200).json({
      success: true,
      message: "Service report emails sent successfully",
      emailsSent: emails.length,
    })
  } catch (error) {
    console.error("Service report email error:", error)
    res.status(500).json({ error: error.message })
  }
}
