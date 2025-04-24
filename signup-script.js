// signup-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Redirect to home page
        window.location.href = 'index.html';
        return;
    }

    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('signup-error');

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match.';
                errorMessage.style.display = 'block';
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorMessage.textContent = 'Please enter a valid email address.';
                errorMessage.style.display = 'block';
                return;
            }

            // Check if username or email already exists
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const existingUser = users.find(u => u.username === username || u.email === email);

            if (existingUser) {
                errorMessage.textContent = 'Username or email already exists.';
                errorMessage.style.display = 'block';
                return;
            }

            // Create new user
            const newUser = {
                id: users.length + 1,
                fullName: fullname,
                email: email,
                username: username,
                password: password, // In a real app, this should be hashed
                role: 'user', // Default role is always 'user'
                joinDate: new Date().toISOString(),
                status: 'active'
            };

            // Add user to localStorage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Log the user in
            const { password: pwd, ...userWithoutPassword } = newUser;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});