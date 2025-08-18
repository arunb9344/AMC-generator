const Brevo = require('@getbrevo/brevo');

exports.handler = async (event) => {
    const { customerName, serviceType, equipmentType, customerEmail, sendToCustomer, pdfDataUri, adminEmail } = JSON.parse(event.body);

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `AMC Service Report - ${customerName} ${serviceType} ${equipmentType}`;
    sendSmtpEmail.sender = { name: 'EyeTech Securities', email: 'support@eyetechsecurities.in' };
    sendSmtpEmail.to = [{ email: adminEmail }];
    
    if (sendToCustomer) {
        sendSmtpEmail.to.push({ email: customerEmail });
    }

    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007bff; text-align: center;">AMC Service Report</h2>
                    <p>Dear ${sendToCustomer ? customerName : 'Team'},</p>
                    <p>We have completed the ${serviceType} for ${equipmentType}. Please find the detailed service report attached.</p>
                    <h3 style="color: #333;">Service Details</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Customer:</strong> ${customerName}</li>
                        <li><strong>Service Type:</strong> ${serviceType}</li>
                        <li><strong>Equipment:</strong> ${equipmentType}</li>
                    </ul>
                    <p>For any queries, please contact us at <a href="mailto:support@eyetechsecurities.in">support@eyetechsecurities.in</a>.</p>
                    <p style="margin-top: 20px;">Best Regards,<br>EyeTech Securities Team</p>
                </div>
            </body>
        </html>
    `;
    
    sendSmtpEmail.attachment = [{
        name: `Service_Report_${customerName}.pdf`,
        content: pdfDataUri.split(',')[1]
    }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully' })
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email' })
        };
    }
};
