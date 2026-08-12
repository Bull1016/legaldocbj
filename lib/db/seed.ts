import "dotenv/config"
import { db, pool } from "./index"
import { user, documentType, documentField } from "./schema"
import { auth } from "../auth"
import { eq } from "drizzle-orm"

async function main() {
  console.log("🌱 Démarrage du seeder de la base de données...")

  const adminEmail = process.env.ADMIN_MAIL || "admin@legaldoc.bj"
  const adminPass = process.env.ADMIN_PASS || "Admin123456!"

  if (!process.env.ADMIN_MAIL || !process.env.ADMIN_PASS) {
    console.warn("⚠️  Attention: ADMIN_MAIL ou ADMIN_PASS non définis dans le fichier .env, utilisation des valeurs par défaut.")
  }

  // 1. Initialisation / Vérification de l'administrateur par défaut
  const [existingAdmin] = await db
    .select()
    .from(user)
    .where(eq(user.email, adminEmail))
    .limit(1)

  if (!existingAdmin) {
    console.log(`👤 Création du compte administrateur (${adminEmail})...`)
    try {
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPass,
          name: "Administrateur Système",
        },
      })
      console.log("✅ Compte administrateur créé dans Better Auth.")
    } catch (err) {
      console.error("❌ Erreur lors de l'inscription de l'admin via Better Auth:", err)
    }
  } else {
    console.log(`ℹ️  Le compte administrateur (${adminEmail}) existe déjà.`)
  }

  // S'assurer que le rôle est bien mis à jour sur "admin"
  await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, adminEmail))

  console.log(`👑 Rôle "admin" attribué et vérifié pour : ${adminEmail}`)

  // 2. Initialisation des types de documents de démonstration si aucun type n'existe
  const existingDocs = await db.select().from(documentType).limit(1)

  if (existingDocs.length === 0) {
    console.log("📑 Création des types de documents juridiques par défaut...")

    const defaultServices = [
      {
        name: "Extrait de Casier Judiciaire (Bulletin n° 3)",
        slug: "casier-judiciaire",
        description: "Demande officielle du bulletin n°3 du casier judiciaire au Bénin.",
        category: "Actes judiciaires",
        price: 2500, // 25.00 FCFA / cents
        active: true,
        createdBy: "system",
        fields: [
          { label: "Nom de famille", fieldKey: "nom", fieldType: "text", required: true, sortOrder: 1 },
          { label: "Prénoms", fieldKey: "prenoms", fieldType: "text", required: true, sortOrder: 2 },
          { label: "Date de naissance", fieldKey: "date_naissance", fieldType: "date", required: true, sortOrder: 3 },
          { label: "Lieu de naissance", fieldKey: "lieu_naissance", fieldType: "text", required: true, sortOrder: 4 },
          { label: "Pièce d'identité (CIP/CNI/Passeport)", fieldKey: "piece_identite", fieldType: "file", required: true, helpText: "Format PDF ou PNG/JPG", sortOrder: 5 },
          { label: "Acte de naissance", fieldKey: "acte_naissance", fieldType: "file", required: true, helpText: "Copie lisible de l'acte de naissance", sortOrder: 6 }
        ]
      },
      {
        name: "Certificat de Nationalité Béninoise",
        slug: "certificat-nationalite",
        description: "Demande d'établissement ou de renouvellement du certificat de nationalité.",
        category: "Actes civils",
        price: 3500,
        active: true,
        createdBy: "system",
        fields: [
          { label: "Nom complet", fieldKey: "nom_complet", fieldType: "text", required: true, sortOrder: 1 },
          { label: "Date & Lieu de naissance", fieldKey: "date_lieu_naissance", fieldType: "text", required: true, sortOrder: 2 },
          { label: "Filiation (Noms du père et de la mère)", fieldKey: "filiation", fieldType: "textarea", required: true, sortOrder: 3 },
          { label: "Acte de naissance sécurisé", fieldKey: "acte_naissance", fieldType: "file", required: true, sortOrder: 4 }
        ]
      },
      {
        name: "Certificat de Résidence",
        slug: "certificat-residence",
        description: "Attestation de domicile ou de résidence délivrée pour vos démarches.",
        category: "Attestations",
        price: 1500,
        active: true,
        createdBy: "system",
        fields: [
          { label: "Nom complet", fieldKey: "nom_complet", fieldType: "text", required: true, sortOrder: 1 },
          { label: "Adresse & Quartier", fieldKey: "adresse", fieldType: "textarea", required: true, sortOrder: 2 },
          { label: "Justificatif de domicile", fieldKey: "justificatif", fieldType: "file", required: true, helpText: "Quittance eau/électricité ou attestation de quartier", sortOrder: 3 }
        ]
      }
    ]

    for (const service of defaultServices) {
      const { fields, ...docData } = service
      const [insertedDoc] = await db.insert(documentType).values(docData).returning()

      if (insertedDoc && fields.length > 0) {
        for (const field of fields) {
          await db.insert(documentField).values({
            documentTypeId: insertedDoc.id,
            ...field
          })
        }
      }
      console.log(`   - Document créé : ${service.name}`)
    }
  }

  console.log("✨ Seeding terminé avec succès !")
  await pool.end()
  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Erreur critique lors du seeding:", err)
  process.exit(1)
})
