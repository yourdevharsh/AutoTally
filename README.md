# 🧾 AutoTally: AI-Powered Receipt Data Extraction

AutoTally is a full-stack application that leverages the Gemini API's multimodal capabilities to efficiently extract structured data from uploaded images of receipts, bills, or invoices, and compile the results into a standardized Excel (`.xlsx`) file for easy analysis.

## 🌟 Intro

Managing expenses and compiling financial data from numerous paper or digital receipts is time-consuming and prone to human error. AutoTally solves this by allowing users to specify the exact fields they need (e.g., "Total Amount," "Date," "Store Name") and process multiple image files simultaneously, instantly generating a clean, structured spreadsheet.

## 🛠️ How It Works

The application operates on a robust client-server architecture:

1.  **Client Submission (React/JSX):** The user uploads one or more receipt images and specifies a comma-separated list of desired fields (e.g., `Total Amount, Date, Store Name`).
2.  **Server Upload (Node.js/Multer):** The Express server (`server.js`) uses **Multer** to securely handle the file upload, storing temporary files in a dedicated directory.
3.  **AI Extraction (Gemini 2.5 Flash):**
    * The server iterates through each uploaded file.
    * It calls the `gemResult` function (`gemini.js`), which sends the image and the user-defined field list (as a structured prompt) to the Gemini API with the `responseMimeType` set to `application/json`.
    *  The AI analyzes the receipt image and returns a JSON object with the requested keys and extracted values (e.g., `{"Total Amount": 45.99, "Date": "2025-01-15"}`).
4.  **Data Consolidation (Node.js/XLSX):** All successfully extracted JSON objects are collected, normalized to ensure all requested columns are present, and then compiled into an Excel workbook using the `xlsx` library.
5.  **Download:** The server streams the final `.xlsx` file back to the client, triggering an automatic download. The temporary image files are deleted from the server in a cleanup step.

## ✨ Features

* **Customizable Extraction:** Users define the exact fields they need to extract (e.g., "Tax ID," "Line Item 3 Price," "Cashier Name").
* **Batch Processing:** Supports uploading and processing multiple receipt images concurrently.
* **Structured Output:** Generates a professional Excel (.xlsx) file, ready for immediate use in financial software or spreadsheets.
* **Standardized Data:** The AI is instructed to normalize numerical values (no currency symbols) and standardize dates (`YYYY-MM-DD`).
* **Clean Architecture:** Clear separation between the React frontend, Express API, and the AI/File management helpers.

## 💻 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **React / JSX** | Responsive UI for file uploads and progress tracking. |
| **Backend** | **Node.js / Express** | REST API endpoints, orchestration, and file serving. |
| **AI Core** | **Google Gemini 2.5 Flash** | Multimodal analysis and structured data extraction (JSON mode). |
| **File Handling** | **Multer** | Middleware for secure and efficient processing of multi-part file uploads. |
| **Data Output** | **`xlsx` (js-xlsx)** | Library for generating the final Excel workbook buffer. |

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS recommended)
* A Google AI Studio API Key

### Setup and Installation

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone <your-repo-url>
    cd autotally
    npm install
    ```
2.  **Configure API Key:**
    Ensure your Gemini API Key is set in your environment variables or a `.env` file (used by `dotenv`).
    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
3.  **Run the server:**
    ```bash
    node server.js
    ```

### Usage

1.  Navigate to the application URL (e.g., `http://localhost:3001`).
2.  Enter the required fields (e.g., `Total Amount, Store Name, VAT Number`).
3.  Click the upload button to select your receipt images (JPEG/PNG).
4.  Click "Start Processing..." to begin the AI extraction and download the resulting Excel file.

## 📐 System Design and Architecture

### Data Flow

The architecture is a classic decoupled backend/frontend design, with a critical asynchronous processing step:

1.  **Client:** Collects parameters (`fields`) and files.
2.  **Express:** Receives `multipart/form-data` on `/process-bills`.
3.  **Multer:** Saves files to disk.
4.  **`server.js`:** Runs `Promise.all` on all files, calling `gemResult` for each file concurrently.
5.  **Gemini API:** Performs image-to-JSON transformation.
6.  **`server.js`:** Aggregates JSON, generates Excel, and sends the binary response.
7.  **`finally` block:** Ensures temporary files are deleted, guaranteeing system hygiene.

### Critical Components

* **`gemini.js`:** The core logic for calling the Gemini API. It enforces JSON output and standardizes the extraction prompt, ensuring high data accuracy and format consistency.
* **`server.js`:** Handles the multi-threaded processing (`Promise.all`) to minimize total latency when processing many images.
* **Frontend State (`main.jsx`):** Manages `isLoading` state to disable the button and show a spinner, providing clear feedback to the user during the high-latency server process.

### Potential System Improvements

* **Error Reporting:** Include a new column in the final Excel file to log which images failed extraction (`null` data) and provide a reason (e.g., "Image too blurry," "Receipt not detected").
* **File Type Validation:** Enhance Multer to perform stricter MIME type validation beyond just file extension to prevent non-image files from reaching the AI.
* **Asynchronous Jobs:** For very large batches (50+ files), offload the processing to a background worker or queue (like RabbitMQ or Redis Queue) to prevent the HTTP request from timing out.

## 📊 DSA Analysis and Potential Improvements

### Core Algorithm: Parallel Processing

* **Data Structure:** Array of file paths (`req.files`).
* **Algorithm:** **Asynchronous Parallel Mapping** (`files.map` combined with `Promise.all`).
* **Analysis:** This is an optimal use of asynchronous I/O. Since the AI call is an external network operation (I/O bound), running all Gemini calls concurrently maximizes resource utilization and minimizes the total processing time, which is crucial for handling large batches.
* **Complexity:** The total time is dominated by the slowest API call, not the sum of all calls: $T_{total} = T_{overhead} + \max(T_{AI\_1}, T_{AI\_2}, ..., T_{AI\_N})$.

### Data Normalization

* **Data Structure:** Array of JSON objects.
* **Algorithm:** **Iterative Normalization:** The system strictly iterates over the *user's requested fields* and maps the raw extracted JSON data to this required column structure.
* **Improvement:** For missing fields, instead of an empty string, set the value to a specific flag like `[MISSING]` to make it visually clear to the end-user that the AI failed to find that data point.

## 📈 Performance Metrics

Performance in AutoTally is primarily measured by the speed and reliability of the AI extraction pipeline:

| Metric | Description | Expected Value / Impact |
| :--- | :--- | :--- |
| **Extraction Latency** | Time per image (server-side, network only). | **~1-3 seconds.** Varies based on image complexity and network speed to the Gemini API. |
| **Batch Processing Time** | Total time for N images. | **Near $N \times 1$ second (due to parallel processing).** This is a huge performance gain over sequential processing. |
| **Extraction Accuracy** | Percentage of fields that are correctly identified and formatted (number/date standardization). | **Very High (95%+).** Directly related to the quality of the System Prompt, which enforces JSON format, key matching, and data standardization rules. |
| **Server Cleanup Time** | Time to delete temporary files. | **Negligible (<100ms).** Crucial for long-term server stability. |

## ⚖️ Trade-offs: Why Use That?

| Trade-off | Rationale for Current Choice |
| :--- | :--- |
| **Local OCR vs. Gemini API** | **Chosen:** Gemini API. Local OCR is fast but highly inaccurate for complex data extraction and schema-mapping. Gemini provides superior multimodal reasoning and the ability to strictly enforce **JSON output structure**, which is non-negotiable for programmatic data processing. |
| **XLSX vs. CSV** | **Chosen:** XLSX. While CSV is simpler, XLSX allows for richer metadata and auto-sizing columns (`worksheet['!cols']`), which provides a more professional and user-friendly output file. |
| **`Promise.all` vs. Queueing** | **Chosen:** `Promise.all`. For small to medium batches (up to 50 files), parallel processing is the fastest route. Queuing (the alternative) adds significant complexity for job persistence but is necessary only for large-scale, enterprise-level use cases to handle server crashes gracefully. |
| **Multer Temporary Storage** | **Chosen:** Save to Disk (`multer.diskStorage`). This is more robust than storing in memory for large image files and multiple concurrent uploads, preventing memory exhaustion on the server. The mandatory cleanup ensures the trade-off is minimal. |

## 🔮 Future Updates

* **Multi-File Type Support:** Integrate a pre-processor to convert common document formats (PDFs, DOCX) into images before sending them to Gemini.
* **Progress Bar:** Implement a WebSocket connection to stream real-time progress updates (e.g., "3/10 receipts processed") back to the React frontend, improving the user experience during long wait times.
* **Interactive Editing:** Allow the user to review the extracted JSON data in the browser before final export, providing an opportunity to manually correct any AI extraction errors.
