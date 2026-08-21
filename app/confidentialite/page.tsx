import { SiteHeader } from "@/components/site-header"

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Politique de Confidentialité</h1>
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Collecte des Données Personnelles</h2>
            <p>
              Nous collectons les données nécessaires à l'instruction de vos démarches juridiques et administratives : nom, prénom, e-mail, numéro de téléphone, pièces d'identité, justificatifs de domicile et informations d'entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Finalités du Traitement</h2>
            <p>
              Les données collectées sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>L'exécution des démarches administratives auprès des autorités publiques béninoises.</li>
              <li>La constitution des dossiers d'entreprise et actes juridiques.</li>
              <li>La gestion de la relation client, des paiements et des notifications.</li>
              <li>Le respect de nos obligations légales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Sécurité et Durée de Conservation</h2>
            <p>
              Les documents sensibles (ex: casiers judiciaires, pièces d'identité) sont chiffrés et stockés de manière sécurisée. Nous appliquons le principe de minimisation et de purge périodique dès la finalisation du traitement conformément à la réglementation APDP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Vos Droits</h2>
            <p>
              Conformément à la législation sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données en contactant notre délégué à la protection des données à : <code>dpo@legaldoc.bj</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
