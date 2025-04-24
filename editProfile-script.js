// editProfile-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = getCurrentUser();

    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'logIn.html';
        return;
    }

    // Load user profile details
    loadProfileDetails(currentUser);

    // Handle profile form submission
    const profileForm = document.getElementById('profile-form');
    const profileError = document.getElementById('profile-error');

    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value.trim();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();

            // Validate inputs
            if (!fullname || !username || !email) {
                profileError.textContent = 'All fields are required.';
                profileError.style.display = 'block';
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                profileError.textContent = 'Please enter a valid email address.';
                profileError.style.display = 'block';
                return;
            }

            // Check if username or email is already taken by another user
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const existingUser = users.find(u =>
                (u.username === username || u.email === email) && u.id !== currentUser.id
            );

            if (existingUser) {
                profileError.textContent = 'Username or email already in use by another user.';
                profileError.style.display = 'block';
                return;
            }

            // Update user details
            updateUserProfile(currentUser.id, fullname, username, email);

            // Show success message
            alert('Profile updated successfully!');

            // Hide error message
            profileError.style.display = 'none';
        });
    }

    // Handle password form submission
    const passwordForm = document.getElementById('password-form');
    const passwordError = document.getElementById('password-error');

    if (passwordForm) {
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Get users from storage
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Find the user
            const user = users.find(u => u.id === currentUser.id);

            if (!user) {
                passwordError.textContent = 'User not found.';
                passwordError.style.display = 'block';
                return;
            }

            // Verify current password
            if (user.password !== currentPassword) {
                passwordError.textContent = 'Current password is incorrect.';
                passwordError.style.display = 'block';
                return;
            }

            // Validate new password
            if (newPassword.length < 6) {
                passwordError.textContent = 'New password must be at least 6 characters long.';
                passwordError.style.display = 'block';
                return;
            }

            // Confirm new password
            if (newPassword !== confirmPassword) {
                passwordError.textContent = 'New passwords do not match.';
                passwordError.style.display = 'block';
                return;
            }

            // Update user password
            updateUserPassword(currentUser.id, newPassword);

            // Show success message
            alert('Password updated successfully!');

            // Reset form
            passwordForm.reset();

            // Hide error message
            passwordError.style.display = 'none';
        });
    }
});

// Load user profile details
function loadProfileDetails(user) {
    // Set profile initials
    const names = user.fullName.split(' ');
    const initials = names.map(name => name.charAt(0)).join('');
    document.getElementById('profile-initials').textContent = initials;

    // Set form fields
    document.getElementById('fullname').value = user.fullName;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
}

// Update user profile
function updateUserProfile(userId, fullName, username, email) {
    // Get users from storage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        // Update user details
        users[userIndex].fullName = fullName;
        users[userIndex].username = username;
        users[userIndex].email = email;

        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user in session
        const currentUser = getCurrentUser();
        currentUser.fullName = fullName;
        currentUser.username = username;
        currentUser.email = email;

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Update user password
function updateUserPassword(userId, newPassword) {
    // Get users from storage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        // Update password
        users[userIndex].password = newPassword;

        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Add error message styling
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .error-message {
            color: #e9573f;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            display: none;
        }
    </style>
`);