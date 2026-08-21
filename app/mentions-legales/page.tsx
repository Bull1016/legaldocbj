import { SiteHeader } from "@/components/site-header"

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Mentions Légales</h1>
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Éditeur du Site</h2>
            <p>
              Le site <strong>LegalDoc BJ</strong> est édité par la société LegalDoc BJ SARL, au capital de 1 000 000 FCFA, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Cotonou sous le numéro RB/COT/24 B 12345, IFU : 3202412345678.
            </p>
            <p className="mt-2">
              <strong>Siège social :</strong> Cotonou, Haie Vive, République du Bénin.<br />
              <strong>Contact e-mail :</strong> contact@legaldoc.bj<br />
              <strong>Téléphone :</strong> +229 21 00 00 00
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Directeur de la Publication</h2>
            <p>Le directeur de la publication est le représentant légal de LegalDoc BJ SARL.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Hébergement</h2>
            <p>
              Le site est hébergé par la société Vercel Inc., située au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Propriété Intellectuelle</h2>
            <p>
              L'ensemble des contenus (textes, logos, éléments graphiques, modèles de documents) présentés sur la plateforme LegalDoc BJ sont protégés par le droit d'auteur et la propriété intellectuelle conformément aux dispositions du droit de l'OAPI et de la législation béninoise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Protections des Données Personnelles (APDP)</h2>
            <p>
              Conformément au Code du Numérique en République du Bénin, les traitements de données à caractère personnel réalisés sur la plateforme sont déclarés et conformes aux exigences de l'Autorité de Protection des Données Personnelles (APDP).
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
