# 🌍 TravelBug

TravelBug is a full-stack, MVC-architecture web application that allows users to explore, create, and review travel accommodations around the world. It features secure authentication, image uploads to the cloud, interactive maps, and AI-powered text generation to help create dynamic listings.

![TravelBug Banner](https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80) 
*(Add a screenshot of your project here by replacing the link)*

---

## ✨ Key Features

- **User Authentication:** Secure signup, login, and logout functionality using Passport.js with Local Strategy.
- **Listing Management:** Users can view, create, edit, and delete their own travel accommodation listings.
- **Review System:** Authenticated users can leave reviews and ratings on listings. Owners can delete their own reviews.
- **AI-Powered Descriptions:** Automatically generate catchy, SEO-friendly listing descriptions using Google's Gemini AI simply by providing a title, location, and price.
- **Image Uploads:** Users can upload images for their listings, which are securely stored on Cloudinary.
- **Interactive Maps:** View listings on a map (if configured) via external Geocoding APIs.
- **Responsive Design:** A fully responsive user interface built with Bootstrap and custom CSS, ensuring a great experience on both desktop and mobile devices.
- **Robust Security:** Implemented Helmet for HTTP header security, Express Mongo Sanitize to prevent NoSQL injection, and secure session management.

---

## 🛠 Tech Stack

### Frontend
*   **Templating Engine:** EJS (Embedded JavaScript) with `ejs-mate` for layouts.
*   **Styling:** Bootstrap 5, Custom CSS (`public/css/style.css`).
*   **Interactivity:** Vanilla JavaScript.

### Backend
*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Authentication:** Passport.js (Local Strategy, Passport-Local-Mongoose)
*   **AI Integration:** `@google/generative-ai` (Gemini 1.5 Flash)
*   **File Uploads:** Multer, `multer-storage-cloudinary`
*   **Security & Middleware:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, Connect-Flash

### Database & Storage
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Session Storage:** `connect-mongo` (storing sessions in MongoDB)
*   **Cloud Storage:** Cloudinary

---

## 📁 Folder Structure

```text
MAJORPROJECT/
├── controllers/       # Contains logic for different routes (listing.js, reviews.js, user.js, ai.js)
├── init/              # Scripts and dummy data to initialize the database
├── models/            # Mongoose schemas (listing.js, reviews.js, user.js)
├── public/            # Static assets (CSS, client-side JS, images)
├── routes/            # Express route definitions
├── utils/             # Helper functions and custom error handling classes
├── views/             # EJS templates for the frontend (includes layouts, listings, users)
├── .env               # Environment variables (not tracked by git)
├── app.js             # Main application entry point
├── cloudConfig.js     # Cloudinary configuration setup
├── middleware.js      # Custom middlewares (e.g., isLoggedIn, isOwner)
├── schema.js          # Joi schemas for server-side validation
└── package.json       # Project dependencies and scripts
```

---

## 🚀 How to Run Locally

### Prerequisites

Before you begin, ensure you have the following installed and set up:
1.  **Node.js**: [Download and install Node.js](https://nodejs.org/)
2.  **MongoDB**: You can run it locally or use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
3.  **Cloudinary Account**: For image storage. [Sign up here](https://cloudinary.com/).
4.  **Gemini API Key**: For the AI description generator. [Get an API key](https://aistudio.google.com/app/apikey).

### Installation & Setup

1. **Clone the repository** (if applicable) or download the source code.
   ```bash
   git clone <your-repo-url>
   cd MAJORPROJECT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory of your project and add the following keys. Replace the placeholder values with your actual credentials:
   ```env
   # Cloudinary Credentials
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret

   # MongoDB Connection String (Local or Atlas)
   ATLASDB_URL=mongodb://127.0.0.1:27017/travelbug

   # Session Secret (Make up a strong random string)
   SECRET=your_super_secret_session_key

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Initialize the Database (Optional but recommended)**
   If you want to start with some sample listings, run the initialization script:
   ```bash
   cd init
   node index.js
   cd ..
   ```

5. **Start the Application**
   ```bash
   node app.js
   # OR using nodemon for automatic restarts during development
   nodemon app.js
   ```

6. **Visit the App**
   Open your browser and navigate to `http://localhost:8080/listings`

---

## 🎤 Interview Preparation Guide

This section is specifically designed to help you explain the technical decisions and architecture of this project to recruiters and interviewers.

### 1. The AI-Powered Listing Description Generator
**The "Elevator Pitch":** 
"I integrated Google's Gemini AI into my Node.js backend to automate property descriptions. Instead of just making a basic API call, I built an Express controller that takes user inputs (location, price, category), dynamically constructs an optimized prompt, and queries the `gemini-1.5-flash` model. I also engineered a graceful fallback mechanism so that if the AI service goes down, the application serves a local template instead of crashing the user experience."

**Key Technical Details to Mention:**
*   **Dynamic Prompt Engineering:** Using JavaScript Template Literals to inject `req.body` data into the prompt while applying constraints (e.g., instructing the AI to exclude markdown styling).
*   **Graceful Degradation / Fallback:** Before hitting the API, the code verifies the `GEMINI_API_KEY` format. If the key is invalid, or if the network request fails in the `catch` block, it returns a randomly selected local template. This ensures 100% uptime for the user experience.
*   **Low-Latency Selection:** Choosing the `flash` model over heavier models to ensure the HTTP request resolves quickly.

### 2. Authentication & Session Management
**Key Technical Details to Mention:**
*   **Stateful Sessions:** Implemented session-based authentication rather than JWTs. Sessions are persisted in MongoDB using `connect-mongo`, meaning users remain logged in even if the Node server restarts.
*   **Middleware Security:** Created custom route-protection middlewares (`isLoggedIn`, `isOwner`, `isReviewAuthor`) to strictly enforce authorization before any database mutations (Update/Delete) occur.

### 3. Database Architecture
**Key Technical Details to Mention:**
*   **Mongoose Post-Hooks:** When a Listing is deleted, a Mongoose `findOneAndDelete` middleware automatically triggers to delete all associated Reviews. This prevents orphaned data and keeps the database clean.
*   **Geospatial Data:** Listings store coordinates using GeoJSON format (`type: "Point", coordinates: [lon, lat]`), enabling future location-based queries.

---

## 📜 License

This project is licensed under the ISC License.
