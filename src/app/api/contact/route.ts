import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'crisiscompanion2025@gmail.com', // Your Gmail
      pass: process.env.GMAIL_APP_PASSWORD,  // App password stored in .env.local
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: 'crisiscompanion2025@gmail.com',
    subject: `New Contact Message from ${name}`,
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Message:
${message}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
        <h2 style="color: #0a66c2;">📩 New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #0a66c2;">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <hr style="margin: 20px 0;" />
        <p style="white-space: pre-line;"><strong>Message: </strong><br /><br />${message}</p>
        <hr style="margin-top: 30px;" />
        <p style="font-size: 12px; color: #999;">
          This message was sent from the <strong>Crisis Companion</strong> contact form.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Email failed to send' }, { status: 500 });
  }
}
