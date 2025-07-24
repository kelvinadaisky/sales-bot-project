import React, { useState, useEffect, useRef } from 'react';

// Main App component for the Sales Bot UI
const App = () => {
    // State to store chat messages
    const [messages, setMessages] = useState([]);
    // State to store the current user input
    const [input, setInput] = useState('');
    // State to manage loading indicator when bot is "typing"
    const [isLoading, setIsLoading] = useState(false);

    // Ref for the messages container to enable auto-scrolling
    const messagesEndRef = useRef(null);

    // IMPORTANT: Replace this with your actual n8n Webhook URL
    // You can find this URL when you add a 'Webhook' node as a trigger in your n8n workflow.
    const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/2c0c487d-99ed-4ab9-ae7a-31912f45de49'; // <<<--- REPLACE THIS LINE

    // Effect to scroll to the bottom of the chat whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    /**
     * Handles sending a message.
     * Adds the user's message to the chat and then simulates a bot response.
     */
    const handleSendMessage = async () => {
        if (input.trim() === '') return; // Prevent sending empty messages

        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(''); // Clear the input field

        setIsLoading(true); // Show loading indicator

        // Simulate a brief delay for UI responsiveness before calling n8n
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Call the n8n workflow to get a bot response
        await getBotResponseFromN8n(input);

        setIsLoading(false); // Hide loading indicator
    };

    /**
     * Fetches a response from the n8n webhook.
     * @param {string} userQuery The user's message to send to the n8n workflow.
     */
    const getBotResponseFromN8n = async (userQuery) => {
        if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
            const errorMessage = { text: "Error: Please configure your n8n Webhook URL in the code.", sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            console.error("n8n Webhook URL is not configured.");
            return;
        }

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the user's query in the request body
                body: JSON.stringify({ message: userQuery })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Assuming n8n returns the bot's response in a 'response' or 'text' field
            const botText = result.response || result.text || "I'm sorry, I couldn't get a clear response from the workflow.";
            const botMessage = { text: botText, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

        } catch (error) {
            // Handle API call errors
            const errorMessage = { text: `There was an error connecting to the n8n workflow: ${error.message}. Please check your n8n setup.`, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            console.error("Error fetching bot response from n8n:", error);
        }
    };

    /**
     * Handles key presses in the input field, specifically for 'Enter' to send messages.
     * @param {object} e The keyboard event.
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    // Placeholder for Firebase configuration and authentication
    // These variables are provided by the Canvas environment.
    // They are included here to satisfy the requirements, but not actively used for this UI.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // You would initialize Firebase here if persistence was needed.
    // For example:
    /*
    useEffect(() => {
        if (Object.keys(firebaseConfig).length > 0) {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);

            const signInUser = async () => {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                    console.log("Firebase authenticated.");
                } catch (error) {
                    console.error("Firebase authentication error:", error);
                }
            };
            signInUser();
        }
    }, [firebaseConfig, initialAuthToken]);
    */

    return (
        <div className="d-flex flex-column justify-content-center align-items-center bg-light min-vh-100 p-3">
            {/* Bootstrap CSS */}
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
            {/* Inter font from Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                .chat-container {
                    max-width: 600px;
                    height: 80vh;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    border-radius: 1rem;
                    border: 1px solid #dee2e6;
                }
                .message-area {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }
                .user-message {
                    background-color: #0d6efd; /* Bootstrap primary blue */
                    color: white;
                    border-bottom-right-radius: 0 !important;
                }
                .bot-message {
                    background-color: #e9ecef; /* Bootstrap light gray */
                    color: #212529; /* Bootstrap dark text */
                    border-bottom-left-radius: 0 !important;
                }
                .message-bubble {
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    max-width: 75%;
                    margin-bottom: 1rem;
                }
                .status-dot {
                    width: 0.75rem;
                    height: 0.75rem;
                    border-radius: 50%;
                    background-color: #28a745; /* Bootstrap success green */
                    position: relative;
                }
                .status-dot::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: #28a745;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                /* Custom scrollbar for better appearance */
                .message-area::-webkit-scrollbar {
                    width: 8px;
                }
                .message-area::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .message-area::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .message-area::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                `}
            </style>

            <div className="card chat-container d-flex flex-column bg-white">
                {/* Chat Header */}
                <div className="card-header bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                    <h1 className="h4 mb-0">Sales Bot</h1>
                    <div className="d-flex align-items-center">
                        <span className="status-dot me-2"></span>
                        <span className="small">Online</span>
                    </div>
                </div>

                {/* Message Display Area */}
                <div className="message-area">
                    {messages.length === 0 && (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted text-center">
                            <svg className="mb-3 text-info" style={{ width: '4rem', height: '4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <p className="lead mb-1">Start a conversation with our sales bot!</p>
                            <p className="small">Ask about products, pricing, or anything else.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                            <div
                                className={`message-bubble shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'user-message'
                                        : 'bot-message'
                                }`}
                            >
                                <p className="mb-0">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="d-flex justify-content-start">
                            <div className="message-bubble shadow-sm bot-message">
                                <div className="spinner-grow text-secondary spinner-grow-sm me-1" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <div className="spinner-grow text-secondary spinner-grow-sm me-1" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <div className="spinner-grow text-secondary spinner-grow-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll target */}
                </div>

                {/* Message Input Area */}
                <div className="card-footer bg-light border-top p-3 d-flex align-items-center">
                    <input
                        type="text"
                        className="form-control me-2 rounded-pill"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || input.trim() === ''}
                        className="btn btn-primary rounded-pill shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: '3rem', height: '3rem' }} // Fixed size for the button
                    >
                        <svg className="bi bi-send" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ width: '1.2rem', height: '1.2rem' }}>
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.5.5 0 0 1-.923.084l-2.509-5.018l5.018-2.509a.5.5 0 0 1-.084-.923L.146.146A.5.5 0 0 1 .663.036l15.15-15.15a.5.5 0 0 1 .041-.005z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bootstrap JS Bundle (Popper.js and Bootstrap JS) */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" xintegrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>
        </div>
    );
};

export default App;
