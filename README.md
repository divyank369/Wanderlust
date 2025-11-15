🌍 Wanderlust – Full-Stack Travel Listing Platform

A full-stack production-grade travel listing platform inspired by Airbnb.
Built with Node.js, Express, MongoDB Atlas, Cloudinary, MapTiler Maps, Passport Authentication, and EJS.

Live Demo: (https://wanderlust-a28k.onrender.com/)

🔥 Features
🔑 Authentication & Authorization

Fully secure user signup/login

Password hashing (Passport.js + LocalStrategy)

Role-based listing edit/delete permissions

Flash messages & session management

🏡 Listing Management (CRUD)

Create, view, update, delete listings

Title, description, price, category, owner info

Cloudinary-based secure image upload

Auto image replacement when editing

📍 Smart Geolocation

Forward geocoding via MapTiler API

Store coordinates in MongoDB (GeoJSON)

Display map on listing pages

⭐ Reviews System

Add/delete reviews

Review author control

Flash notifications

🎨 UI/UX (EJS)

Clean pages

Responsive layout

Custom CSS + Bootstrap

Flash alerts

☁ Deployment Ready

Render auto-deploy enabled

Connected GitHub CI/CD

Environment variables for secure keys

🛠 Tech Stack

Frontend:

EJS Templates

Bootstrap

Vanilla JavaScript

Backend:

Node.js

Express.js

Mongoose ORM

Passport.js (Local Strategy)

Database:

MongoDB Atlas

File Storage:

Cloudinary v2 (manual uploader)

Maps & Geocoding:

MapTiler API

Dev Tools:

Nodemon

GitHub


📁 Project Structure
Wanderlust/
│── controllers/
│   └── listings.js
│── models/
│   └── listing.js
│── public/
│── routes/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│── utils/
│── views/
│   ├── listings/
│   ├── users/
│   ├── includes/
│   └── layouts/
│── cloudConfig.js
│── app.js
│── package.json
│── README.md


🚀 Deployment (Render)

Push project to GitHub

On Render → “New Web Service”

Connect repo

Set:

Build: npm install
Start: node app.js


Add environment variables

Auto-deploy → ON

🧪 Future Enhancements

Image delete from Cloudinary

Pagination

Price-based filtering

Booking engine

Admin dashboard

Email verification

User profile page

👤 Author

Your Name (Divyank Singh)

GitHub: https://github.com/divyank369
