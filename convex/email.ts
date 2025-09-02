import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Generate HTML email from elements
function generateEmailHTML(
  elements: any[],
  subject: string,
  fromName: string,
  firstName?: string,
  lastName?: string
): string {
  const replaceVariables = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/{first_name}/gi, firstName || "")
      .replace(/{last_name}/gi, lastName || "");
  };

  let bodyHTML = "";
  
  for (const element of elements) {
    switch (element.type) {
      case "text":
        const content = replaceVariables(element.content || "");
        bodyHTML += `<div style="text-align: ${element.align || 'left'}; font-size: ${element.fontSize || '16px'}; color: ${element.color || '#000000'}; margin-bottom: 16px;">${content}</div>`;
        break;
        
      case "image":
        bodyHTML += `<div style="text-align: ${element.align || 'center'}; margin-bottom: 16px;">
          <img src="${element.src}" alt="${element.alt || ''}" style="max-width: 100%; width: ${element.width || '100%'}; height: auto;" />
        </div>`;
        break;
        
      case "button":
        bodyHTML += `<div style="text-align: ${element.align || 'center'}; margin: 20px 0;">
          <a href="${element.url || '#'}" style="display: inline-block; padding: ${element.size === 'small' ? '8px 16px' : element.size === 'large' ? '16px 32px' : '12px 24px'}; background-color: ${element.backgroundColor || '#2563eb'}; color: ${element.textColor || '#ffffff'}; text-decoration: none; border-radius: ${element.cornerRadius || '6px'}px; font-size: ${element.size === 'small' ? '14px' : element.size === 'large' ? '18px' : '16px'}; font-weight: 600;">
            ${replaceVariables(element.text || '')}
          </a>
        </div>`;
        break;
        
      case "divider":
        bodyHTML += `<hr style="border: none; border-top: ${element.thickness || 1}px ${element.style || 'solid'} ${element.color || '#e5e7eb'}; margin: ${element.spacing || 20}px 0; width: ${element.width || 100}%;" />`;
        break;
        
      case "social":
        if (element.platforms && element.platforms.length > 0) {
          bodyHTML += `<div style="text-align: center; margin: 20px 0;">`;
          for (const platform of element.platforms) {
            bodyHTML += `<a href="${platform.url}" style="display: inline-block; margin: 0 8px; font-size: 24px;">${platform.name}</a>`;
          }
          bodyHTML += `</div>`;
        }
        break;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVariables(subject)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .email-header { background-color: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .email-body { padding: 24px; background-color: #ffffff; }
    .email-footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    a { color: #2563eb; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 16px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-body">
      ${bodyHTML}
    </div>
    <div class="email-footer">
      <p>Du får detta meddelande eftersom du har samtyckt till att ta emot e-post från oss.</p>
      <p>
        <a href="https://sendio.se/u/UNSUBSCRIBE_TOKEN">Avregistrera dig här</a> | 
        <a href="https://sendio.se/legal/integritetspolicy">Integritetspolicy</a>
      </p>
      <p>${fromName} • Sverige</p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

// Send test email
export const sendTestEmail = action({
  args: {
    toEmail: v.string(),
    subject: v.string(),
    fromName: v.string(),
    replyTo: v.optional(v.string()),
    elements: v.array(v.any()),
    testContact: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
    })
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    messageId: v.optional(v.string())
  }),
  handler: async (ctx, args) => {
    try {
      // Check if we have environment variables for email sending
      const RESEND_API_KEY = process.env.AUTH_RESEND_KEY;
      
      if (!RESEND_API_KEY) {
        return {
          success: false,
          message: "E-postkonfiguration saknas. Kontakta support."
        };
      }

      // Generate HTML email
      const html = generateEmailHTML(
        args.elements,
        args.subject,
        args.fromName,
        args.testContact.firstName,
        args.testContact.lastName
      );

      // Replace variables in subject
      const processedSubject = args.subject
        .replace(/{first_name}/gi, args.testContact.firstName || "")
        .replace(/{last_name}/gi, args.testContact.lastName || "");

      // Send email using Resend (since it's already configured)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${args.fromName} <noreply@sendio.se>`,
          to: args.toEmail,
          subject: processedSubject,
          html: html,
          reply_to: args.replyTo || undefined,
          headers: {
            'X-Campaign-Type': 'test',
            'X-Sendio-Test': 'true'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to send test email:", data);
        return {
          success: false,
          message: data.message || "Kunde inte skicka test-e-post. Försök igen senare."
        };
      }

      // Log the test send
      await ctx.runMutation(internal.email.logTestSend, {
        toEmail: args.toEmail,
        subject: processedSubject,
        fromName: args.fromName,
        messageId: data.id,
        sentAt: Date.now()
      });

      return {
        success: true,
        message: `Test-e-post skickat till ${args.toEmail}`,
        messageId: data.id
      };
    } catch (error) {
      console.error("Error sending test email:", error);
      return {
        success: false,
        message: "Ett fel uppstod vid sändning av test-e-post."
      };
    }
  }
});

// Log test email send
export const logTestSend = internalMutation({
  args: {
    toEmail: v.string(),
    subject: v.string(),
    fromName: v.string(),
    messageId: v.optional(v.string()),
    sentAt: v.number()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // In a real app, you would log this to a table
    console.log("Test email sent:", args);
    return null;
  }
});