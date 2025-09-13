# Documentation Prisma pour ForexCI

## 🚀 Setup terminé !

Prisma est maintenant configuré dans votre application avec :
- **Base de données** : SQLite (fichier `prisma/dev.db`)
- **Schéma** : `prisma/schema.prisma`
- **Client** : Instance réutilisable dans `lib/prisma.ts`

## 📖 Comment utiliser Prisma

### 1. 🎯 Lancer Prisma Studio (Interface graphique pour voir vos tables)

```bash
npx prisma studio
```

Cela ouvrira une interface web sur `http://localhost:5555` où vous pourrez :
- Voir toutes vos tables
- Ajouter/modifier/supprimer des données
- Explorer les relations

### 2. 📝 Ajouter une table au schéma

Editez le fichier `prisma/schema.prisma` et ajoutez vos modèles. Exemple :

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  company   String?
  role      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Client {
  id          Int      @id @default(autoincrement())
  name        String
  email       String?
  phone       String?
  address     String?
  company     String?
  status      String   @default("ACTIVE") // ACTIVE, INACTIVE, PROSPECT
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  materials   Material[]
  actions     Action[]
}

model Material {
  id          Int      @id @default(autoincrement())
  name        String
  brand       String?
  model       String?
  serialNumber String? @unique
  status      String   @default("ACTIVE") // ACTIVE, MAINTENANCE, OUT_OF_ORDER
  lastCheck   DateTime?
  nextCheck   DateTime?
  clientId    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  actions     Action[]
}

model Action {
  id          Int      @id @default(autoincrement())
  type        String   // MAINTENANCE, REPAIR, INSTALLATION, VISIT
  title       String
  description String?
  status      String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  scheduledAt DateTime?
  completedAt DateTime?
  clientId    Int
  materialId  Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  client      Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  material    Material? @relation(fields: [materialId], references: [id], onDelete: SetNull)
}
```

### 3. 🔄 Appliquer les changements (Migrations)

Après avoir modifié le schéma, lancez :

```bash
# Créer et appliquer une migration
npx prisma migrate dev --name add_tables

# Ou si vous voulez juste synchroniser sans créer de migration
npx prisma db push
```

### 4. 🔧 Générer le client TypeScript

À chaque modification du schéma :

```bash
npx prisma generate
```

### 5. 💻 Utiliser Prisma dans votre code

Dans vos composants ou API routes :

```typescript
import { prisma } from '@/lib/prisma'

// Exemple dans une API route (app/api/clients/route.ts)
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        materials: true,
        actions: true
      }
    })
    return Response.json(clients)
  } catch (error) {
    return Response.json({ error: 'Erreur lors de la récupération des clients' }, { status: 500 })
  }
}

// Exemple pour créer un client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company
      }
    })
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: 'Erreur lors de la création du client' }, { status: 500 })
  }
}
```

## 📋 Commandes utiles

```bash
# Voir le statut de la base de données
npx prisma migrate status

# Voir les données en mode console
npx prisma studio

# Reset complet de la base (ATTENTION: efface toutes les données)
npx prisma migrate reset

# Générer des données de test (seed)
npx prisma db seed

# Formater le schéma
npx prisma format

# Valider le schéma
npx prisma validate
```

## 🔍 Exemples d'utilisation dans l'app

1. **Page liste clients** : Récupérer tous les clients avec leurs matériels
2. **Dashboard** : Compter les actions en cours, clients actifs, etc.
3. **Calendrier** : Récupérer les actions planifiées par date
4. **Fiche client** : Afficher un client avec tous ses matériels et historique

## 🏗️ Structure des fichiers Prisma

```
prisma/
├── schema.prisma          # Schéma de votre base de données
├── migrations/            # Historique des migrations
│   └── 20240913_init/     # Chaque migration avec timestamp
├── dev.db                 # Votre base SQLite (créée automatiquement)
└── dev.db-journal         # Fichier temporaire SQLite

lib/
└── prisma.ts             # Instance réutilisable du client Prisma
```

## 🔐 Bonnes pratiques

1. **Toujours utiliser** `npx prisma migrate dev` après modification du schéma
2. **Ne jamais éditer** directement les fichiers de migration
3. **Utiliser l'instance** `prisma` de `lib/prisma.ts` dans tout votre code
4. **Ajouter `.env`** à votre `.gitignore` (déjà fait)
5. **Backup régulier** de votre fichier `dev.db` en développement

## 🚀 Prêt à commencer !

Votre setup Prisma est maintenant complet. Vous pouvez :

1. Lancer `npx prisma studio` pour voir l'interface graphique
2. Ajouter vos modèles dans `schema.prisma`
3. Lancer `npx prisma migrate dev --name nom_migration` 
4. Commencer à utiliser Prisma dans vos composants !