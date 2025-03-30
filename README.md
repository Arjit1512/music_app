# Musicboard 🎵

Musicboard is a cross-platform mobile application built using **React Native** and **Expo**, with a **FastAPI** backend. It allows users to **discover, rate, and review music**, integrating the **Spotify API** for fetching album and track details.

## Features 🚀
- 🎶 **Discover Music** – Browse albums and tracks with details fetched from Spotify.
- ⭐ **Rate & Review** – Share your thoughts on albums and tracks.
- 👤 **Personalized Dashboard** – View your reviews and ratings in one place.
- 🔄 **FastAPI Backend** – Secure and scalable backend for handling user data.
- 📱 **Cross-Platform** – Works on both Android and iOS using React Native.

## Tech Stack 🛠️
- **Frontend:** React Native (Expo), Axios, AsyncStorage
- **Backend:** FastAPI, MongoDB

## Installation & Setup ⚙️

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Arjit1512/music_app.git
cd musicboard
```

### 2️⃣ Install Dependencies
```sh
npm install  # or yarn install
```

### 3️⃣ Start the React Native App
```sh
npx expo start
```

## Backend Setup 🖥️

### 1️⃣ Navigate to Backend Directory
```sh
cd backend
```

### 2️⃣ Run the FastAPI Server
```sh
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints 🌍

### Authentication
- `POST /register` – Register a new user
- `POST /login` – Authenticate user and log in

### Reviews
- `POST /{id}/add-review/{albumId}` – Add a new review for an album
- `DELETE /{id}/delete-review/{review_id}` – Delete a user's review
- `GET /{id}/reviews` – Get all reviews by a user
- `GET /reviews` – Get the latest 20 reviews

### Friends
- `POST /{id}/add-friend/{friendId}` – Add or remove a friend

### User Info
- `GET /get-details/{id}` – Fetch user details
