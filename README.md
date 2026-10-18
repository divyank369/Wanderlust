# Wanderlust

Wanderlust is a full-stack travel listing application built with Node.js, Express, MongoDB, and EJS. Users can explore listings, create and manage their own listings, and share reviews.

**Live demo:** [wanderlust-a28k.onrender.com](https://wanderlust-a28k.onrender.com/)

## Features

- Account registration and sign-in using Passport local authentication
- Session-backed user state and flash messages
- Create, edit, view, and delete travel listings
- Listing reviews with author-based controls
- Cloudinary image uploads
- GeoJSON coordinates and MapTiler map display
- Server-rendered EJS views with responsive Bootstrap styling

## Technology Stack

| Area | Tools |
| --- | --- |
| Server | Node.js, Express |
| Data | MongoDB, Mongoose |
| Views | EJS, EJS Mate, Bootstrap, vanilla JavaScript |
| Authentication | Passport, Passport Local, Passport Local Mongoose |
| Images | Cloudinary and Multer |
| Maps | MapTiler |

## Local Setup

### Requirements

- Node.js 18.x
- MongoDB, local or hosted
- Cloudinary account for listing images
- MapTiler token for map features

### Install and configure

```bash
git clone https://github.com/divyank369/Wanderlust.git
cd Wanderlust
npm install
```

Create a `.env` file in the project root:

```dotenv
ATLAS_DB_URL=mongodb://127.0.0.1:27017/wanderlust
SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret
MAP_TOKEN=your-maptiler-token
```

Start the development server:

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080). Keep secrets in your local environment file and out of Git.

## Project Structure

```text
.
├── controllers/       # Listing, review, and user request handlers
├── models/            # Mongoose schemas
├── routes/            # Express route modules
├── views/             # EJS pages, layouts, and shared includes
├── public/            # CSS, browser JavaScript, and assets
├── app.js             # Express app and server startup
├── cloudConfig.js     # Cloudinary upload configuration
└── package.json
```

## Notes

MongoDB, Cloudinary, and MapTiler are external services. The application needs valid credentials and network access for those integrations. This project is intended as a portfolio and learning application.
