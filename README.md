# 🏨 Hotel Management System (Django)

Une application web complète de gestion hôtelière développée avec **Django** et **Django REST Framework**, permettant la gestion des hôtels, chambres, réservations, utilisateurs et paiements.

---

## 📌 Description

Ce projet a pour objectif de digitaliser la gestion des hôtels en proposant :

- 🏨 Gestion des hôtels
- 🛏️ Gestion des chambres
- 📅 Système de réservation
- ❤️ Gestion des favoris
- ⭐ Système d’avis (reviews)
- 🔐 Authentification sécurisée (JWT / Session)
- 👤 Gestion des utilisateurs (Client, Directeur, Admin)

L'application peut être utilisée comme backend API pour une application frontend (React, mobile, etc.).

---

## 🚀 Fonctionnalités principales

### 🔐 Authentification
- Inscription / Connexion
- Authentification JWT
- Gestion des permissions
- Rôles utilisateurs (Client, Directeur, Admin)

### 🏨 Gestion des hôtels
- Ajouter / Modifier / Supprimer un hôtel
- Upload d’images
- Gestion des équipements
- Activation / Désactivation

### 🛏️ Gestion des chambres
- Types de chambres
- Prix par nuit
- Disponibilité
- Capacité

### 📅 Réservations
- Création de réservation
- Vérification automatique de disponibilité
- Changement de statut (Pending, Confirmed, Cancelled)
- Historique des réservations

### ⭐ Avis & Notes
- Laisser un avis après réservation
- Calcul de la note moyenne
- Distribution des notes

### ❤️ Favoris
- Ajouter un hôtel en favori
- Retirer des favoris
- Liste des hôtels favoris d’un utilisateur

---

## 🛠️ Technologies utilisées

- Python 3.x
- Django
- Django REST Framework
- PostgreSQL / MySQL / SQLite
- JWT Authentication
- Pillow (gestion des images)
- CORS Headers

---

## 📂 Structure du projet

```bash
hotel-management/
│
├── manage.py
├── hotel_management/        # Configuration principale Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── accounts/                # Gestion des utilisateurs
├── hotels/                  # Gestion des hôtels
├── rooms/                   # Gestion des chambres
├── reservations/            # Gestion des réservations
├── reviews/                 # Gestion des avis
├── favorites/               # Gestion des favoris
│
├── media/                   # Images uploadées
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/ThierryMeyeul/hotel-management.git
cd hotel-management
```

---

### 2️⃣ Créer un environnement virtuel

```bash
python -m venv env
```

Activation :

- Windows :
```bash
env\Scripts\activate
```

- Linux / Mac :
```bash
source env/bin/activate
```

---

### 3️⃣ Installer les dépendances

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Configurer la base de données

Modifier `settings.py` :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hotel_management',
        'USER': 'postgres',
        'PASSWORD': 'votre_mot_de_passe',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

### 5️⃣ Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 6️⃣ Créer un superutilisateur

```bash
python manage.py createsuperuser
```

---

### 7️⃣ Lancer le serveur

```bash
python manage.py runserver
```

L’API sera accessible sur :

```
http://127.0.0.1:8000/
```

Admin panel :

```
http://127.0.0.1:8000/admin/
```

---

## 🔑 Authentification JWT (si activée)

Obtenir un token :

```
POST /api/token/
```

Rafraîchir le token :

```
POST /api/token/refresh/
```

Utiliser dans les requêtes :

```
Authorization: Bearer <votre_token>
```

---

## 📡 Exemples d’Endpoints API

### Hôtels
- `GET /api/hotels/`
- `POST /api/hotels/`
- `GET /api/hotels/{id}/`

### Réservations
- `POST /api/reservations/`
- `GET /api/reservations/my-reservations/`

### Favoris
- `POST /api/hotels/{id}/toggle-favorite/`
- `GET /api/favorites/`

### Avis
- `POST /api/reviews/`
- `GET /api/hotels/{id}/reviews/`

---

## 🧪 Tests

```bash
python manage.py test
```

---

## 🧱 Améliorations futures

- Paiement en ligne (Stripe / PayPal)
- Notifications email
- Dashboard analytique
- Documentation Swagger
- Déploiement Docker

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche
3. Commit des modifications
4. Ouvrir une Pull Request

---

## 📜 Licence

Projet sous licence MIT.

---

## 👨‍💻 Auteur

**Thierry Meyeul**

GitHub : https://github.com/ThierryMeyeul

---

⭐ N'hésitez pas à mettre une étoile au projet !
