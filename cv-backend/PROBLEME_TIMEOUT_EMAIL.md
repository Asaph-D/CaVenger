# ⏱️ Problème de Timeout Email - Solutions

## Erreur : `ETIMEDOUT` lors de l'envoi d'email

Si vous voyez cette erreur :
```
❌ Erreur lors de l'envoi de l'email: Error: Timeout
code: 'ETIMEDOUT'
```

## Solutions

### 1. ✅ Timeouts augmentés (Déjà corrigé)

Les timeouts ont été augmentés de 5 secondes à :
- **Connection Timeout** : 60 secondes
- **Greeting Timeout** : 30 secondes  
- **Socket Timeout** : 60 secondes

### 2. Vérifier votre connexion internet

Le timeout peut être causé par :
- Une connexion internet lente ou instable
- Un réseau avec des restrictions (entreprise, école, etc.)

**Test** : Essayez depuis un autre réseau (ex: hotspot mobile)

### 3. Vérifier le firewall

Le port **587** (SMTP) peut être bloqué par :
- Le firewall Windows
- Un antivirus
- Un routeur/firewall réseau

**Solution** :
1. Vérifiez que le port 587 est ouvert
2. Ajoutez une exception dans votre firewall pour Node.js
3. Désactivez temporairement l'antivirus pour tester

### 4. Vérifier les paramètres Gmail

Assurez-vous que :
- ✅ L'authentification à 2 facteurs est activée
- ✅ Un mot de passe d'application a été généré
- ✅ Le mot de passe d'application est correct dans le `.env`

### 5. Tester avec un autre port

Si le port 587 ne fonctionne pas, essayez le port **465** (SSL) :

Dans votre fichier `.env` :
```env
EMAIL_PORT=465
```

Et dans `emailService.js`, changez :
```javascript
secure: true, // au lieu de false
```

### 6. Vérifier les logs détaillés

Pour voir plus de détails sur la connexion SMTP, modifiez temporairement `emailService.js` :

```javascript
debug: true, // au lieu de false
```

Cela affichera tous les échanges SMTP dans la console.

### 7. Alternative : Utiliser OAuth2 (avancé)

Si les mots de passe d'application ne fonctionnent pas, vous pouvez utiliser OAuth2 avec Gmail. Cela nécessite une configuration plus complexe.

### 8. Vérifier que Gmail autorise les "apps moins sécurisées"

**Note** : Cette option est obsolète pour Gmail, mais si vous utilisez un compte Google Workspace, vérifiez les paramètres d'administration.

## Test de connexion

Pour tester la connexion SMTP, vous pouvez utiliser ce script :

```javascript
// test-smtp.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD.replace(/\s+/g, '')
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Erreur:', error);
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des emails');
  }
});
```

Exécutez : `node test-smtp.js`

## Solutions rapides

1. **Redémarrer le serveur** après modification du `.env`
2. **Vérifier la connexion internet**
3. **Désactiver temporairement le firewall/antivirus**
4. **Essayer depuis un autre réseau**

## Si rien ne fonctionne

1. Vérifiez les logs détaillés avec `debug: true`
2. Testez avec le script `test-smtp.js`
3. Essayez un autre fournisseur email (Outlook, Yahoo, etc.)
4. Contactez le support si c'est un problème réseau












