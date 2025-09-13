# API Documentation - Création de compte

## Endpoint: POST /api/auth/signup

**URL:** `http://localhost:3001/api/auth/signup`

### Méthode
```
POST
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON)
```json
{
  "email": "utilisateur@exemple.com",
  "password": "MonMotDePasse123",
  "fullName": "Nom Prénom"
}
```

### Réponse - Succès (201)
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "utilisateur@exemple.com",
    "fullName": "Nom Prénom"
  }
}
```

### Réponse - Erreur (400)
```json
{
  "error": "Email, mot de passe et nom complet requis"
}
```

### Réponse - Erreur (409)
```json
{
  "error": "Un compte avec cet email existe déjà"
}
```

## Validation des données

### Email
- Format valide requis (exemple@domaine.com)

### Mot de passe
- Minimum 6 caractères
- Au moins une minuscule
- Au moins une majuscule  
- Au moins un chiffre

### Nom complet
- Requis et non vide

## Exemples avec cURL

### Création d'un compte valide
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@forexci.com",
    "password": "AdminPass123",
    "fullName": "Administrateur Principal"
  }'
```

### Test avec données invalides
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email-invalide",
    "password": "123",
    "fullName": ""
  }'
```

## Notes importantes

- L'interface utilisateur ne permet plus la création de comptes
- Seuls les appels API directs (Postman, cURL, etc.) peuvent créer des comptes
- Après création, l'utilisateur peut se connecter normalement via l'interface
- Un cookie d'authentification est automatiquement défini après la création