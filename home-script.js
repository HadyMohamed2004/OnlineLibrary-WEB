// home-script.js

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

// Render the featured books section
function renderFeaturedBooks() {
    const booksData = getBooksFromStorage();
    const bookGrid = document.querySelector('.book-grid');
    const currentUser = getCurrentUser();

    // Get user's wishlist book IDs
    let userWishlistBookIds = [];
    let userBorrowedBookIds = [];

    if (currentUser) {
        // Get wishlist
        const wishlistItems = getWishlistFromStorage();
        userWishlistBookIds = wishlistItems
            .filter(item => typeof item === 'object' ? item.userId === currentUser.id : true)
            .map(item => typeof item === 'object' ? item.bookId : item);

        // Get borrowed books
        const borrowedItems = getBorrowedBooksFromStorage();
        userBorrowedBookIds = borrowedItems
            .filter(item => item.userId === currentUser.id)
            .map(item => item.bookId);
    }

    // Clear existing content
    bookGrid.innerHTML = '';

    // Display up to 4 books for featured section
    const featuredBooks = booksData.slice(0, 4);

    featuredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';

        // Check if book is in user's wishlist
        const inWishlist = currentUser && userWishlistBookIds.includes(book.id);
        // Check if user has borrowed this book
        const hasBorrowed = currentUser && userBorrowedBookIds.includes(book.id);

        // Create book card HTML
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}">
            <p>${book.title}</p>
            <form class="borrow-btn">
                ${!currentUser ?
                `<button type="button" class="login-button" data-book-id="${book.id}">
                       Login to Use
                     </button>` :
                hasBorrowed ?
                    `<button type="button" class="borrowed-button" data-book-id="${book.id}" disabled>
                          Borrowed by You
                        </button>` :
                    book.available ?
                        `<button type="button" class="borrow-button" data-book-id="${book.id}">
                               Borrow
                             </button>` :
                        `<button type="button" class="wishlist-button" data-book-id="${book.id}">
                               ${inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                             </button>`
            }
            </form>
        `;

        bookGrid.appendChild(bookCard);
    });

    // Add button styles
    addButtonStyles();

    // Add event listeners to buttons
    addButtonEventListeners();
}

// Add CSS for hover effect and button colors
function addButtonStyles() {
    // Check if we already added the styles
    if (document.getElementById('home-button-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'home-button-styles';
    style.textContent = `
        .book-card {
            transition: all 0.3s ease;
        }
        
        .book-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            background-color: #f9f9f9;
        }
        
        .borrow-button {
            background-color: #a0d468 !important; /* Green */
            color: white;
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .borrow-button:hover {
            background-color: #8cc152 !important; /* Darker Green */
        }
        
        .wishlist-button {
            background-color: #f6bb42 !important; /* Yellow */
            color: white;
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .wishlist-button:hover {
            background-color: #e6b03e !important; /* Darker Yellow */
        }
        
        .login-button {
            background-color: #4a89dc !important; /* Blue */
            color: white;
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .login-button:hover {
            background-color: #3a70c2 !important; /* Darker Blue */
        }
        
        .borrowed-button {
            background-color: #e9573f !important; /* Red */
            color: white;
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: not-allowed;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// Add event listeners to buttons
function addButtonEventListeners() {
    // Borrow buttons
    document.querySelectorAll('.borrow-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const bookId = parseInt(this.getAttribute('data-book-id'));
            borrowBook(bookId);
        });
    });

    // Wishlist buttons
    document.querySelectorAll('.wishlist-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const bookId = parseInt(this.getAttribute('data-book-id'));
            addToWishlist(bookId);
        });
    });

    // Login buttons
    document.querySelectorAll('.login-button').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Please log in to use this feature.');
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
    const allBorrowedBooks = getBorrowedBooksFromStorage();

    // Check if the user has already borrowed this book
    const alreadyBorrowed = allBorrowedBooks.some(item =>
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

        // Add to borrowed books with user ID
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

        // Refresh the displayed books
        renderFeaturedBooks();
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

    // Get current wishlist
    let allWishlistItems = getWishlistFromStorage();

    // Convert old wishlist format if needed
    if (allWishlistItems.length > 0 && typeof allWishlistItems[0] !== 'object') {
        // Convert old format to new format with user ID
        allWishlistItems = allWishlistItems.map(oldBookId => ({
            userId: currentUser.id,
            bookId: oldBookId
        }));
    }

    // Check if book is already in user's wishlist
    const alreadyInWishlist = allWishlistItems.some(item =>
        item.userId === currentUser.id && item.bookId === bookId
    );

    if (alreadyInWishlist) {
        alert('This book is already in your wishlist.');
        return;
    }

    // Add to wishlist with user ID
    allWishlistItems.push({
        userId: currentUser.id,
        bookId: bookId
    });

    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(allWishlistItems));

    // Show success message
    alert('Book added to wishlist.');

    // Refresh the displayed books
    renderFeaturedBooks();
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize localStorage with sample data
    initializeLocalStorage();

    // Add button styles
    addButtonStyles();

    // Render the featured books
    renderFeaturedBooks();

    // Add a click event to the book cards for viewing details
    document.querySelector('.book-grid').addEventListener('click', function (e) {
        // If the clicked element is an image or a paragraph (title)
        if (e.target.tagName === 'IMG' || e.target.tagName === 'P') {
            // Find the closest book-card parent
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                // Get the book ID from the button
                const button = bookCard.querySelector('button');
                const bookId = parseInt(button.getAttribute('data-book-id'));

                // Store selected book ID in sessionStorage for the details page
                sessionStorage.setItem('selectedBookId', bookId);

                // Redirect to book details page
                window.location.href = 'BookInfo.html';
            }
        }
    });
});