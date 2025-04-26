// wishlist-script.js

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get wishlist from localStorage
function getWishlistFromStorage() {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If the old format (just bookIds), convert to new format
    if (allWishlistItems.length > 0 && !isObject(allWishlistItems[0])) {
        // Convert old format to new format
        const newWishlist = allWishlistItems.map(bookId => ({
            userId: currentUser.id,
            bookId: bookId
        }));

        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
    }

    // Filter to only show wishlist items for the current user
    return allWishlistItems.filter(item =>
        item.userId === currentUser.id ||
        // Support for legacy data
        !item.hasOwnProperty('userId')
    );
}

// Helper function to check if value is an object
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Get book IDs from user's wishlist
function getBookIdsFromWishlist() {
    const wishlistItems = getWishlistFromStorage();
    return wishlistItems.map(item =>
        // Support both new format (object with bookId) and old format (just bookId)
        item.hasOwnProperty('bookId') ? item.bookId : item
    );
}

// Render the wishlist
function renderWishlist() {
    const books = getBooksFromStorage();
    const wishlistItems = getWishlistFromStorage();
    const bookIds = getBookIdsFromWishlist();
    const bookGrid = document.querySelector('.book-grid');

    // Clear existing content
    bookGrid.innerHTML = '';

    // Add CSS for grid layout and card styling
    addGridStyles();

    // If wishlist is empty
    if (wishlistItems.length === 0) {
        bookGrid.innerHTML = '<p class="no-books-message">Your wishlist is empty.</p>';
        return;
    }

    // Create a card for each book in wishlist
    bookIds.forEach(bookId => {
        // Find the book details
        const book = books.find(b => b.id === bookId);

        if (book) {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';

            // Create book card HTML
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/10648514-L.jpg'">
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                </div>
                <div class="wishlist-actions">
                    <button class="borrow-btn" data-book-id="${book.id}" ${!book.available ? 'disabled' : ''}>
                        ${book.available ? 'Borrow' : 'Not Available'}
                    </button>
                    <button class="remove-btn" data-book-id="${book.id}">Remove</button>
                </div>
            `;

            bookGrid.appendChild(bookCard);
        }
    });

    // Add event listeners to buttons
    addButtonEventListeners();
}

// Add CSS for grid layout and card styling
function addGridStyles() {
    // Check if we already added the styles
    if (document.getElementById('grid-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'grid-styles';
    style.textContent = `
        .book-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 25px;
            padding: 20px;
        }
        
        .book-card {
            display: flex;
            flex-direction: column;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            height: 100%;
            min-height: 400px;
        }
        
        .book-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .book-cover {
            height: 250px;
            overflow: hidden;
        }
        
        .book-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .book-details {
            padding: 15px;
            flex-grow: 1;
        }
        
        .book-title {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .book-author {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        .wishlist-actions, .my-books-actions {
            display: flex;
            padding: 15px;
            gap: 10px;
        }
        
        .borrow-btn, .view-btn {
            background-color: #a0d468;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            flex-grow: 1;
            cursor: pointer;
            font-weight: bold;
        }
        
        .borrow-btn:hover, .view-btn:hover {
            background-color: #8cc152;
        }
        
        .borrow-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .remove-btn, .return-btn {
            background-color: #f6bb42;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            flex-grow: 1;
            cursor: pointer;
            font-weight: bold;
        }
        
        .remove-btn:hover, .return-btn:hover {
            background-color: #e6b03e;
        }
        
        .due-date {
            text-align: center;
            color: #e9573f;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .no-books-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 8px;
            font-size: 18px;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

// Add event listeners to buttons
function addButtonEventListeners() {
    // Borrow buttons
    document.querySelectorAll('.borrow-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            borrowBook(bookId);
        });
    });

    // Remove from wishlist buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            removeFromWishlist(bookId);
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
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Check if the user has already borrowed this book
    const alreadyBorrowed = borrowedBooks.some(item =>
        item.userId === currentUser.id && item.bookId === bookId
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
        borrowedBooks.push({
            userId: currentUser.id,
            bookId: bookId,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

        // Show success message
        alert(`You have successfully borrowed "${books[bookIndex].title}". It is due back in 14 days.`);

        // Refresh the displayed books
        renderWishlist();
    } else {
        alert('This book is not available for borrowing.');
    }
}

// Remove a book from wishlist
function removeFromWishlist(bookId) {
    const currentUser = getCurrentUser();

    // Get current wishlist
    let allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Remove the book from wishlist for this user only
    if (allWishlistItems.length > 0 && isObject(allWishlistItems[0])) {
        // New format - filter by userId and bookId
        allWishlistItems = allWishlistItems.filter(item =>
            !(item.userId === currentUser.id && item.bookId === bookId)
        );
    } else {
        // Old format - just filter by bookId
        allWishlistItems = allWishlistItems.filter(id => id !== bookId);
    }

    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(allWishlistItems));

    // Show success message
    alert('Book removed from wishlist.');

    // Refresh the displayed books
    renderWishlist();
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login page if not logged in
        alert('Please log in to view your wishlist.');
        window.location.href = 'logIn.html';
        return;
    }

    // Render the wishlist
    renderWishlist();

    // Add click event for book covers and details to view details
    document.querySelector('.book-grid').addEventListener('click', function (e) {
        const bookCover = e.target.closest('.book-cover');
        const bookDetails = e.target.closest('.book-details');

        if (bookCover || bookDetails) {
            const bookCard = (bookCover || bookDetails).closest('.book-card');
            if (bookCard) {
                const button = bookCard.querySelector('button');
                const bookId = parseInt(button.getAttribute('data-book-id'));

                // Store selected book ID in sessionStorage
                sessionStorage.setItem('selectedBookId', bookId);

                // Redirect to book details page
                window.location.href = 'BookInfo.html';
            }
        }
    });
});