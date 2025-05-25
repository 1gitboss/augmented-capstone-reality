# Augmented Capstone

## Description
Augmented Capstone Reality is an augmented reality (AR) web application that uses A-Frame and MindAR to display artwork information and audio narration when specific image targets are detected by a device’s camera.

## GitHub Repository
Source code is available at: https://github.com/your-username/augmented-capstone.git

## How to Install and Run Locally
Follow these steps to run the app on your machine:

1. **Clone the Repository**:
   - Open a terminal and run:
     ```
     git clone https://github.com/your-username/augmented-capstone.git
     ```
   - Navigate to the project folder:
     ```
     cd augmented-capstone
     ```

2. **Serve the Application**:
   - This is a static web app that requires an HTTP server due to WebXR and MindAR requirements.
   - **Using Node.js** (recommended):
     - Install `http-server` globally (requires Node.js):
       ```
       npm install -g http-server
       ```
     - Start the server:
       ```
       http-server -p 3000
       ```
     - Open a browser and go to `http://localhost:3000/index.html`.
   - **Using Python** (alternative):
     - Run:
       ```
       python3 -m http.server 3000
       ```
     - Open `http://localhost:3000/index.html`.

3. **Requirements**:
   - A WebXR-compatible browser (e.g., Chrome, Edge, Samsung Internet on Android).
   - A device with a camera for image tracking.
   - An internet connection to load assets (images, audio) from Glitch’s CDN, or download these assets locally and update paths in `ar-experience.html`.
   - The `mod-2-targets.mind` file is included in the project folder for image tracking.

## How to Deploy
You can deploy this app to Glitch or another static hosting platform:

1. **Deploy to Glitch**:
   - Go to Glitch.com, click “New Project,” then “Import from GitHub.”
   - Enter: https://github.com/your-username/augmented-capstone.git
   - Click “OK” to remix and host the project.

2. **Deploy to Netlify** (alternative):
   - Create a Netlify account and select “New site from Git.”
   - Connect your GitHub repository and set the build directory to the root folder (where `index.html` is).
   - Deploy the site, which will provide a URL (e.g., `https://your-site.netlify.app/index.html`).

## Additional Information
- **Browser Compatibility**: Works best in Chrome or Edge on a device with a camera.
- **Assets**: Images and audio are hosted on Glitch’s CDN (e.g., `https://cdn.glitch.global/...`). For offline use, download these assets and update URLs in `ar-experience.html`.
- **Known Issues**: Direct file access (`file://`) won’t work due to CORS restrictions; use an HTTP server.
- **Documentation**: No additional manual is provided at this time.
