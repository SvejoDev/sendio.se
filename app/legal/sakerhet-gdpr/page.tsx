export default function Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Säkerhet & GDPR</h1>
      <p className="mt-4 text-muted-foreground">
        Vi bygger Sendio med säkerhet och dataskydd som grund. Plattformen är
        utformad för att uppfylla GDPR och bästa praxis för säkerhet.
      </p>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Dataplacering</h2>
        <p className="text-muted-foreground">
          All e‑post levereras via EU‑endpoints. Data lagras inom EU där så är
          möjligt.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Åtkomst och loggning</h2>
        <p className="text-muted-foreground">
          Rollbaserad åtkomstkontroll, revisionsloggar och principen om minsta
          privilegium.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Rättigheter för registrerade</h2>
        <p className="text-muted-foreground">
          Inbyggt stöd för avregistrering, export och radering av data.
        </p>
      </section>
    </main>
  );
}
