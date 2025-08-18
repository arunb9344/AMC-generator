const Brevo = require('@getbrevo/brevo');

exports.handler = async (event) => {
    const { customerName, serviceType, equipmentType, customerEmail, sendToCustomer, pdfDataUri, adminEmail } = JSON.parse(event.body);

    if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY environment variable is not set');
    }

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `AMC Service Report - ${customerName} ${serviceType} ${equipmentType}`;
    sendSmtpEmail.sender = { name: 'EyeTech Securities', email: 'no-reply@eyetechsecurities.in' };
    sendSmtpEmail.to = [{ email: adminEmail, name: 'Support Team' }];

    if (sendToCustomer && customerEmail) {
        sendSmtpEmail.to.push({ email: customerEmail, name: customerName });
    } else if (!customerEmail) {
        throw new Error('Customer email is required when sendToCustomer is checked');
    }

    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">AMC Service Report</h2>
                    <p>Dear ${sendToCustomer ? customerName : 'Support Team'},</p>
                    <p>We are pleased to inform you that the ${serviceType} for ${equipmentType} has been completed. Please find the detailed service report attached.</p>
                    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Customer</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${customerName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Service Type</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${serviceType}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Equipment</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${equipmentType}</td>
                        </tr>
                    </table>
                    <p>For any queries, please contact us at <a href="mailto:support@eyetechsecurities.in" style="color: #007bff;">support@eyetechsecurities.in</a>.</p>
                    <p style="margin-top: 20px; text-align: center; color: #666;">Best Regards,<br>EyeTech Securities Team</p>
                </div>
            </body>
        </html>
    `;

    sendSmtpEmail.attachment = [{
        name: `Service_Report_${customerName}.pdf`,
        content: pdfDataUri.split(',')[1]
    }];

    try {
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully', data: response })
        };
    } catch (error) {
        console.error('Email sending error:', error.response ? error.response.body : error.message);
        throw new Error(`Failed to send email: ${error.response ? error.response.body.message : error.message}`);
    }
};
