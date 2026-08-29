import { SiteHeader } from "@/components/site-header"

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Conditions Générales d&apos;Utilisation (CGU)</h1>
        <div className="bg-card p-8 rounded-xl border border-border shadow-sm space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme LegalDoc BJ, guichet numérique d&apos;accompagnement juridique et administratif au Bénin et dans l&apos;espace OHADA.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Services proposés</h2>
            <p>
              LegalDoc BJ propose aux utilisateurs : la demande de documents administratifs, la création d&apos;entreprises, la gestion des formalités d&apos;entreprise, la mise à disposition de modèles juridiques, des services de conseil juridique et un suivi d&apos;obligations.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Responsabilité de l&apos;Utilisateur</h2>
            <p>
              L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de ses demandes et de la création de son compte. La transmission de pièces falsifiées entraîne la suspension immédiate du compte et d&apos;éventuelles poursuites juridiques.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Tarifs et Paiement</h2>
            <p>
              Les tarifs des prestations sont indiqués en Francs CFA (XOF) toutes taxes comprises. Les paiements s&apos;effectuent en ligne de manière sécurisée via Mobile Money (MTN / Moov) ou Carte bancaire à travers notre partenaire agréé FedaPay.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit béninois et au droit des affaires OHADA. En cas de litige, une solution amiable sera privilégiée avant toute action judiciaire devant les juridictions compétentes de Cotonou.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
