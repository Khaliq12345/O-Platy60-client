import nodemailer from "nodemailer";

function generateEmailHtml(
  title: string,
  description: string,
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>O-Platy-60 - Email</title>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f9fafb; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="650" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">

                    <!-- HEADER O-Platy-60 ROUGE SOMBRE -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="color: #fca5a5; font-size: 42px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -1px; text-transform: uppercase;">O-Platy-60</h1>
                            <p style="color: #dc2626; font-size: 16px; font-weight: 600; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Système de Gestion</p>
                        </td>
                    </tr>

                    <!-- LIGNE DE SÉPARATION -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 0 40px;">
                            <div style="height: 3px; background: linear-gradient(90deg, #7f1d1d, #dc2626); margin: 30px 0; border-radius: 2px;"></div>
                        </td>
                    </tr>

                    <!-- CONTENU -->
                    <tr>
                        <td style="padding: 40px 50px; background-color: #ffffff;">

                            <h2 style="color: #7f1d1d; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; border-bottom: 2px solid #fecaca; padding-bottom: 10px;">
                                ${escapeHtml(title)}
                            </h2>

                            <div style="background: linear-gradient(to right, #fef2f2 0%, #ffffff 100%); border-left: 5px solid #dc2626; padding: 25px; margin: 25px 0; border-radius: 8px;">
                                <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0; font-weight: 400;">
                                    ${escapeHtml(description).replace(/\n/g, "<br>")}
                                </p>
                            </div>

                            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 40px 0 0 0; padding-top: 30px; border-top: 1px dashed #e5e7eb;">
                                Cordialement,<br/>
                                <strong style="color: #7f1d1d; font-size: 18px;">L'équipe O-Platy-60</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background: linear-gradient(to bottom, #450a0a 0%, #7f1d1d 100%); padding: 25px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="color: #fca5a5; font-size: 14px; margin: 0; font-weight: 500;">
                                © 2026 O-Platy-60. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Fonction simple d'échappement HTML pour éviter injection XSS dans l'email
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig();
    const { title, description, userMail } = body;
  
    const transporter = nodemailer.createTransport({
      host: config.public.smtpServer,
      port: Number(config.public.smtpPort),
      secure: false,
      auth: {
        user: config.public.smtpUser,
        pass: config.public.smtpPassword,
      },
    });
  
    try {
      const toEmail = "contact@tech2work.tech";
      const info = await transporter.sendMail({ 
        from: `"O-Platy-60 Support" <${config.public.smtpUser}>`,
        replyTo: userMail,
        to: toEmail,
        subject: `[Support] ${title}`,
        text: description,
        html: generateEmailHtml(title, description),
      });
  
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error(err);
      return {
        success: false,
        error: err.message,
      };
    }
  });