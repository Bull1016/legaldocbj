import { SiteHeader } from "@/components/site-header"

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Mentions Légales</h1>
        <div className="bg-card p-8 rounded-xl border border-border shadow-sm space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Éditeur du Site</h2>
            <p>
              Le site <strong className="text-foreground">LegalDoc BJ</strong> est édité par la société LegalDoc BJ SARL, au capital social de 1 000 000 FCFA, immatriculée au RCCM de Cotonou sous le numéro RB/COT/24 B 38942, IFU : 3202415894210.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Siège social :</strong> Cotonou, Quartier Haie Vive, Lot 104, République du Bénin.<br />
              <strong className="text-foreground">Contact e-mail :</strong> contact@legaldoc.bj<br />
              <strong className="text-foreground">Téléphone :</strong> +229 97 00 00 00
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Directeur de la Publication</h2>
            <p>Le directeur de la publication est Monsieur Paul KOUAKOU, Gérant statutaire de LegalDoc BJ SARL.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Hébergement</h2>
            <p>Le site est hébergé par la société Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Propriété Intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présentés sur LegalDoc BJ sont protégés par le droit d&apos;auteur conformément aux dispositions de l&apos;OAPI et de la législation béninoise.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Protections des Données Personnelles (APDP)</h2>
            <p>
              Conformément au Code du Numérique en République du Bénin, LegalDoc BJ SARL s&apos;engage à respecter les principes de protection des données personnelles auprès de l&apos;APDP.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
