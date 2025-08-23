export default function Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Cookie‑policy</h1>
      <p className="mt-4 text-muted-foreground">
        Vi använder nödvändiga cookies för att driva tjänsten och analytiska
        cookies för att förbättra upplevelsen.
      </p>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Typer av cookies</h2>
        <ul className="list-disc pl-5 text-muted-foreground">
          <li>Nödvändiga cookies – krävs för inloggning och säkerhet</li>
          <li>
            Analytiska cookies – anonym statistik, kan avaktiveras i webbläsaren
          </li>
        </ul>
      </section>
      <p className="mt-8 text-sm text-muted-foreground">
        Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
      </p>
    </main>
  );
}
