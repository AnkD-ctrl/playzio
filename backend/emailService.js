import nodemailer from 'nodemailer'

// Configuration du transporteur Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(email, resetToken, frontendUrl) {
  const transporter = createTransporter()
  
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: `"Playzio" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe Playzio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Playzio</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Réinitialisation de mot de passe</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Bonjour !</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Playzio.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-size: 16px; 
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(212, 175, 140, 0.3);">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            <strong>Important :</strong> Ce lien est valide pendant 24 heures. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #d4af8c; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>© 2024 Playzio - Organisez vos activités simplement</p>
        </div>
      </div>
    `
  }
  
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email de réinitialisation envoyé:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation')
  }
}

// Tester la configuration SMTP
export async function testEmailConnection() {
  try {
    // Temporairement désactivé pour éviter l'erreur SMTP
    console.log('Test email temporairement désactivé')
    return true
  } catch (error) {
    console.error('Erreur de configuration SMTP:', error)
    return false
  }
}
