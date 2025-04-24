// userDashboard-script.js

// Update profile information
function updateProfileInfo() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'logIn.html';
        return;
    }

    // Update profile details
    document.getElementById('profile-name').textContent = currentUser.fullName;
    document.getElementById('profile-email').textContent = currentUser.email;

    // Format join date
    const joinDate = new Date(currentUser.joinDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('profile-date').textContent = joinDate.toLocaleDateString('en-US', options);

    // Set profile initials
    const names = currentUser.fullName.split(' ');
    const initials = names.map(name => name.charAt(0)).join('');
    document.getElementById('profile-initials').textContent = initials;
}

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get borrowed books from localStorage for the current user
function getBorrowedBooksFromStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Filter to only show books borrowed by the current user
    return allBorrowedBooks.filter(borrowedItem =>
        borrowedItem.userId === currentUser.id ||
        // Support for legacy data that doesn't have userId
        !borrowedItem.hasOwnProperty('userId')
    );
}

// Get wishlist from localStorage for the current user
function getWishlistFromStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If the old format (just bookIds), convert to new format
    if (allWishlistItems.length > 0 && typeof allWishlistItems[0] !== 'object') {
        // This is the old format - convert to new format
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

// Get book IDs from user's wishlist
function getBookIdsFromWishlist() {
    const wishlistItems = getWishlistFromStorage();
    return wishlistItems.map(item =>
        // Support both new format (object with bookId) and old format (just bookId)
        item.hasOwnProperty('bookId') ? item.bookId : item
    );
}

// Render borrowed books summary
function renderBorrowedBooksSummary() {
    const books = getBooksFromStorage();
    const borrowedBooks = getBorrowedBooksFromStorage();
    const bookGrid = document.getElementById('my-books-grid');

    // Clear existing content
    bookGrid.innerHTML = '';

    // If no borrowed books
    if (borrowedBooks.length === 0) {
        bookGrid.innerHTML = '<p class="no-books-message">You have not borrowed any books yet.</p>';
        return;
    }

    // Show up to 3 borrowed books
    const booksToShow = borrowedBooks.slice(0, 3);

    // Create a card for each borrowed book
    booksToShow.forEach(borrowedItem => {
        // Find the book details
        const book = books.find(b => b.id === borrowedItem.bookId);

        if (book) {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.dataset.bookId = book.id;

            // Create book card HTML
            bookCard.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/10648514-L.jpg'">
                <p>${book.title}</p>
            `;

            bookGrid.appendChild(bookCard);
        }
    });
}

// Render wishlist summary
function renderWishlistSummary() {
    const books = getBooksFromStorage();
    const wishlistBookIds = getBookIdsFromWishlist();
    const bookGrid = document.getElementById('my-wishlist-grid');

    // Clear existing content
    bookGrid.innerHTML = '';

    // If wishlist is empty
    if (wishlistBookIds.length === 0) {
        bookGrid.innerHTML = '<p class="no-books-message">Your wishlist is empty.</p>';
        return;
    }

    // Show up to 3 wishlist books
    const wishlistToShow = wishlistBookIds.slice(0, 3);

    // Create a card for each book in wishlist
    wishlistToShow.forEach(bookId => {
        // Find the book details
        const book = books.find(b => b.id === bookId);

        if (book) {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.dataset.bookId = book.id;

            // Create book card HTML
            bookCard.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/10648514-L.jpg'">
                <p>${book.title}</p>
            `;

            bookGrid.appendChild(bookCard);
        }
    });
}

// Add click event for book cards to view book info
function addBookCardEvents() {
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', function () {
            const bookId = parseInt(this.dataset.bookId);

            // Store selected book ID in sessionStorage for the details page
            sessionStorage.setItem('selectedBookId', bookId);

            // Redirect to book details page
            window.location.href = 'BookInfo.html';
        });
    });
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'logIn.html';
        return;
    }

    // Update profile information
    updateProfileInfo();

    // Render borrowed books and wishlist summaries
    renderBorrowedBooksSummary();
    renderWishlistSummary();

    // Add click events to book cards
    addBookCardEvents();
});