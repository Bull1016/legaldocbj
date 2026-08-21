import { db } from "@/lib/db"
import {
  user,
  documentType,
  documentField,
  company,
  resourceArticle,
  legalTemplate,
} from "@/lib/db/schema"

export async function seedDatabase() {
  console.log("Seeding database...")

  // Seed Document Types
  const existingDocTypes = await db.select().from(documentType)
  if (existingDocTypes.length === 0) {
    const [casier] = await db
      .insert(documentType)
      .values({
        name: "Casier Judiciaire (Bulletin n°3)",
        slug: "casier-judiciaire",
        description: "Extrait du casier judiciaire délivré par le Ministère de la Justice du Bénin.",
        category: "Administratif",
        price: 5000,
        createdBy: "system",
      })
      .returning()

    const [creation] = await db
      .insert(documentType)
      .values({
        name: "Création d'Entreprise (SARL / SUARL / Établissement)",
        slug: "creation-entreprise",
        description: "Pack complet d'immatriculation au RCCM, obtention du N° IFU, déclaration d'établissement et affichage légal.",
        category: "Création d'entreprise",
        price: 50000,
        createdBy: "system",
      })
      .returning()

    // Fields for creation
    await db.insert(documentField).values([
      {
        documentTypeId: creation.id,
        label: "Dénomination sociale de la société",
        fieldKey: "company_name",
        fieldType: "text",
        required: true,
        sortOrder: 1,
      },
      {
        documentTypeId: creation.id,
        label: "Forme Juridique retenue",
        fieldKey: "legal_form",
        fieldType: "select",
        options: JSON.stringify(["Établissement", "SUARL", "SARL", "SAS", "SA"]),
        required: true,
        sortOrder: 2,
      },
      {
        documentTypeId: creation.id,
        label: "Montant du Capital Social (FCFA)",
        fieldKey: "capital_amount",
        fieldType: "number",
        required: true,
        sortOrder: 3,
      },
      {
        documentTypeId: creation.id,
        label: "Copie de la pièce d'identité du gérant (CIP/Passeport)",
        fieldKey: "identity_doc",
        fieldType: "file",
        required: true,
        sortOrder: 4,
      },
    ])
  }

  // Seed Resources & Legal Templates
  const existingArticles = await db.select().from(resourceArticle)
  if (existingArticles.length === 0) {
    await db.insert(resourceArticle).values([
      {
        title: "Comment créer sa SARL au Bénin en 2026 : Le Guide Complet",
        slug: "guide-creation-sarl-benin-2026",
        category: "Guides Pratiques",
        summary: "Toutes les démarches, coûts et documents pour immatriculer votre entreprise au guichet APIEX.",
        content: "Détail complet du guide de création d'entreprise au Bénin conformément à l'Acte Uniforme OHADA...",
      },
      {
        title: "Optimisation Fiscale : Régime TPS vs Régime Réel au Bénin",
        slug: "optimisation-fiscale-tps-benin",
        category: "Fiscalité",
        summary: "Découvrez quel régime fiscal convient à votre chiffre d'affaires et évitez les redressements.",
        content: "Analyse comparative des régimes d'imposition applicables aux PME en République du Bénin...",
      },
    ])
  }

  console.log("Database seeded successfully!")
}
