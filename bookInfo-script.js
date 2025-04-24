// bookInfo-script.js

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get borrowed books from localStorage
function getBorrowedBooksFromStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Filter to only show books borrowed by the current user
    return allBorrowedBooks.filter(item =>
        item.userId === currentUser.id ||
        // Support for legacy data that doesn't have userId
        !item.hasOwnProperty('userId')
    );
}

// Get wishlist from localStorage
function getWishlistFromStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If the old format (just bookIds), convert to new format
    if (allWishlistItems.length > 0 && typeof allWishlistItems[0] !== 'object') {
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

// Get book IDs from user's wishlist
function getBookIdsFromWishlist() {
    const wishlistItems = getWishlistFromStorage();
    return wishlistItems.map(item =>
        // Support both new format (object with bookId) and old format (just bookId)
        item.hasOwnProperty('bookId') ? item.bookId : item
    );
}

// Check if a book is in wishlist
function isInWishlist(bookId) {
    const wishlistBookIds = getBookIdsFromWishlist();
    return wishlistBookIds.includes(bookId);
}

// Show/hide admin features
function showAdminFeatures() {
    const role = getUserRole();
    const editBookForm = document.getElementById('edit-book-form');

    // Show edit book button only for admins
    if (role === 'admin') {
        editBookForm.style.display = 'block';
    } else {
        editBookForm.style.display = 'none';
    }
}

// Render book details
function renderBookDetails() {
    // Get the selected book ID from sessionStorage
    const bookId = parseInt(sessionStorage.getItem('selectedBookId'));

    if (!bookId) {
        window.location.href = 'index.html';
        return;
    }

    // Get the book details
    const books = getBooksFromStorage();
    const book = books.find(b => b.id === bookId);

    if (!book) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    document.title = `${book.title} by ${book.author} - Online Shelf`;

    // Update the page elements with book details
    document.querySelector('.book-container img').src = book.cover;
    document.querySelector('.book-container img').alt = book.title;
    document.querySelector('.book-info h1').textContent = book.title;
    document.querySelector('.book-info h2').textContent = book.author;

    // Update paragraphs with book information
    const paragraphs = document.querySelectorAll('.book-info p');
    paragraphs[0].innerHTML = `<strong>Category:</strong> ${book.category}`;
    paragraphs[1].innerHTML = `<strong>Description:</strong> ${book.description}`;
    paragraphs[2].innerHTML = `<strong>Book ID:</strong> ${book.id}`;
    paragraphs[3].innerHTML = `<strong>Pages:</strong> ${book.pages}`;
    paragraphs[4].innerHTML = `<strong>Availability Status:</strong> ${book.available ? 'Available' : 'Borrowed'}`;

    // Update buttons
    const borrowButton = document.getElementById('borrow-btn');
    const wishlistButton = document.getElementById('wishlist-btn');

    // Update borrow button
    if (book.available) {
        borrowButton.textContent = 'Borrow This Book';
        borrowButton.disabled = false;
    } else {
        borrowButton.textContent = 'Currently Unavailable';
        borrowButton.disabled = true;
    }

    // Update wishlist button
    if (isInWishlist(book.id)) {
        wishlistButton.textContent = 'Remove from Wishlist';
    } else {
        wishlistButton.textContent = 'Add to Wishlist';
    }

    // Show or hide buttons based on login status
    const currentUser = getCurrentUser();
    if (!currentUser) {
        borrowButton.style.display = 'block';
        wishlistButton.style.display = 'block';
        borrowButton.textContent = 'Login to Borrow';
        wishlistButton.textContent = 'Login to Add to Wishlist';
    } else {
        borrowButton.style.display = 'block';
        wishlistButton.style.display = 'block';
    }

    // Remove any existing event listeners (to prevent duplicates)
    borrowButton.replaceWith(borrowButton.cloneNode(true));
    wishlistButton.replaceWith(wishlistButton.cloneNode(true));

    // Get the new button references after cloning
    const newBorrowButton = document.getElementById('borrow-btn');
    const newWishlistButton = document.getElementById('wishlist-btn');

    // Add event listeners
    newBorrowButton.addEventListener('click', function () {
        // Check if user is logged in
        if (!getCurrentUser()) {
            alert('Please log in to borrow books.');
            window.location.href = 'logIn.html';
            return;
        }
        borrowBook(book.id);
    });

    newWishlistButton.addEventListener('click', function () {
        // Check if user is logged in
        if (!getCurrentUser()) {
            alert('Please log in to add books to your wishlist.');
            window.location.href = 'logIn.html';
            return;
        }
        toggleWishlist(book.id);
    });

    // Store book ID for edit form
    const editForm = document.getElementById('edit-book-form');
    if (editForm) {
        editForm.addEventListener('submit', function () {
            sessionStorage.setItem('editBookId', bookId);
        });
    }
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
            userId: currentUser.id,
            bookId: bookId,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('borrowedBooks', JSON.stringify(allBorrowedBooks));

        // Show success message
        alert(`You have successfully borrowed "${books[bookIndex].title}". It is due back in 14 days.`);

        // Refresh the displayed details
        renderBookDetails();
    } else {
        alert('This book is not available for borrowing.');
    }
}

// Toggle wishlist status
function toggleWishlist(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to manage your wishlist.');
        window.location.href = 'logIn.html';
        return;
    }

    let allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isAlreadyInWishlist = isInWishlist(bookId);

    if (isAlreadyInWishlist) {
        // Remove from wishlist
        if (allWishlistItems.length > 0 && typeof allWishlistItems[0] === 'object') {
            // New format
            allWishlistItems = allWishlistItems.filter(item =>
                !(item.userId === currentUser.id && item.bookId === bookId)
            );
        } else {
            // Old format
            allWishlistItems = allWishlistItems.filter(id => id !== bookId);
        }
        alert('Book removed from wishlist.');
    } else {
        // Add to wishlist
        if (allWishlistItems.length > 0 && typeof allWishlistItems[0] === 'object') {
            // New format
            allWishlistItems.push({
                userId: currentUser.id,
                bookId: bookId
            });
        } else {
            // Old format - convert to new format
            const newWishlist = [];

            // Add existing items in the new format
            allWishlistItems.forEach(existingBookId => {
                newWishlist.push({
                    userId: currentUser.id,
                    bookId: existingBookId
                });
            });

            // Add the new item
            newWishlist.push({
                userId: currentUser.id,
                bookId: bookId
            });

            allWishlistItems = newWishlist;
        }
        alert('Book added to wishlist.');
    }

    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(allWishlistItems));

    // Refresh the displayed details
    renderBookDetails();
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize localStorage if needed
    initializeLocalStorage();

    // Show/hide admin features
    showAdminFeatures();

    // Render book details
    renderBookDetails();
});