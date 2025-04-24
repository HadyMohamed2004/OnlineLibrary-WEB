// adminDashboard-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
        // Redirect to login page if not admin
        alert('You need to be logged in as an admin to access this page.');
        window.location.href = 'logIn.html';
        return;
    }

    // Load books and users
    loadBooks();
    loadUsers();

    // Add event listener to "Add New Book" button
    document.getElementById('add-book-btn').addEventListener('click', function () {
        window.location.href = 'addBook.html';
    });
});

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get users from localStorage
function getUsersFromStorage() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Load books into the books management section
function loadBooks() {
    const books = getBooksFromStorage();
    const bookGrid = document.getElementById('admin-book-grid');

    // Clear existing content
    bookGrid.innerHTML = '';

    // Show only the first 4 books (or fewer if less available)
    const booksToShow = books.slice(0, 4);

    booksToShow.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        bookItem.innerHTML = `
            <img src="${book.cover}" alt="Book Cover">
            <div class="book-actions">
                <p>${book.title} by ${book.author}</p>
                <div class="action-buttons">
                    <button class="edit-btn" data-book-id="${book.id}">Edit</button>
                    <button class="delete-btn" data-book-id="${book.id}">Delete</button>
                </div>
            </div>
        `;

        bookGrid.appendChild(bookItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = this.getAttribute('data-book-id');
            sessionStorage.setItem('editBookId', bookId);
            window.location.href = 'EditBook.html';
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            deleteBook(bookId);
        });
    });
}

// Delete a book
function deleteBook(bookId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    // Get books from storage
    let books = getBooksFromStorage();

    // Find and remove the book
    books = books.filter(book => book.id !== bookId);

    // Update localStorage
    localStorage.setItem('books', JSON.stringify(books));

    // Reload books
    loadBooks();

    // Show success message
    alert('Book deleted successfully.');
}

// Load users into the user management section
function loadUsers() {
    const users = getUsersFromStorage();
    const userList = document.getElementById('admin-user-list');
    const currentUser = getCurrentUser();

    // Clear existing content
    userList.innerHTML = '';

    // Show only the first 4 users (or fewer if less available)
    const usersToShow = users.slice(0, 4);

    usersToShow.forEach(user => {
        // Get initials for avatar
        const names = user.fullName.split(' ');
        const initials = names.map(name => name.charAt(0)).join('');

        // Check if this user is the current admin
        const isSelf = currentUser && user.id === currentUser.id;

        const userItem = document.createElement('div');
        userItem.className = 'user-item';

        userItem.innerHTML = `
            <div class="user-avatar">${initials}</div>
            <div class="user-details">
                <p class="user-name">${user.fullName}</p>
                <p class="user-email">${user.email}</p>
            </div>
            <div class="user-actions">
                ${!isSelf ?
                `<button class="suspend-btn" data-user-id="${user.id}">
                        ${user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>` :
                ''
            }
            </div>
        `;

        userList.appendChild(userItem);
    });

    // Add event listeners to suspend buttons
    document.querySelectorAll('.suspend-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = parseInt(this.getAttribute('data-user-id'));
            toggleUserStatus(userId);
        });
    });
}

// Toggle user status (suspend/activate)
function toggleUserStatus(userId) {
    // Get users from storage
    let users = getUsersFromStorage();
    const currentUser = getCurrentUser();

    // Prevent admins from suspending themselves
    if (currentUser && userId === currentUser.id) {
        alert('You cannot suspend your own account.');
        return;
    }

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        // Toggle status
        users[userIndex].status = users[userIndex].status === 'active' ? 'suspended' : 'active';

        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Reload users
        loadUsers();

        // Show success message
        const statusVerb = users[userIndex].status === 'active' ? 'activated' : 'suspended';
        alert(`User ${statusVerb} successfully.`);
    }
}