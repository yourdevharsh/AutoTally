# AutoTally 📊

AutoTally is an intelligent web application that automates the tedious task of data entry from receipts. Simply define the data you need, upload your receipt images, and get a structured Excel file in seconds. This project leverages the power of Google's Gemini AI to understand and extract information from images.


---

## 🚀 Features

* **Dynamic Field Extraction:** Specify any fields you want to extract from your receipts (e.g., "Total Amount", "Date", "Store Name", "Tax").
* **Batch Processing:** Upload multiple receipt images at once and process them in a single batch.
* **AI-Powered:** Uses the Google Gemini model for accurate and reliable data extraction from images.
* **Instant Excel Export:** Automatically generates and downloads a `.xlsx` file containing the extracted data, ready for analysis.
* **Modern UI:** A clean and responsive user interface built with React and Tailwind CSS.

---

## 🏗️ Architecture

The application follows a simple client-server architecture:

1.  **Frontend (React):** A single-page application built with React and styled with Tailwind CSS. It provides the user interface for selecting fields and uploading image files.
2.  **Backend (Node.js/Express):** A Node.js server using the Express framework to handle API requests.
    * It uses **Multer** to manage multipart/form-data, handling the image uploads.
    * It communicates with the **Google Gemini API** to process each image and extract the requested data based on a dynamic prompt.
    * It uses the **`xlsx`** library to compile the extracted JSON data into an Excel spreadsheet.
    * Finally, it sends the generated Excel file back to the client for download.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** React, Tailwind CSS
* **AI / Machine Learning:** Google Gemini API (`@google/generative-ai`)
* **File Uploads:** Multer
* **Excel Generation:** `xlsx` (SheetJS)

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* npm or yarn
* A Google Gemini API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/autotally.git](https://github.com/your-username/autotally.git)
    cd autotally
    ```

2.  **Install server dependencies:**
    ```bash
    npm install
    ```
    *(Note: If you have a separate `client` folder, you will need to `cd client` and run `npm install` there as well.)*

3.  **Create a `.env` file** in the root of the project and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **Start the server:**
    ```bash
    npm start 
    ```
    *This will typically run a command like `node server.js`.*

5.  **Open the application:**
    The server will start (usually on `http://localhost:3001` or a similar port). Open your browser and navigate to the address logged in the console.

---

## Usage

1.  Enter the data fields you wish to extract in the "Fields to Extract" input, separated by commas.
2.  Click the "Click to select images" button and choose one or more receipt images.
3.  Click the "Select Images and Start" button.
4.  Wait for the processing to complete. An Excel file with the extracted data will be downloaded automatically.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
