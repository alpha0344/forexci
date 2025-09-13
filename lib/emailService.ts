import nodemailer from "nodemailer";
import crypto from "crypto";

class EmailService {
    private transporter!: nodemailer.Transporter;

    constructor() {
        this.initializeTransporter();
    }

    private async initializeTransporter() {
        try {
            // Vérifier si on a des credentials SMTP configurés
            const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
            
            if (hasSmtpConfig) {
                // Utiliser la configuration SMTP réelle
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                
                console.log('📧 Email service initialized with real SMTP:', process.env.SMTP_HOST);
            } else {
                // Fallback vers Ethereal Email pour les tests
                const testAccount = await nodemailer.createTestAccount();
                
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                
                console.log('📧 Email service initialized with Ethereal Email for development');
            }
        } catch (error) {
            console.error('Failed to initialize email transporter:', error);
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
        }
    }

    async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
        if (!this.transporter) {
            await this.initializeTransporter();
        }

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.FROM_EMAIL || "noreply@forexci.com",
            to: email,
            subject: "Réinitialisation de votre mot de passe Forexci",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
          
          <p>Bonjour ${name || 'cher utilisateur'},</p>
          
          <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p style="color: #999; font-size: 12px;">Ce lien expirera dans 1 heure.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
        </div>
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            
            const hasRealSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
            
            if (hasRealSmtp) {
                console.log('📧 Password reset email sent to real inbox:', email);
            } else {
                console.log('📧 Password reset email sent to test inbox:', email);
                console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
            }
            
            return info;
        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw new Error("Failed to send password reset email");
        }
    }

    generateToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }
}

export const emailService = new EmailService();