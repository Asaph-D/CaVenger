# 🔄 Alternative : Utiliser le port 465 (SSL) au lieu de 587

Si le port 587 (STARTTLS) cause des timeouts, essayez le port 465 (SSL).

## Modification du fichier .env

Changez dans `cv-backend/.env` :

```env
EMAIL_PORT=465
```

## Modification du code

Dans `cv-backend/src/services/emailService.js`, ligne 46, changez :

```javascript
secure: true, // au lieu de false pour le port 465
```

Puis redémarrez le serveur.










