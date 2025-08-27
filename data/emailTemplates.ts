export interface EmailElement {
  id: string;
  type: "text" | "image" | "button" | "divider" | "social";
  content?: string;
  src?: string;
  alt?: string;
  url?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  spacing?: "tight" | "normal" | "loose";
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "newsletter" | "promotional" | "announcement" | "event";
  thumbnail: string;
  elements: EmailElement[];
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // Newsletter Template
  {
    id: "newsletter-modern",
    name: "Modern nyhetsbrev",
    description: "Ett rent och professionellt nyhetsbrev för regelbunden kommunikation",
    category: "newsletter",
    thumbnail: "/templates/newsletter-modern.png",
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      text: "#1f2937",
      background: "#ffffff"
    },
    elements: [
      {
        id: "header",
        type: "text",
        content: `<div style="text-align: center; padding: 40px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <h1 style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0 0 8px 0;">Ditt företag</h1>
          <p style="font-size: 16px; color: #64748b; margin: 0;">Månatligt nyhetsbrev • ${new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}</p>
        </div>`,
        alignment: "center"
      },
      {
        id: "welcome",
        type: "text",
        content: `<div style="padding: 40px 20px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Hej {first_name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
            Välkommen till vårt månatliga nyhetsbrev. Här får du de senaste uppdateringarna, tipsen och nyheterna från oss.
          </p>
        </div>`,
        alignment: "left"
      },
      {
        id: "main-article-image",
        type: "image",
        src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop",
        alt: "Huvudartikel",
        alignment: "center"
      },
      {
        id: "main-article-text",
        type: "text",
        content: `<div style="padding: 0 20px 40px 20px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Huvudrubrik för månaden</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
            Detta är platsen för ditt huvudsakliga innehåll. Berätta om viktiga uppdateringar, lansera nya produkter eller dela värdefulla insikter med dina läsare.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
            Håll texten engagerande och lätt att läsa. Använd korta stycken och tydliga rubriker för bästa läsbarhet.
          </p>
        </div>`,
        alignment: "left"
      },
      {
        id: "cta-button",
        type: "button",
        text: "Läs mer på vår hemsida",
        url: "https://example.com",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
        alignment: "center"
      },
      {
        id: "divider",
        type: "divider"
      },
      {
        id: "secondary-content",
        type: "text",
        content: `<div style="padding: 40px 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0;">Andra nyheter</h3>
          <div style="display: grid; gap: 20px;">
            <div style="padding: 16px; border-left: 4px solid #2563eb; background-color: #f8fafc;">
              <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Tips för månaden</h4>
              <p style="font-size: 14px; line-height: 1.5; color: #374151; margin: 0;">
                Ett kort tips eller råd som kan vara värdefullt för dina läsare.
              </p>
            </div>
          </div>
        </div>`
      }
    ]
  },

  // Promotional Template
  {
    id: "promo-sale",
    name: "Kampanjerbjudande",
    description: "Perfekt för försäljningskampanjer och specialerbjudanden",
    category: "promotional",
    thumbnail: "/templates/promo-sale.png",
    colors: {
      primary: "#dc2626",
      secondary: "#fbbf24",
      text: "#1f2937",
      background: "#ffffff"
    },
    elements: [
      {
        id: "header-banner",
        type: "text",
        content: `<div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white;">
          <div style="display: inline-block; background-color: #fbbf24; color: #1f2937; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px;">
            BEGRÄNSAD TID
          </div>
          <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 8px 0;">50% RABATT</h1>
          <p style="font-size: 18px; margin: 0;">På alla produkter</p>
        </div>`,
        alignment: "center"
      },
      {
        id: "greeting",
        type: "text",
        content: `<div style="padding: 40px 20px 20px 20px; text-align: center;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Hej {first_name}!</h2>
          <p style="font-size: 18px; line-height: 1.5; color: #374151; margin: 0;">
            Vi har något speciellt för dig – vårt bästa erbjudande hittills!
          </p>
        </div>`
      },
      {
        id: "product-image",
        type: "image",
        src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        alt: "Produkt",
        alignment: "center"
      },
      {
        id: "product-showcase",
        type: "text",
        content: `<div style="padding: 20px;">
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Populära produkter</h3>
            <p style="font-size: 16px; color: #6b7280; margin: 0 0 20px 0; line-height: 1.5;">
              Upptäck vårt sortiment av högkvalitativa produkter, nu med 50% rabatt!
            </p>
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">
              <span style="text-decoration: line-through; color: #9ca3af; font-size: 18px;">1,999 kr</span>
              <span style="margin-left: 8px;">999 kr</span>
            </div>
          </div>
        </div>`
      },
      {
        id: "cta-primary",
        type: "button",
        text: "SHOPPA NU - 50% RABATT",
        url: "https://example.com/shop",
        backgroundColor: "#dc2626",
        textColor: "#ffffff",
        alignment: "center"
      },
      {
        id: "urgency",
        type: "text",
        content: `<div style="padding: 30px 20px; text-align: center; background-color: #fef3c7; border-radius: 8px; margin: 20px;">
          <p style="font-size: 16px; font-weight: 600; color: #d97706; margin: 0 0 8px 0;">⏰ Erbjudandet går ut snart!</p>
          <p style="font-size: 14px; color: #92400e; margin: 0;">Gäller endast till söndag 23:59</p>
        </div>`
      },
      {
        id: "social-proof",
        type: "text",
        content: `<div style="padding: 30px 20px; text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 16px 0;">⭐⭐⭐⭐⭐</p>
          <p style="font-style: italic; color: #374151; margin: 0;">"Fantastiska produkter och snabb leverans!" - Maria S.</p>
        </div>`
      }
    ]
  },

  // Announcement Template
  {
    id: "announcement-simple",
    name: "Enkelt meddelande",
    description: "Minimalistisk mall för viktiga meddelanden och uppdateringar",
    category: "announcement",
    thumbnail: "/templates/announcement-simple.png",
    colors: {
      primary: "#059669",
      secondary: "#6b7280",
      text: "#1f2937",
      background: "#ffffff"
    },
    elements: [
      {
        id: "logo-header",
        type: "text",
        content: `<div style="text-align: center; padding: 40px 20px;">
          <div style="width: 80px; height: 80px; background-color: #059669; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 32px; font-weight: bold;">L</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0;">Ditt företag</h1>
        </div>`,
        alignment: "center"
      },
      {
        id: "announcement-content",
        type: "text",
        content: `<div style="padding: 0 20px 40px 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 24px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #065f46; margin: 0 0 12px 0;">Viktig uppdatering</h2>
            <p style="font-size: 16px; color: #047857; margin: 0;">Datum: ${new Date().toLocaleDateString('sv-SE')}</p>
          </div>
          
          <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 0 0 20px 0;">Hej {first_name},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Vi vill informera dig om en viktig uppdatering som påverkar våra tjänster. Detta meddelande innehåller information som kan vara relevant för dig.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Här kan du beskriva vad som har förändrats, vilka fördelar detta innebär, eller vilka steg användaren behöver ta.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="font-size: 16px; font-weight: 500; color: #1f2937; margin: 0 0 8px 0;">Vad betyder detta för dig?</p>
            <ul style="font-size: 16px; color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Förbättrad användarupplevelse</li>
              <li>Ökad säkerhet och prestanda</li>
              <li>Nya funktioner och möjligheter</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: "cta-button",
        type: "button",
        text: "Läs mer",
        url: "https://example.com",
        backgroundColor: "#059669",
        textColor: "#ffffff",
        alignment: "center"
      },
      {
        id: "footer-info",
        type: "text",
        content: `<div style="padding: 40px 20px; text-align: center; border-top: 1px solid #e5e7eb; margin-top: 40px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
            Har du frågor? Vi hjälper gärna till.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin: 0;">
            Kontakta oss på support@dittforetag.se eller 08-123 456 78
          </p>
        </div>`
      }
    ]
  },

  // Event Invitation Template
  {
    id: "event-invitation",
    name: "Eventinbjudan",
    description: "Professionell mall för evenemang, webbinarier och möten",
    category: "event",
    thumbnail: "/templates/event-invitation.png",
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      text: "#1f2937",
      background: "#ffffff"
    },
    elements: [
      {
        id: "event-header",
        type: "text",
        content: `<div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 50px 20px; text-align: center;">
          <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 20px;">
            EXKLUSIV INBJUDAN
          </div>
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Du är inbjuden!</h1>
          <p style="font-size: 18px; opacity: 0.9; margin: 0;">Till vårt exklusiva evenemang</p>
        </div>`
      },
      {
        id: "personal-greeting",
        type: "text",
        content: `<div style="padding: 40px 20px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Hej {first_name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
            Vi är glada att kunna bjuda in dig till vårt kommande evenemang. Det blir en fantastisk möjlighet att lära sig något nytt och träffa likasinnade.
          </p>
        </div>`
      },
      {
        id: "event-details",
        type: "text",
        content: `<div style="padding: 0 20px 40px 20px;">
          <div style="background-color: #faf5ff; border: 2px solid #e9d5ff; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="font-size: 24px; font-weight: 700; color: #7c3aed; margin: 0 0 8px 0;">Digitalt marknadsföringsevent</h3>
              <p style="font-size: 16px; color: #6b46c1; margin: 0;">Lär dig de senaste strategierna och verktygen</p>
            </div>
            
            <div style="display: grid; gap: 20px; max-width: 400px; margin: 0 auto;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">📅</span>
                </div>
                <div>
                  <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 16px;">Fredag 15 mars 2024</p>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">13:00 - 16:00</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">📍</span>
                </div>
                <div>
                  <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 16px;">Online via Zoom</p>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">Länk skickas före eventet</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">🎫</span>
                </div>
                <div>
                  <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 16px;">Helt kostnadsfritt</p>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">Begränsat antal platser</p>
                </div>
              </div>
            </div>
          </div>
        </div>`
      },
      {
        id: "agenda",
        type: "text",
        content: `<div style="padding: 0 20px 40px 20px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; text-align: center;">Vad du kommer att lära dig</h3>
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="padding: 16px; border-left: 4px solid #7c3aed; background-color: #f3f4f6; margin-bottom: 12px;">
              <p style="font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">Moderna marknadsföringsstrategier</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Senaste trenderna inom digital marknadsföring</p>
            </div>
            <div style="padding: 16px; border-left: 4px solid #7c3aed; background-color: #f3f4f6; margin-bottom: 12px;">
              <p style="font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">Verktyg och automation</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Effektivisera dina marknadsföringsprocesser</p>
            </div>
            <div style="padding: 16px; border-left: 4px solid #7c3aed; background-color: #f3f4f6;">
              <p style="font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">Mätning och analys</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Förstå vad som fungerar och optimera</p>
            </div>
          </div>
        </div>`
      },
      {
        id: "rsvp-button",
        type: "button",
        text: "ANMÄL MIG NU",
        url: "https://example.com/rsvp",
        backgroundColor: "#7c3aed",
        textColor: "#ffffff",
        alignment: "center"
      },
      {
        id: "speaker-info",
        type: "text",
        content: `<div style="padding: 40px 20px; background-color: #f8fafc;">
          <div style="max-width: 400px; margin: 0 auto; text-align: center;">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Talare" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px auto; display: block;" />
            <h4 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Magnus Andersson</h4>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">Digital marknadsföringsexpert</p>
            <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
              Med över 10 års erfarenhet inom digital marknadsföring hjälper Magnus företag att växa online.
            </p>
          </div>
        </div>`
      }
    ]
  }
];

export const getTemplatesByCategory = (category?: string) => {
  if (!category) return EMAIL_TEMPLATES;
  return EMAIL_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return EMAIL_TEMPLATES.find(template => template.id === id);
};