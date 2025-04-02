# Event Management Application

O aplicație completă pentru gestionarea evenimentelor, cu backend în Node.js și Express, folosind MongoDB ca bază de date.

## Funcționalități principale

- **Autentificare și Înregistrare**: Sistem complet de autentificare utilizatori cu verificare email
- **Gestionare evenimente**: Creare, editare, ștergere și vizualizare evenimente
- **Înregistrări la evenimente**: Sistem de înregistrare participanți cu gestionare bilete
- **Plăți**: Simulare procesare plăți cu gestionare status
- **Notificări**: Sistem de notificări pentru actualizări evenimente și confirmări
- **Panoul administratorului**: Gestionare utilizatori și permisiuni
- **Statistici organizator**: Vizualizare date despre evenimentele organizate

## Tehnologii utilizate

- **Backend**: Node.js, Express
- **Baza de date**: MongoDB cu Mongoose
- **Autentificare**: JWT (JSON Web Tokens)
- **Storage**: Cloudinary pentru imagini
- **Email**: Nodemailer pentru trimitere email-uri
- **Altele**: Multer, bcrypt, CORS

## Structura proiectului

```
backend/
  ├── src/
  │   ├── controllers/    # Logica de business organizată pe funcționalități
  │   ├── lib/            # Utilități și servicii (db, email, etc.)
  │   ├── middlewares/    # Middleware-uri pentru autentificare și protecție rute
  │   ├── models/         # Definire scheme Mongoose
  │   ├── routes/         # Definire rute API
  │   └── index.js        # Punctul de intrare al aplicației
  ├── package.json        # Dependențe și scripturi
  └── .env.example        # Template pentru variabilele de mediu
```

## Instalare și configurare

1. Clonează repository-ul
2. Instalează dependențele:
   ```
   cd backend
   npm install
   ```
3. Creează fișierul `.env` bazat pe `.env.example` și configurează variabilele de mediu:
   ```
   MONGODB_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=24h
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email
   SMTP_USER=your_email
   SMTP_PASS=your_password
   
   # App
   PORT=5001
   FRONTEND_URL=http://localhost:5000
   ```

4. Pornește serverul în modul de dezvoltare:
   ```
   npm run dev
   ```

## API Endpoints

### Autentificare
- `POST /api/auth/signup` - Înregistrare utilizator nou
- `POST /api/auth/login` - Autentificare utilizator
- `POST /api/auth/logout` - Delogare
- `POST /api/auth/verify-account` - Verificare cont prin token
- `POST /api/auth/send-verify-token` - Trimitere token de verificare
- `POST /api/auth/send-reset-token` - Trimitere token pentru resetare parolă
- `POST /api/auth/reset-password` - Resetare parolă

### Evenimente
- `GET /api/events` - Listare evenimente cu filtrare și paginare
- `GET /api/events/:id` - Detalii eveniment
- `POST /api/events/createEvent` - Creare eveniment nou
- `PUT /api/events/update/:id` - Actualizare eveniment
- `DELETE /api/events/deleteEvent/:id` - Ștergere eveniment
- `POST /api/events/save/:eventId` - Salvare/desalvare eveniment
- `GET /api/events/saved/:eventId` - Verificare eveniment salvat

### Înregistrări
- `POST /api/registrations/register` - Înregistrare la eveniment
- `GET /api/registrations/my-registrations` - Înregistrările utilizatorului
- `PUT /api/registrations/cancel/:registrationId` - Anulare înregistrare
- `GET /api/registrations/check/:eventId` - Verificare status înregistrare
- `GET /api/registrations/event/:eventId` - Toate înregistrările unui eveniment
- `PUT /api/registrations/update-status/:registrationId` - Actualizare status înregistrare

### Notificări
- `GET /api/notifications` - Toate notificările utilizatorului
- `PUT /api/notifications/:id/read` - Marcare notificare ca citită
- `PUT /api/notifications/read-all` - Marcare toate notificările ca citite
- `DELETE /api/notifications/:id` - Ștergere notificare

### Plăți
- `POST /api/payments/process` - Procesare plată
- `GET /api/payments/status/:registrationId` - Status plată

### Admin
- `GET /api/admin/users` - Listare utilizatori
- `GET /api/admin/users/:id` - Detalii utilizator
- `POST /api/admin/users` - Creare utilizator
- `PUT /api/admin/users/:id` - Actualizare utilizator
- `DELETE /api/admin/users/:id` - Ștergere utilizator
- `PATCH /api/admin/users/:id/status` - Schimbare status utilizator
- `POST /api/admin/users/:id/reset-password` - Resetare parolă utilizator
- `GET /api/admin/stats` - Statistici generale

### Statistici
- `GET /api/stats/organizer` - Statistici organizator

## Scheme de date

### User
- Date personale: email, nume, username, parolă, avatar
- Roluri: PARTICIPANT, ORGANIZER, ADMIN
- Status: ACTIVE, INACTIVE, SUSPENDED
- Profil participant și profil organizator
- Preferințe și setări

### Event
- Informații de bază: titlu, descriere, categorie
- Locație și date
- Prețuri și bilete
- Media: imagine copertă, galerie
- Status și vizibilitate

### Registration
- Relații: eveniment, participant
- Tip bilet și cantitate
- Status: PENDING, CONFIRMED, CANCELLED, ATTENDED
- Status plată: UNPAID, PAID, REFUNDED

### Notification
- Tip: event_invite, event_update, participation_confirmed, reminder
- Status: citit/necitit
- Relații: utilizator, eveniment

## Contribuții

Contribuțiile sunt binevenite! Verifică issues deschise sau creează unul nou pentru a discuta despre modificările pe care dorești să le faci.
