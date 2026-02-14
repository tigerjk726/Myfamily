# Project Blueprint: Family Website

## Overview

A modern, clean, and family-friendly website with features for generating lottery numbers and uploading photos. The application is built using modern web standards and leverages cloud services for backend functionality.

## Design and Style

*   **Aesthetics:** Modern, clean, harmonious, and comfortable.
*   **Layout:** Responsive and mobile-first.
*   **Colors:** A calming and inviting color palette.
*   **Typography:** Clear and readable fonts.
*   **Iconography:** Use of icons to enhance usability.

## Features

### 1. Lotto Number Generator

*   **Functionality:** Generates random numbers for various lotteries (Korea, USA, Canada).
*   **UI:** Buttons for each lottery type and a display area for the generated numbers.

### 2. Photo Gallery

*   **Functionality:** Allows users to upload photos, which are then displayed in a gallery.
*   **Image Expansion:** Clicking on a photo in the gallery opens a larger version in a modal view.
*   **UI:** A file input for selecting images, an upload button, a progress bar, and a gallery display area.
*   **Backend:**
    *   **Cloudinary:** Used for storing and serving the uploaded image files.
    *   **Firebase Firestore:** Used to store the URLs of the images hosted on Cloudinary, allowing for an organized and retrievable gallery list.
*   **Upload Mechanism:** Uses Cloudinary's direct, unsigned upload functionality from the client-side.

### 3. Recommendations

*   **Functionality:** Allows users to add and view recommendations for books, movies, and music.
*   **UI:** A form for adding new recommendations, with fields that dynamically change based on the selected category. Recommendations are displayed in separate lists for each category.
*   **Backend:**
    *   **Firebase Firestore:** Used to store the recommendation data.
*   **Image Fetching:** Currently uses a placeholder image. Automatically fetching images from Google based on the title is a future goal.

### 4. Navigation & Content Sections

*   **Functionality:** A navigation bar to switch between different sections of the website (Home, Lotto, Calendar, Gallery, Recommendations, Comments).
*   **Sections:** Includes a family calendar via Google Calendar, a comment section via Disqus, and a contact form via Formspree.

## Development Plan

### Phase 1: Initial Structure and Core Features

1.  **Create `blueprint.md`:** Define project goals and structure.
2.  **Setup HTML (`index.html`):** Create the basic structure with header, main sections, and footer.
3.  **Setup CSS (`style.css`):** Add basic styles for layout, typography, and a dark/light theme.
4.  **Implement Core JS (`main.js`):**
    *   Implement client-side routing based on URL hash.
    *   Implement the Lotto Number Generator.
    *   Integrate Google Calendar and Disqus.

### Phase 2: Photo Gallery with Cloudinary

1.  **Configure Cloudinary:** Set up a Cloudinary account, get the Cloud Name, and create an unsigned upload preset.
2.  **Integrate Firebase Firestore:**
    *   Add Firebase SDKs for Firestore to `index.html`.
    *   Initialize Firestore in `main.js`.
3.  **Implement Upload Functionality:**
    *   Create the UI for file selection and upload progress.
    *   Write the `handleUpload` function to send files directly to the Cloudinary API.
    *   Upon successful upload, save the returned `secure_url` to a new document in the `images` collection in Firestore.
4.  **Implement Gallery Display:**
    *   Write the `loadAndDisplayImages` function to fetch image documents from the Firestore `images` collection.
    *   Render the images in the gallery, ordered by creation date.
    *   Add an image expansion feature to view photos in a modal.

### Phase 3: Recommendations Feature

1.  **Update HTML:** Add the "Recommendations" section with a dynamic form and display lists.
2.  **Update CSS:** Add styles for the new section to ensure a consistent look and feel.
3.  **Update JS:**
    *   Implement the logic to dynamically change the form based on the selected category.
    *   Use Firestore to save and retrieve recommendation data.
    *   Implement the display of recommendations.
    *   Add a placeholder for image fetching, with a plan to implement automatic image fetching in the future.

### Phase 4: Deployment and Version Control

1.  **Deploy to Firebase Hosting:** Set up Firebase Hosting and deploy the website.
2.  **Version Control with Git:** Maintain a Git repository, committing key changes and pushing to a remote (e.g., GitHub).
3.  **Refine and Iterate:** Continuously improve styling, user experience, and accessibility.
