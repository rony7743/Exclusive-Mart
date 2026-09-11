const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields.',
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const adminEmail = process.env.NODEMAILER_EMAIL;

    // 1. Email to Admin with the user's message
    const adminMailOptions = {
      from: `"Exclusive Mart Contact" <${adminEmail}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Exclusive Mart] New Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #db4444; color: white; padding: 16px 20px;">
            <h2 style="margin: 0; font-size: 20px;">New Contact Form Message</h2>
          </div>
          <div style="padding: 20px; background-color: #f9fafb;">
            <p style="margin: 0 0 10px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0 0 10px;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <div style="margin-top: 20px; padding: 15px; background: #ffffff; border-left: 4px solid #db4444; border-radius: 4px;">
              <strong style="display: block; margin-bottom: 8px;">Message:</strong>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.5; color: #374151;">${message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">You can directly reply to this email to respond to the sender.</p>
          </div>
        </div>
      `,
    };

    // 2. Auto-reply confirmation email to the user
    const userMailOptions = {
      from: `"Exclusive Mart Support" <${adminEmail}>`,
      to: email,
      subject: `Thank you for contacting Exclusive Mart, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #db4444; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Exclusive Mart</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">We have received your message</p>
          </div>
          <div style="padding: 24px; color: #374151; font-size: 15px; line-height: 1.6;">
            <p style="margin-top: 0;">Hi <strong>${name}</strong>,</p>
            <p>Thank you for reaching out to us! We have successfully received your message and our team is currently reviewing it.</p>
            <p>We strive to answer all inquiries promptly and will get back to you within <strong>24 hours</strong>.</p>
            
            <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
              <h3 style="margin: 0 0 10px; font-size: 15px; color: #111827;">Your Submitted Message:</h3>
              <p style="margin: 0; color: #4b5563; font-style: italic; white-space: pre-wrap;">"${message}"</p>
            </div>

            <p>If you have any urgent queries, you can also call us directly at <strong>+88018112222</strong>.</p>
            
            <p style="margin-bottom: 0;">Warm regards,<br><strong>Exclusive Mart Team</strong></p>
          </div>
          <div style="background-color: #f3f4f6; padding: 12px 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            © ${new Date().getFullYear()} Exclusive Mart. All rights reserved.
          </div>
        </div>
      `,
    };

    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! A confirmation email has been sent to your inbox.',
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.',
    });
  }
};

