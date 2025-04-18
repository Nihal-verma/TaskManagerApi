import nodemailer from 'nodemailer';
import { EMAIl_SERVICE, EMAIL_PORT, EMAIL_PASSWORD, EMAIL_FROM } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service:EMAIl_SERVICE,
      port: EMAIL_PORT,
    secure:true,
      auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Please click the following link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in one hour.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
export default new EmailService();