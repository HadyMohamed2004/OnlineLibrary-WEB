// allBooks-script.js

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get borrowed books from localStorage
function getBorrowedBooksFromStorage() {
    return JSON.parse(localStorage.getItem('borrowedBooks')) || [];
}

// Get wishlist from localStorage
function getWishlistFromStorage() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

// Filter books based on selected criteria
function filterBooks() {
    let books = getBooksFromStorage();
    const categoryFilter = document.getElementById('category-filter').value;
    const availabilityFilter = document.getElementById('availability-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    // Apply category filter
    if (categoryFilter !== 'all') {
        books = books.filter(book => book.category.toLowerCase() === categoryFilter);
    }

    // Apply availability filter
    if (availabilityFilter !== 'all') {
        const isAvailable = availabilityFilter === 'available';
        books = books.filter(book => book.available === isAvailable);
    }

    // Apply sorting
    switch (sortBy) {
        case 'title':
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            books.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'author':
            books.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'recent':
            // In a real app, you'd sort by date added
            // For now, we'll just use the ID as a proxy for "recently added"
            books.sort((a, b) => b.id - a.id);
            break;
    }

    return books;
}

// Render books in the grid
function renderBooks() {
    const filteredBooks = filterBooks();
    const bookGrid = document.querySelector('.book-grid');
    const currentUser = getCurrentUser();

    // Get user's borrowed books
    const userBorrowedBooks = [];
    if (currentUser) {
        const allBorrowedBooks = getBorrowedBooksFromStorage();
        allBorrowedBooks.forEach(item => {
            if (item.userId === currentUser.id) {
                userBorrowedBooks.push(item.bookId);
            }
        });
    }

    // Clear existing content
    bookGrid.innerHTML = '';

    // If no books match filters
    if (filteredBooks.length === 0) {
        bookGrid.innerHTML = '<p class="no-books-message">No books match your filter criteria.</p>';
        return;
    }

    // Create a card for each book
    filteredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';

        // Check if the current user has borrowed this book
        const hasBorrowed = currentUser && userBorrowedBooks.includes(book.id);

        // Create book card HTML
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="category">${book.category}</p>
                <p class="status ${book.available ? 'available' : 'borrowed'}">${book.available ? 'Available' : 'Borrowed'}</p>
                <div class="book-actions">
                    <a href="BookInfo.html" class="view-btn" data-book-id="${book.id}">View Details</a>
                    ${!currentUser ?
                `<button class="login-prompt-btn" data-action="borrow">Login to Borrow</button>` :
                hasBorrowed ?
                    `<button class="borrowed-by-you-btn" disabled>Borrowed by You</button>` :
                    book.available ?
                        `<button class="borrow-btn" data-book-id="${book.id}">Borrow</button>` :
                        `<button class="wishlist-btn" data-book-id="${book.id}">Add to Wishlist</button>`
            }
                </div>
            </div>
        `;

        bookGrid.appendChild(bookCard);
    });

    // Add styles for the borrowed-by-you button
    addBorrowedByYouStyles();

    // Add event listeners to buttons
    addButtonEventListeners();
}

// Add styles for the borrowed-by-you button
function addBorrowedByYouStyles() {
    if (document.getElementById('borrowed-by-you-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'borrowed-by-you-styles';
    style.textContent = `
        .borrowed-by-you-btn {
            background-color: #e9573f;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: not-allowed;
            font-weight: bold;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}

// Add event listeners to buttons
function addButtonEventListeners() {
    // View details links
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const bookId = parseInt(this.getAttribute('data-book-id'));

            // Store selected book ID in sessionStorage
            sessionStorage.setItem('selectedBookId', bookId);

            // Redirect to book details page
            window.location.href = 'BookInfo.html';
        });
    });

    // Borrow buttons
    document.querySelectorAll('.borrow-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            borrowBook(bookId);
        });
    });

    // Add to wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            addToWishlist(bookId);
        });
    });

    // Login prompt buttons
    document.querySelectorAll('.login-prompt-btn').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            alert(`Please log in to ${action} books.`);
            window.location.href = 'logIn.html';
        });
    });
}

// Borrow a book
function borrowBook(bookId) {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to borrow books.');
        window.location.href = 'logIn.html';
        return;
    }

    // Check if user is suspended
    if (currentUser.status === 'suspended') {
        alert('Your account is suspended. You cannot borrow books at this time.');
        return;
    }

    // Get current books and borrowed books from storage
    const books = getBooksFromStorage();
    const allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Check if user has already borrowed this book
    const alreadyBorrowed = allBorrowedBooks.some(item =>
        item.bookId === bookId && item.userId === currentUser.id
    );

    if (alreadyBorrowed) {
        alert('You have already borrowed this book.');
        return;
    }

    // Find the book to borrow
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1 && books[bookIndex].available) {
        // Update book availability
        books[bookIndex].available = false;

        // Add to borrowed books
        allBorrowedBooks.push({
            userId: currentUser.id, // Store the user ID who borrowed
            bookId: bookId,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('borrowedBooks', JSON.stringify(allBorrowedBooks));

        // Show success message
        alert(`You have successfully borrowed "${books[bookIndex].title}". It is due back in 14 days.`);

        // Refresh the displayed books
        renderBooks();
    } else {
        alert('This book is not available for borrowing.');
    }
}

// Add a book to wishlist
function addToWishlist(bookId) {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to add books to your wishlist.');
        window.location.href = 'logIn.html';
        return;
    }

    // Get wishlist
    let wishlist = getWishlistFromStorage();

    // Check if we need to convert the old format to the new format
    if (wishlist.length > 0 && typeof wishlist[0] !== 'object') {
        // Convert old format to new format
        const oldWishlist = wishlist;
        wishlist = oldWishlist.map(bookId => ({
            userId: currentUser.id,
            bookId: bookId
        }));
    }

    // Check if book is already in wishlist for this user
    const alreadyInWishlist = wishlist.some(item =>
        item.userId === currentUser.id && item.bookId === bookId
    );

    if (alreadyInWishlist) {
        alert('This book is already in your wishlist.');
        return;
    }

    // Add to wishlist
    wishlist.push({
        userId: currentUser.id,
        bookId: bookId
    });

    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // Show success message
    alert('Book added to wishlist.');
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Render books with initial filters
    renderBooks();

    // Add event listeners to filter controls
    document.getElementById('category-filter').addEventListener('change', renderBooks);
    document.getElementById('availability-filter').addEventListener('change', renderBooks);
    document.getElementById('sort-by').addEventListener('change', renderBooks);
});