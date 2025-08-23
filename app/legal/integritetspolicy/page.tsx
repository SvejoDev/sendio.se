export default function Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Integritetspolicy</h1>
      <p className="mt-4 text-muted-foreground">
        Denna integritetspolicy beskriver hur Sendio samlar in, använder och
        skyddar personuppgifter i enlighet med GDPR.
      </p>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Personuppgifter vi behandlar</h2>
        <p className="text-muted-foreground">
          Vi behandlar kontaktuppgifter (namn, e‑post, telefon) och uppgifter
          relaterade till kampanjer och kundkommunikation.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Rättslig grund</h2>
        <p className="text-muted-foreground">
          Behandlingen sker med stöd av avtal, berättigat intresse eller
          samtycke där så krävs.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Lagringstid</h2>
        <p className="text-muted-foreground">
          Personuppgifter sparas inte längre än nödvändigt för att uppfylla
          ändamålen och lagkrav.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Dina rättigheter</h2>
        <p className="text-muted-foreground">
          Du har rätt till tillgång, rättelse, radering, begränsning och
          dataportabilitet. Kontakta oss vid frågor.
        </p>
      </section>
      <p className="mt-8 text-sm text-muted-foreground">
        Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
      </p>
    </main>
  );
}
