// Configuration SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'playzio.fr@gmail.com'

// Envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(email, resetToken, frontendUrl) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY non configurée')
  }

  const resetUrl = `${frontendUrl}/?token=${resetToken}`
  
  const emailData = {
    personalizations: [{
      to: [{ email: email }],
      subject: 'Réinitialisation de votre mot de passe Playzio'
    }],
    from: { email: FROM_EMAIL, name: 'Playzio' },
    content: [{
      type: 'text/html',
      value: `
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
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>© 2024 Playzio - Organisez vos activités simplement</p>
          </div>
        </div>
      `
    }]
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`)
    }

    console.log(`Email de réinitialisation envoyé à ${email} via SendGrid`)
    return { success: true, messageId: 'sendgrid' }
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${email}:`, error)
    throw error
  }
}

// Tester la configuration SendGrid
export async function testEmailConnection() {
  try {
    if (!SENDGRID_API_KEY) {
      console.log('SENDGRID_API_KEY non configurée')
      return false
    }
    
    // Test simple de l'API SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('Configuration SendGrid OK')
      return true
    } else {
      console.log('Configuration SendGrid invalide')
      return false
    }
  } catch (error) {
    console.error('Erreur de configuration SendGrid:', error)
    return false
  }
}
