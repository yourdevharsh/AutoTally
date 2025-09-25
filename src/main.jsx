import React, { useState, useRef } from 'react';
import './styles.css'

// Main App Component
const App = () => {
    // State Management
    const [selectedFields, setFields] = useState('Total Amount, Date, Store Name');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // {text: string, type: 'success' | 'error'}

    // Ref for the file input
    const fileInputRef = useRef(null);

    // API Endpoint
    const API_URL = '/process-bills';

    // --- Handlers ---

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };


    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const startProcess = async () => {
        // --- 1. Validation ---
        const arrFields = selectedFields
            .split(',')
            .map(field => field.trim())
            .filter(field => field.length > 0);

        if (arrFields.length === 0) {
            setMessage({ text: 'Please enter the fields you want to extract, separated by commas.', type: 'error' });
            return;
        }

        if (files.length === 0) {
            setMessage({ text: 'Please select at least one image file.', type: 'error' });
            return;
        }

        // --- 2. Start Loading State ---
        setIsLoading(true);
        setMessage(null);

        // --- 3. Prepare FormData ---
        const data = new FormData();
        data.append('fields', selectedFields);
        files.forEach((file) => {
            data.append('photos', file, file.name);
        });

        // --- 4. API Call & File Download ---
        try {

            const response = await fetch(API_URL, {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json errors
                throw new Error(errorData.error || `Server responded with status: ${response.status}`);
            }

            const blob = await response.blob();
            downloadBlob(blob);
            setMessage({ text: 'Processing complete! Your file is downloading.', type: 'success' });


        } catch (e) {
            console.error(e);
            setMessage({ text: `Upload Failed: ${e.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
            setFiles([]); // Clear files after processing
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };


    const downloadBlob = (blob, overrideMimeType) => {
        const fileType = overrideMimeType || blob.type;
        const extension = fileType.includes('spreadsheetml') ? 'xlsx' : 'csv';

        // Create a temporary link to trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `AutoTally-Export-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();

        // Clean up the temporary URL and link
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // --- Render Component ---
    return (
        <div className="bg-gray-50 font-sans min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">AutoTally 📊</h1>
                    <p className="text-gray-500 mt-2">Extract data from receipts into an Excel or CSV file.</p>
                </div>

                {/* Message Box */}
                {message && (
                    <div className={`p-4 rounded-lg text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Form Area */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fields" className="block text-sm font-medium text-gray-700 mb-1">
                            Fields to Extract (comma-separated)
                        </label>
                        <input
                            id="fields"
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="e.g., Total Amount, Date, Store Name"
                            onChange={(e) => setFields(e.target.value)}
                            value={selectedFields}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Receipt Images
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileSelect}
                            className="max-w-md mx-auto flex justify-center items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition flex-col"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {files.length > 0 ? `${files.length} file(s) selected` : 'Click to select images'}
                        </button>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={startProcess}
                    disabled={isLoading}
                    className="max-w-md mx-auto bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center transition flex-col"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : 'Select Images and Start'}
                </button>
            </div>
        </div>
    );
};

export default App;
