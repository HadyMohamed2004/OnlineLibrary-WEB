// login-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Redirect to home page
        window.location.href = '/index.html';
        return;
    }

    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Basic validation
            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password.';
                errorMessage.style.display = 'block';
                return;
            }

            if (login(username, password)) {
                // Redirect to home page after successful login
                window.location.href = '/index.html';
            } else {
                // Display error message
                errorMessage.textContent = 'Invalid username or password. Please try again.';
                errorMessage.style.display = 'block';
                
                // Clear password field
                document.getElementById('password').value = '';
            }
        });
    }
});