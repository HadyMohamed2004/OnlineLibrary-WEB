// addBook-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
        // Redirect to login page if not admin
        alert('You need to be logged in as an admin to access this page.');
        window.location.href = 'logIn.html';
        return;
    }

    // Preview cover image when URL changes
    const coverUrlInput = document.getElementById('cover-url');
    const coverPreview = document.getElementById('cover-preview');

    coverUrlInput.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
            coverPreview.src = url;
        } else {
            coverPreview.src = 'https://via.placeholder.com/150x210?text=Book+Cover';
        }
    });

    // Handle form submission
    const addBookForm = document.getElementById('add-book-form');

    addBookForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const pages = parseInt(document.getElementById('pages').value) || 0;
        const available = document.getElementById('status').value === 'available';
        const coverUrl = document.getElementById('cover-url').value.trim() || 'https://via.placeholder.com/150x210?text=Book+Cover';

        // Validate required fields
        if (!title || !author) {
            alert('Please fill in all required fields.');
            return;
        }

        // Get existing books
        const books = JSON.parse(localStorage.getItem('books')) || [];

        // Create new book object
        const newBook = {
            id: books.length > 0 ? Math.max(...books.map(book => book.id)) + 1 : 1,
            title: title,
            author: author,
            cover: coverUrl,
            category: category,
            description: description,
            pages: pages,
            available: available
        };

        // Add to books array
        books.push(newBook);

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));

        // Show success message
        alert('Book added successfully!');

        // Reset form
        addBookForm.reset();
        coverPreview.src = 'https://via.placeholder.com/150x210?text=Book+Cover';
    });

    // Handle cancel button
    document.getElementById('cancel-btn').addEventListener('click', function () {
        // Confirm before canceling
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            window.location.href = 'AdminDashboard.html';
        }
    });
});