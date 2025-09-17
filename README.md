# Fuel Finder Namibia

Fuel Finder Namibia is a mobile application designed to help users in Namibia find nearby fuel stations, check the latest fuel prices, and get directions. It uses OpenStreetMap for mapping data and relies on a crowdsourcing model for up-to-date fuel pricing information.

## Features

- **Find Nearby Stations:** Discover fuel stations around your current location.
- **Map & List View:** View stations on an interactive map or as a scrollable list.
- **Crowdsourced Prices:** View petrol and diesel prices reported by other users and contribute your own updates.
- **Get Directions:** Open your preferred navigation app to get directions to a selected station.

## Technology Stack

- **Frontend:** React Native (with Expo)
- **Backend:** Node.js with Express
- **Mapping Data:** OpenStreetMap (via Overpass API)
- **Map Display:** `react-native-maps` with an OpenStreetMap tile layer

## Setup and Installation

To run this application, you need to set up both the frontend and the backend.

### Prerequisites

- Node.js and npm
- An Android Emulator or a physical device

### 1. Backend Setup

The backend server is responsible for fetching station data from OpenStreetMap and managing price updates.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### 2. Frontend Setup

The frontend is the React Native mobile application.

1.  Navigate to the project root directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```

## How to Run the Application

You must have both the backend and frontend running simultaneously.

### 1. Start the Backend Server

In a terminal window, navigate to the `backend` directory and run:
```bash
npm start
```
The server will start, typically on `http://localhost:3000`.

### 2. Start the Frontend Application

In a **new** terminal window, from the project root directory, run the application on your desired platform. This will start the Expo development server and build the app.

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

Alternatively, you can start the development server first and then select the platform from the menu that appears in the terminal.
```bash
npm start
```

The application will build and launch on your emulator or connected device.
