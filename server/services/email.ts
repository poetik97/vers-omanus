import { Resend } from 'resend';

// Initialize Resend client lazily
let resendInstance: Resend | null = null;

function getResend() {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      console.log('[Email Service] Initializing Resend with key length:', apiKey.length);
      resendInstance = new Resend(apiKey);
      return resendInstance;
    } catch (error) {
      console.error('[Email Service] Failed to initialize Resend:', error);
      return null;
    }
  } else {
    console.warn('[Email Service] RESEND_API_KEY is missing or empty');
  }

  return null;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'Organiza-te360 <noreply@organiza-te360.com>';
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT || 'suporte@organiza-te360.com';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  replyTo?: string;
}

/**
 * Sends an email using Resend
 * Returns true if successful, false otherwise
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { to, template, replyTo } = options;

    // Validate email
    if (!to || !to.includes('@')) {
      console.error('[Email Service] Invalid email address:', to);
      return false;
    }

    // Check if Resend API key is configured
    const resend = getResend();
    if (!resend) {
      console.warn('[Email Service] RESEND_API_KEY not configured, skipping email');
      return false;
    }

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: replyTo || EMAIL_SUPPORT,
    });

    if (result.error) {
      console.error('[Email Service] Resend error:', result.error);
      return false;
    }

    console.log(`[Email Service] Email sent successfully to ${to} - ID: ${result.data?.id}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    return false;
  }
}

/**
 * Sends a batch of emails
 * Returns array of results (true/false for each email)
 */
export async function sendBatchEmails(emails: SendEmailOptions[]): Promise<boolean[]> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  return results.map(result =>
    result.status === 'fulfilled' ? result.value : false
  );
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  const testTemplate: EmailTemplate = {
    subject: '✅ Teste de Email - Organiza-te360',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #a855f7;">✅ Email Configurado com Sucesso!</h1>
        <p>Este é um email de teste do Organiza-te360.</p>
        <p>Se recebeste esta mensagem, o teu sistema de notificações está a funcionar perfeitamente!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Organiza-te360 - A tua plataforma de organização pessoal
        </p>
      </div>
    `,
    text: 'Email Configurado com Sucesso! Este é um email de teste do Organiza-te360.',
  };

  return await sendEmail({
    to: testEmail,
    template: testTemplate,
  });
}
