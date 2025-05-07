import { auth, db } from './firebaseauth.js'; // Adjust the path if necessary
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js"; // Use the full URL for Firestore

// Chat functionality
// Use environment variable if available, fall back to existing key for development
const OPENROUTER_API_KEY = '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'; // Your OpenRouter API key

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Chat history functionality
let chatHistory = []; // Initialize as an empty array

// User data structure
let userData = {
    pastWorkouts: [],
    goals: ''
};

// Function to save chat history
async function saveChatHistory(userId, chatHistory) {
    console.log("Saving chat history for user:", userId);
    console.log("Chat history data:", chatHistory);
    const chatRef = doc(db, "users", userId);
    await setDoc(chatRef, {
        chatHistory: chatHistory
    }, { merge: true });
}

// Function to load chat history
async function loadChatHistory(userId) {
    const chatRef = doc(db, "users", userId);
    const docSnap = await getDoc(chatRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        chatHistory = data.chatHistory || []; // Replace chatHistory
        updateHistoryPanel();
        console.log("Loaded chat history:", chatHistory);
    } else {
        console.log("No chat history found for this user.");
        chatHistory = []; // Initialize as empty if no history found
    }
}

// Function to toggle chat history
let historyLoaded = false;

async function toggleHistory() {
    const historyPanel = document.getElementById('historyPanel');
    const isActive = historyPanel.classList.toggle('active');

    console.log("Toggling history panel. Active:", isActive);

    if (isActive && auth.currentUser && !historyLoaded) {
        try {
            console.log("Loading chat history for user:", auth.currentUser.uid);
            await loadChatHistory(auth.currentUser.uid);
            historyLoaded = true; // Set the flag to true after loading
            updateHistoryPanel();
            const historyContent = document.getElementById('historyContent');
            historyContent.scrollTop = 0;
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    }
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    // Add avatar for bot messages
    if (!isUser) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = 'img/ai.svg';
        avatarImg.alt = 'AI Agent Icon';
        avatarImg.style.width = '40px';
        avatarImg.style.height = '40px';
        avatarDiv.appendChild(avatarImg);
        messageDiv.appendChild(avatarDiv);
    }

    // Create message content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (!isUser) {
        // Convert markdown code blocks
        message = message.replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, language, code) {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Convert inline code
        message = message.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Convert line breaks
        message = message.replace(/\n/g, '<br>');

        contentDiv.innerHTML = message;
    } else {
        contentDiv.textContent = message;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save to history
    chatHistory.push({
        message: message,
        isUser: isUser,
        timestamp: new Date().toLocaleTimeString()
    });
    updateHistoryPanel();
}

async function sendMessage() {
    const message = userInput.value.trim();
    console.log("User input:", message); // Check if the input is captured
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    userInput.value = ''; // Clear input after sending

    // Save user message to history
    chatHistory.push({
        message: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString()
    });

    // Save chat history to Firestore
    try {
        await saveChatHistory(auth.currentUser.uid, chatHistory); // Save chat history
    } catch (error) {
        console.error("Error saving chat history:", error);
    }

    // Show typing indicator
    const typingIndicator = showLoading();

    // Fetch bot response
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'DrillBuddy AI'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat:free',
                messages: chatHistory.map(chat => ({
                    role: chat.isUser ? 'user' : 'assistant',
                    content: chat.message
                }))
            })
        });

        const data = await response.json();
        typingIndicator.style.display = 'none'; // Hide typing indicator

        if (data.error) {
            const errorMessage = data.error.message || "An error occurred with the API";
            addMessage(`Error: ${errorMessage}`, false);
            console.error('API Error:', data.error);
            return;
        }

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const botResponse = data.choices[0].message.content;
            addMessage(botResponse, false); // Add bot response to chat

            // Save bot response to history
            chatHistory.push({
                message: botResponse,
                isUser: false,
                timestamp: new Date().toLocaleTimeString()
            });

            // Save updated chat history to Firestore
            try {
                await saveChatHistory(auth.currentUser.uid, chatHistory); // Save chat history
            } catch (error) {
                console.error("Error saving chat history:", error);
            }
        } else {
            addMessage("I apologize, but I couldn't process that request. Try asking something about fitness or training!", false);
            console.error('Unexpected response structure:', data);
        }
    } catch (error) {
        typingIndicator.style.display = 'none'; // Hide typing indicator on error
        addMessage("Sorry, there was an error processing your request. Please check your internet connection and try again.", false);
        console.error('Error:', error);
    }
}

// Function to properly handle loading state
function showLoading() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'flex'; // Show the typing indicator
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return typingIndicator;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', sendMessage);

    const viewHistoryButton = document.querySelector('.view-history-btn');
    viewHistoryButton.addEventListener('click', toggleHistory);

    const closeHistoryButton = document.querySelector('.close-history');
    closeHistoryButton.addEventListener('click', toggleHistory);

    // Add event listener for the Enter key
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action (like a newline)
            sendMessage(); // Call the sendMessage function
        }
    });

    setupQuickSuggestions(); // Ensure this is called after the DOM is fully loaded
});

function updateHistoryPanel() {
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = chatHistory.slice().reverse().map((chat, index) => `
        <div class="history-item ${chat.isUser ? 'user' : 'bot'}" onclick="loadChat(${chatHistory.length - 1 - index})">
            <div class="history-time">${chat.timestamp}</div>
            <div class="history-text">${chat.message}</div>
        </div>
    `).join('');
}

// Function to load a specific chat from history
window.loadChat = function (index) {
    if (chatHistory.length === 0) {
        console.error("Chat history is empty.");
        return;
    }

    const selectedChat = chatHistory[index];
    if (selectedChat) {
        userInput.value = selectedChat.message; // Load the message into the input
        addMessage(selectedChat.message, selectedChat.isUser); // Display the message in the chat
        console.log("Loaded chat:", selectedChat); // Debug log
    } else {
        console.error("No chat found at index:", index);
    }
};

// Function to update user data
function updateUserData(workout, goal) {
    userData.pastWorkouts.push(workout);
    userData.goals = goal;
}

// Function to get workout recommendations
function getWorkoutRecommendations() {
    const recommendations = [];

    // Example logic for recommendations
    if (userData.goals === 'weight loss') {
        recommendations.push('30 minutes of cardio');
        recommendations.push('Full-body strength training');
    } else if (userData.goals === 'muscle gain') {
        recommendations.push('Heavy weight lifting');
        recommendations.push('Compound exercises like squats and deadlifts');
    } else {
        recommendations.push('A mix of cardio and strength training');
    }

    // Adaptive difficulty based on past workouts
    if (userData.pastWorkouts.length > 0) {
        const lastWorkout = userData.pastWorkouts[userData.pastWorkouts.length - 1];
        if (lastWorkout.includes('heavy')) {
            recommendations.push('Consider lighter weights for recovery');
        }
    }

    return recommendations;
}

function handleUserInput(workout, goal) {
    updateUserData(workout, goal);
    addMessage(`Your goal is set to: ${goal}.`, false);
}

// Check for SpeechRecognition support
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    // Function to start voice recognition
    window.startVoiceRecognition = function () {
        recognition.start();
    };

    // Handle recognized speech
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('You said:', transcript);
        document.getElementById('user-input').value = transcript; // Set the input value to the recognized text
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Error:', event.error);
    };

    // Add event listener to the microphone button
    document.getElementById('mic-button').addEventListener('click', startVoiceRecognition);
} else {
    console.error('Speech Recognition API not supported in this browser.');
    alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge for this feature.');
}

// Add quick suggestions functionality
function setupQuickSuggestions() {
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const userInput = document.getElementById('user-input');

    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("Button clicked:", button.textContent); // Debug log
            userInput.value = button.textContent; // Set the input value to the button text
            userInput.focus(); // Focus the input field so the user can continue typing
        });
    });
}

// Add this to your existing DOMContentLoaded event or call it after the DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setupQuickSuggestions();
});

window.onload = function () {
    document.addEventListener('DOMContentLoaded', () => {
        const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        if (storedEmail) {
            // Automatically log in the user
            document.getElementById('loginEmail').value = storedEmail;
        }
    });
};

// Function to reset the chat
function newChat() {
    chatHistory = []; // Clear the chat history
    chatMessages.innerHTML = ''; // Clear the chat messages display
    userInput.value = ''; // Clear the input field
    console.log("New chat started."); // Debug log
}

// Event listener for the New Chat button
document.getElementById('new-chat-button').addEventListener('click', newChat);

// Load user avatar and name from localStorage
function loadUserProfile() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedName = localStorage.getItem('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    if (savedAvatar) {
        userAvatar.src = savedAvatar; // Set the saved avatar as the source
    }

    if (savedName) {
        userName.textContent = savedName; // Set the saved name
    }
}

// Handle avatar upload
document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('avatarUpload').click(); // Trigger file input click
});

document.getElementById('avatarUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const userAvatar = document.getElementById('userAvatar');
            userAvatar.src = e.target.result; // Set the new avatar
            localStorage.setItem('userAvatar', e.target.result); // Save to localStorage
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});

// Handle name change
document.getElementById('changeNameButton').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput');
    const userName = document.getElementById('userName');

    if (nameInput.style.display === "none") {
        nameInput.style.display = "block"; // Show input field
        nameInput.value = userName.textContent; // Set current name in input
    } else {
        userName.textContent = nameInput.value; // Update displayed name
        localStorage.setItem('userName', nameInput.value); // Save to localStorage
        nameInput.style.display = "none"; // Hide input field
    }
});

// Call loadUserProfile on page load
window.onload = function () {
    loadUserProfile();
};

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Set user profile data
setCookie('userAvatar', 'image_url_here', 365); // Save for 1 year
setCookie('userName', 'Priya Sharma', 365); // Save for 1 year

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Retrieve user profile data
const savedAvatar = getCookie('userAvatar');
const savedName = getCookie('userName');

const notificationsToggle = document.getElementById('notificationsToggle');
const notificationBadge = document.querySelector('.notification-badge');

// Load saved toggle state
if (localStorage.getItem('notifications') === 'false') {
    notificationsToggle.checked = false;
    notificationBadge.style.display = 'none';
}

// Save toggle state when changed
notificationsToggle.addEventListener('change', function () {
    localStorage.setItem('notifications', this.checked);
    notificationBadge.style.display = this.checked ? 'flex' : 'none';
});

// Example function to update notification count
function updateNotificationCount(count) {
    notificationBadge.textContent = count;
    notificationBadge.style.display = count > 0 && notificationsToggle.checked ? 'flex' : 'none';
}

// Example usage:
// updateNotificationCount(5);

const autoDeleteToggle = document.getElementById('autoDeleteToggle');

// Load saved toggle state
if (localStorage.getItem('autoDelete') === 'true') {
    autoDeleteToggle.checked = true;
}

// Save toggle state when changed
autoDeleteToggle.addEventListener('change', function () {
    localStorage.setItem('autoDelete', this.checked);
    alert(`Auto-delete history ${this.checked ? 'enabled' : 'disabled'}`);
});

const decreaseFont = document.getElementById('decreaseFont');
const increaseFont = document.getElementById('increaseFont');
const fontSizeValue = document.getElementById('fontSizeValue');
const body = document.body;

let currentFontSize = 1; // 0=small, 1=medium, 2=large

decreaseFont.addEventListener('click', function () {
    if (currentFontSize > 0) {
        currentFontSize--;
        updateFontSize();
    }
});

increaseFont.addEventListener('click', function () {
    if (currentFontSize < 2) {
        currentFontSize++;
        updateFontSize();
    }
});

function updateFontSize() {
    // Remove all font size classes
    body.classList.remove('font-small', 'font-medium', 'font-large');

    // Add the appropriate class
    if (currentFontSize === 0) {
        body.classList.add('font-small');
        fontSizeValue.textContent = 'Small';
    } else if (currentFontSize === 1) {
        body.classList.add('font-medium');
        fontSizeValue.textContent = 'Medium';
    } else {
        body.classList.add('font-large');
        fontSizeValue.textContent = 'Large';
    }

    // Save preference to localStorage
    localStorage.setItem('fontSize', currentFontSize);
}

// Load saved font size preference
const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    updateFontSize();
}