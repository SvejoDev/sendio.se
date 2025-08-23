export default function Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Personuppgiftsbiträdesavtal (DPA)
      </h1>
      <p className="mt-4 text-muted-foreground">
        Detta personuppgiftsbiträdesavtal ("Avtalet") reglerar hur Sendio
        behandlar personuppgifter för kundens räkning i enlighet med
        dataskyddsförordningen (GDPR).
      </p>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Roller och ansvar</h2>
        <p className="text-muted-foreground">
          Kunden är personuppgiftsansvarig och Sendio är personuppgiftsbiträde.
          Sendio behandlar endast personuppgifter enligt dokumenterade
          instruktioner från kunden.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Säkerhet</h2>
        <p className="text-muted-foreground">
          Sendio vidtar lämpliga tekniska och organisatoriska åtgärder för att
          säkerställa en säkerhetsnivå som är lämplig i förhållande till risken,
          inklusive åtkomstkontroller, loggning och kryptering där så är
          relevant.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Underbiträden</h2>
        <p className="text-muted-foreground">
          Sendio kan anlita underbiträden. Kunden informeras om förändringar och
          har rätt att invända.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Rättigheter och incidenter</h2>
        <p className="text-muted-foreground">
          Sendio bistår kunden med att svara på registrerades begäranden och
          rapporterar personuppgiftsincidenter utan onödigt dröjsmål.
        </p>
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Gallring och återlämning</h2>
        <p className="text-muted-foreground">
          Efter Avtalets upphörande raderas eller återlämnas personuppgifter
          enligt kundens instruktioner.
        </p>
      </section>
      <p className="mt-8 text-sm text-muted-foreground">
        Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
      </p>
    </main>
  );
}
