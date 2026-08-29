# LegalDoc BJ - Plateforme de Démarches Administratives Simples & Sécurisées

LegalDoc BJ est une plateforme web moderne inspirée de Legalstart, permettant aux citoyens et aux entreprises d'effectuer leurs démarches administratives officielles en ligne de manière simple, rapide et entièrement sécurisée (ex: demande de casier judiciaire, certificat de nationalité, etc.).

La plateforme intègre un espace client intuitif, un back-office administratif robuste, et une gestion avancée des rôles utilisateurs (RBAC) connectée à une base de données PostgreSQL.

---

## 🚀 Technologies & Architecture

Le projet est conçu avec des technologies modernes et performantes :

- **Next.js (App Router)** : Framework React optimisé avec le rendu côté serveur (SSR), les Server Actions sécurisées et la compilation Turbopack.
- **Drizzle ORM** : Query builder TypeScript performant et léger pour interagir de manière type-safe avec PostgreSQL via un pool de connexions `pg`.
- **Better Auth** : Système d'authentification robuste et sécurisé gérant les comptes e-mail/mot de passe, les sessions sécurisées et la protection contre les attaques CSRF.
- **Tailwind CSS (v4)** : Charte graphique soignée, moderne et entièrement responsive.
- **Shadcn/ui** : Composants d'interface utilisateur soignés et accessibles.
- **Vercel Blob** : Gestion des téléversements de documents et pièces jointes des clients de manière sécurisée.

---

## ✨ Fonctionnalités Clés

### 👤 Espace Client (Public & `/dashboard`)
- **Catalogue interactif** : Consultation des démarches disponibles, tarifs associés, et pièces justificatives requises.
- **Inscription & Connexion** : Création de compte sécurisée.
- **Création de demandes** : Formulaires de démarches dynamiques qui s'adaptent selon les besoins définis par l'administration.
- **Téléversement de pièces jointes** : Envoi de documents justificatifs (format image, PDF, etc.) sécurisé par Vercel Blob.
- **Gestion des brouillons** : Possibilité d'enregistrer une demande en brouillon et de la soumettre ultérieurement.
- **Suivi en temps réel** : Historique complet de la demande et des commentaires d'agents visibles directement depuis l'espace personnel.

### 👔 Espace Back-Office Professionnel (`/admin`)
L'accès au back-office est protégé par une sécurité stricte au niveau du serveur. Seuls les utilisateurs ayant le rôle `agent` ou `admin` peuvent y accéder.

1. **Tableau de bord de vue d'ensemble** :
   - Cartes statistiques de performance (demandes à traiter, dossiers terminés, demandes d'infos, nombre d'utilisateurs inscrits).
   - Raccourcis rapides d'administration.
   - Liste des dernières demandes soumises pour un traitement prioritaire.

2. **Gestion des demandes (`/admin/demandes`)** :
   - Liste complète de toutes les démarches soumises sur la plateforme.
   - **Détails de la demande** : Visualisation des informations saisies par le client, téléchargement direct des fichiers joints et historique complet des événements.
   - **Assignation d'un agent** : Possibilité d'attribuer une demande spécifique à un agent ou à un administrateur en charge de son traitement.
   - **Mise à jour du statut** : Modification du statut du dossier (*En traitement*, *Infos requises*, *Terminée*, *Rejetée*) accompagnée d'un message explicatif destiné au client.

3. **Gestion des rôles utilisateurs (`/admin/utilisateurs` - Admin uniquement)** :
   - Liste globale des utilisateurs inscrits.
   - Modification en temps réel du rôle d'un utilisateur (passage de `client` à `agent` ou `admin`) via une interface sécurisée.
   - Protection de sécurité empêchant de modifier son propre rôle pour éviter les blocages accidentels.

4. **Gestion des démarches et formulaires dynamiques (`/admin/demarches` - Admin uniquement)** :
   - **Création & Édition** : Ajout ou modification des démarches du catalogue public (Nom, Slug URL unique, description, catégorie, prix).
   - **Éditeur de formulaires** : Création, ordonnancement et suppression des champs requis pour chaque démarche directement depuis l'interface (supporte les textes courts, textes longs, dates, nombres, listes déroulantes et fichiers joints).

---

## 🔐 Modèle de Rôles (RBAC)

Les permissions de sécurité sont centralisées dans `lib/roles.ts` :

- **client** : Peut créer et suivre uniquement ses propres demandes.
- **agent** : Peut accéder au back-office, consulter l'ensemble des demandes du système, changer le statut des dossiers et s'assigner des tâches. Ne peut pas modifier les rôles ni ajouter/modifier de démarches.
- **admin** : Possède un accès de contrôle total sur la plateforme (gestion des utilisateurs, changement de rôles, création et configuration des types de documents/champs).

---

## ⚙️ Configuration & Installation

### 1. Variables d'environnement
Créez un fichier `.env` à la racine du projet (sur la base de `.env.exemple`) et définissez l'ensemble des clés suivantes :

```env
# Environnement & URL de l'application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Connexion à la base de données PostgreSQL
DATABASE_URL="postgres://utilisateur:motdepasse@localhost:5432/nom_base"

# Authentification (Better Auth)
BETTER_AUTH_SECRET="une_cle_secrete_tres_longue_et_aleatoire"
BETTER_AUTH_URL="http://localhost:3000"

# Identifiants de l'administrateur initial
ADMIN_MAIL="admin@legaldoc.bj"
ADMIN_PASS="mot_de_passe_admin_securise"

# Vercel Blob (Téléversement de documents)
BLOB_STORE_ID="votre_store_id"
BLOB_READ_WRITE_TOKEN="votre_token_vercel_blob"

# Configuration FedaPay (Paiements Mobile Money / Carte)
FEDAPAY_ENVIRONMENT="sandbox" # "sandbox" ou "live"
FEDAPAY_SECRET_KEY="sk_sandbox_votre_cle_secrete"
FEDAPAY_WEBHOOK_SECRET="wh_votre_cle_secrete_webhook"

# Service d'envoi d'e-mails (Resend - Optionnel, fallback console si non renseigné)
RESEND_API_KEY="re_votre_cle_api_resend"
EMAIL_FROM="LegalDoc BJ <noreply@legaldoc.bj>"

# Tâches récurrentes (Vercel Cron - Rétention de données)
CRON_SECRET="une_valeur_secrete_longue_et_aleatoire"
```

### 2. Lancer le projet localement

Installez d'abord les dépendances :
```bash
pnpm install
```

Générez la base de données PostgreSQL et appliquez vos schémas à l'aide de vos scripts d'ORM ou de vos migrations, puis lancez le serveur de développement :
```bash
pnpm run dev
```
L'application est maintenant accessible sur `http://localhost:3000`.

### 3. Builder pour la production

Pour vérifier les types TypeScript et compiler l'application de manière optimisée pour la production :
```bash
pnpm run build
```

Pour démarrer le serveur de production compilé :
```bash
pnpm run start
```
