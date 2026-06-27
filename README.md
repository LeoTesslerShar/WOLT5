# Wolt5

A Wolt-inspired food delivery platform — React web frontend, React Native mobile app, Node.js/Express backend, MongoDB, and a C++ recommendation server.

---

## Running with Docker

Make sure Docker Desktop is running, then from the project root:

```bash
docker-compose up --build
```

This builds and starts three containers:

| Container | Description | Port |
|-----------|-------------|------|
| **mongo** | MongoDB database | `27017` |
| **server** | C++ TCP recommendation engine | `8080` |
| **webserver** | Express API + React web app (static) | `3000` |

Open [http://localhost:3000](http://localhost:3000) in your browser for the web client.

To stop: `Ctrl+C`, then `docker-compose down`.  
To wipe the database volume as well: `docker-compose down -v`.

---

## Running the mobile app (React Native / Expo)

The mobile app runs on your device or emulator — it is **not** Dockerized.

**Prerequisites:** Node.js 18+, Expo Go app on your phone (or Android emulator).

```bash
cd src/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` to open the Android emulator.

> Make sure `docker-compose up` is running first so the app has an API to connect to.

---


## Project structure

```
src/
  server/         C++ TCP server — recommendation engine
  webserver/      Express API server
    app.js          entry point, serves React build at /
    db.js           Mongoose connection with retry logic
    controllers/    users, tokens, restaurants, products, orders, search
    middleware/     JWT auth
    models/         Mongoose schemas — User, Restaurant, Product, Order
    routes/         URL → controller mapping
    services/       ex2Client.js (TCP to C++ server), seed.js
    utils/          delivery.js, payment.js
  client/         React web application
    src/
      contexts/     AuthContext, ThemeContext, CartContext
      pages/        Login, Register, Home, Restaurant, Search,
                    Checkout, Orders, AdminRestaurant
      components/   Navbar, CartSidebar, ProductCard, RestaurantCard,
                    SearchBar, ProtectedRoute
      services/     api.js — HTTP calls with JWT injection
  mobile/         React Native app (Expo)
    src/
      contexts/     AuthContext, CartContext
      navigation/   AppNavigator (stack + drawer)
      screens/      Login, Register, Home, Restaurant, Search,
                    Cart, Checkout, Orders, Profile, Admin screens
      services/     api.js — axios instance with JWT injection
      theme/        colors, spacing, typography
```

---


## Notes

- Data is persisted in MongoDB (Docker volume `mongo_data`). Survives container restarts; `docker-compose down -v` wipes it.
- JWT is stored in memory on the web client and via `AsyncStorage` on mobile.
- Only libraries approved in the course materials are used.