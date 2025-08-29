# AutoTally 📊

AutoTally is a mobile application that automates the process of extracting structured data from images of receipts and bills and exports it directly into an Excel spreadsheet. Simply select your images, specify the data fields you need (e.g., "Total Amount," "Date," "Store Name"), and let the AI do the rest.

---

## 🚀 How it Works

The application uses a powerful combination of a mobile frontend and a smart backend to deliver a seamless experience:

1.  **Image Selection**: The user opens the React Native application, specifies the comma-separated fields they want to extract, and selects multiple images of receipts or bills from their device's gallery.

2.  **Secure Upload**: The selected images are sent to a Node.js and Express server via a `multipart/form-data` request, where they are temporarily stored for processing using `multer`.

3.  **AI-Powered Data Extraction**: For each uploaded image, the server calls the **Google Gemini Pro Vision API**. A carefully crafted prompt instructs the AI to analyze the image and extract the requested data fields, returning the information in a clean, structured JSON format.

4.  **Parallel Processing**: The server processes all uploaded images concurrently, making the data extraction fast and efficient even for large batches.

5.  **Excel File Generation**: Once the data from all images has been extracted, the server compiles the results into a single Excel (`.xlsx`) file using the `xlsx` library.

6.  **Download and Share**: The generated Excel file is sent back to the React Native application. The user is then prompted with a share dialog to save the file to their device or open it in their preferred spreadsheet application.

7.  **Automatic Cleanup**: All temporary image files are automatically deleted from the server after processing to ensure data privacy and efficient storage management.

---

## ✨ Features

* **Multi-Image Upload**: Select and process multiple receipts at once.
* **Custom Data Extraction**: Define exactly which fields you want to extract from your documents.
* **AI-Powered Accuracy**: Leverages the Google Gemini Vision model for high-precision data extraction.
* **Direct to Excel**: Get a neatly organized `.xlsx` spreadsheet with your extracted data.
* **Mobile First**: Built with React Native for a smooth mobile user experience.
* **Secure and Private**: Uploaded images are deleted from the server immediately after processing.

---

## 🛠️ Tech Stack

* **Mobile App**: React Native
* **Backend**: Node.js, Express.js
* **AI**: Google Gemini Pro Vision API (`gemini-1.5-flash`)
* **File Uploads**: Multer
* **Excel Generation**: `xlsx` (SheetJS)
* **Dependencies**: `react-native-image-picker`, `react-native-fs`, `react-native-share`

---

## ⚙️ Setup and Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

* **Node.js**: Make sure you have Node.js installed (v14 or later).
* **React Native Environment**: A working React Native development environment (follow the [official setup guide](https://reactnative.dev/docs/environment-setup)).
* **Google Gemini API Key**: You must have a valid API key for the Google Gemini API.

### Backend Server Setup

1.  **Navigate to the server directory** and install dependencies:
    ```bash
    # Assuming your server files are in a 'server' folder
    cd server
    npm install
    ```

2.  **Set up environment variables:**
    Create a file named `.env` in the root of the server directory and add your Google Gemini API key:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

3.  **Run the server:**
    ```bash
    node server.js
    ```
    The server should now be running on `http://localhost:3000`.

### React Native App Setup

1.  **Navigate to the app directory** and install dependencies:
    ```bash
    # Assuming your app files are in an 'app' folder
    cd app
    npm install
    ```

2.  **Configure the API URL:**
    Open the `app.jsx` file and update the `API_URL` constant to point to your server's endpoint:
    ```javascript
    const API_URL = 'http://your-local-ip:3000/process-bills';
    ```
    *(Note: When running on a physical device, use your computer's local network IP address, not `localhost`.)*

3.  **Run the application:**
    ```bash
    # For Android
    npx react-native run-android

    # For iOS
    npx react-native run-ios
    ```

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
