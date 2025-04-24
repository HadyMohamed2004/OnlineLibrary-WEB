// editBook-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
        // Redirect to login page if not admin
        alert('You need to be logged in as an admin to access this page.');
        window.location.href = 'logIn.html';
        return;
    }

    // Get book ID from sessionStorage
    const bookId = parseInt(sessionStorage.getItem('editBookId'));

    if (!bookId) {
        alert('No book selected for editing.');
        window.location.href = 'AdminDashboard.html';
        return;
    }

    // Load book details
    loadBookDetails(bookId);

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
    const editBookForm = document.getElementById('edit-book-form');

    editBookForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const pages = parseInt(document.getElementById('pages').value) || 0;
        const available = document.getElementById('status').value === 'available';
        const coverUrl = document.getElementById('cover-url').value.trim();

        // Validate required fields
        if (!title || !author) {
            alert('Please fill in all required fields.');
            return;
        }

        // Get existing books
        const books = JSON.parse(localStorage.getItem('books')) || [];

        // Find the book index
        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex === -1) {
            alert('Book not found.');
            return;
        }

        // Update book object
        books[bookIndex] = {
            ...books[bookIndex],
            title: title,
            author: author,
            category: category,
            description: description,
            pages: pages,
            available: available
        };

        // Update cover if provided
        if (coverUrl) {
            books[bookIndex].cover = coverUrl;
        }

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));

        // Show success message
        alert('Book updated successfully!');

        // Redirect to admin dashboard
        window.location.href = 'AdminDashboard.html';
    });

    // Handle delete button
    document.getElementById('delete-btn').addEventListener('click', function () {
        deleteBook(bookId);
    });
});

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Load book details into the form
function loadBookDetails(bookId) {
    const books = getBooksFromStorage();
    const book = books.find(b => b.id === bookId);

    if (!book) {
        alert('Book not found.');
        window.location.href = 'AdminDashboard.html';
        return;
    }

    // Populate form fields
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('category').value = book.category;
    document.getElementById('description').value = book.description;
    document.getElementById('pages').value = book.pages;
    document.getElementById('status').value = book.available ? 'available' : 'borrowed';
    document.getElementById('cover-url').value = book.cover;
    document.getElementById('cover-preview').src = book.cover;
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

    // Show success message
    alert('Book deleted successfully.');

    // Redirect to admin dashboard
    window.location.href = 'AdminDashboard.html';
}