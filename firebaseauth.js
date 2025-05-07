// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js"; // Import Firestore functions
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBO5tAB_JPX4Pf3-IgwlrnETvfADMrmlEA",
  authDomain: "ruhan-62122.firebaseapp.com",
  projectId: "ruhan-62122",
  storageBucket: "ruhan-62122.firebasestorage.app",
  messagingSenderId: "668836602588",
  appId: "1:668836602588:web:0ad63c8a85040a382e0a19",
  measurementId: "G-W4TLF1PLPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Initialize analytics

// Function to handle user signup
window.handleSignup = function (event) {
  event.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User signed up:", user);
      window.location.href = 'chatbot.html'; // Redirect to chatbot
    })
    .catch((error) => {
      console.error("Signup error:", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = error.message; // Display error message
      document.getElementById('signupForm').appendChild(errorDiv);

      setTimeout(() => {
        errorDiv.remove();
      }, 3000);
    });
}

// Function to handle user login
window.handleLogin = function (event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked; // Check if Remember Me is checked

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User logged in:", user);
      if (rememberMe) {
        localStorage.setItem('userEmail', email); // Store email in localStorage
      } else {
        sessionStorage.setItem('userEmail', email); // Store email in sessionStorage
      }
      window.location.href = 'chatbot.html'; // Redirect to chatbot
    })
    .catch((error) => {
      console.error("Login error:", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = error.message; // Display error message
      document.getElementById('loginForm').appendChild(errorDiv);

      setTimeout(() => {
        errorDiv.remove();
      }, 3000);
    });
}

// Check if user is already logged in
window.onload = function () {
  const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
  if (storedEmail) {
    // Automatically log in the user
    const loginEmailInput = document.getElementById('loginEmail');
    if (loginEmailInput) {
      loginEmailInput.value = storedEmail;
      // Optionally, you can trigger the login function here if you want to log them in automatically
      // handleLogin(); // Uncomment this line if you want to auto-login
    } else {
      console.error("Element with ID 'loginEmail' not found.");
    }
  }
};

// Function to handle logout
function logout() {
  // Clear the stored email
  localStorage.removeItem('userEmail');
  // Perform logout logic here
  // For example, you can call signOut(auth) from Firebase
}

// Function to save chat history
async function saveChatHistory(userId, chatHistory) {
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
    return data.chatHistory || []; // Return chat history or an empty array
  } else {
    console.log("No chat history found for this user.");
    return []; // Return an empty array if no history found
  }
}

// Export the auth and db variables
export { auth, db };

// Ensure the rest of your code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Your other initialization code here
});
