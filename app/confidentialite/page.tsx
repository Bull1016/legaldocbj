import { SiteHeader } from "@/components/site-header"

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Politique de Confidentialité</h1>
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Responsable du Traitement & Bases Légales</h2>
            <p>
              Le responsable du traitement des données personnelles est la société <strong>LegalDoc BJ SARL</strong>. Les traitements de données reposent sur l'exécution du contrat de prestation de service (gestion des démarches juridiques), le respect des obligations légales (lutte contre le blanchiment et conformité fiscale/commerciale) et le consentement explicite des utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Collecte, Destinataires & Transferts Internationaux</h2>
            <p>
              Nous collectons les données nécessaires à l'instruction de vos démarches : nom, prénom, e-mail, téléphone, pièces d'identité, justificatifs de domicile et informations d'entreprise.
            </p>
            <p className="mt-2">
              Les destinataires et sous-traitants autorisés incluent :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Vercel Blob Storage :</strong> Hébergement et stockage sécurisé des documents joints et fichiers téléversés.</li>
              <li><strong>FedaPay :</strong> Traitement hautement sécurisé des transactions de paiement électronique et mobile money.</li>
              <li><strong>Resend :</strong> Envoi des notifications de suivi par courrier électronique.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              Les transferts hors du Bénin/UEMOA vers nos prestataires cloud s'effectuent sous garanties appropriées (clauses contractuelles types et chiffrement TLS en transit).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Sécurité du Stockage et Durées de Conservation</h2>
            <p>
              Les fichiers téléversés sur Vercel Blob sont associés à des URLs d'accès contrôlées. La plateforme met en œuvre un contrôle d'accès strict par session authentifiée, l'HTTPS obligatoire et un suivi d'audit d'accès.
            </p>
            <p className="mt-2">
              Les durées de conservation des données par catégorie s'établissent comme suit :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Pièces justificatives et fichiers de démarches :</strong> Conservés pendant 5 ans après la fin de la prestation commerciale conformément aux obligations comptables et fiscales.</li>
              <li><strong>Données de compte utilisateur :</strong> Conservées jusqu'à la fermeture du compte ou 3 ans après la dernière activité.</li>
              <li><strong>Historique des transactions de paiement :</strong> Conservé 10 ans en conformité avec le droit commercial OHADA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Vos Droits et Contact APDP</h2>
            <p>
              Conformément au Code du Numérique du Bénin et à la réglementation APDP, vous disposez des droits d'accès, de rectification, de portabilité, d'opposition et de suppression de vos données. Pour exercer ces droits, contactez notre Délégué à la Protection des Données (DPO) à : <code>dpo@legaldoc.bj</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
