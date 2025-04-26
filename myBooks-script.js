// myBooks-script.js

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get borrowed books from localStorage for current user only
function getBorrowedBooksFromStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Filter to only show books borrowed by the current user
    return allBorrowedBooks.filter(item =>
        (item.userId && item.userId === currentUser.id)
    );
}

// Render the borrowed books
function renderBorrowedBooks() {
    const books = getBooksFromStorage();
    const borrowedBooks = getBorrowedBooksFromStorage();
    const bookGrid = document.querySelector('.book-grid');

    // Clear existing content
    bookGrid.innerHTML = '';

    // Add CSS for grid layout and card styling
    addGridStyles();

    // If no borrowed books
    if (borrowedBooks.length === 0) {
        bookGrid.innerHTML = '<p class="no-books-message">You have not borrowed any books yet.</p>';
        return;
    }

    // Create a card for each borrowed book
    borrowedBooks.forEach(borrowedItem => {
        // Find the book details
        const book = books.find(b => b.id === borrowedItem.bookId);

        if (book) {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';

            // Calculate days remaining
            const dueDate = new Date(borrowedItem.dueDate);
            const today = new Date();
            const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            // Create book card HTML
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/10648514-L.jpg'">
                </div>
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="due-date">Due in ${daysRemaining} days</p>
                </div>
                <div class="my-books-actions">
                    <button class="view-btn" data-book-id="${book.id}">View Book</button>
                    <button class="return-btn" data-book-id="${book.id}">Return</button>
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
    // View book buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            viewBookDetails(bookId);
        });
    });

    // Return book buttons
    document.querySelectorAll('.return-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));
            returnBook(bookId);
        });
    });
}

// View book details
function viewBookDetails(bookId) {
    // Store selected book ID in sessionStorage for the details page
    sessionStorage.setItem('selectedBookId', bookId);

    // Redirect to book details page
    window.location.href = 'BookInfo.html';
}

// Return a book
function returnBook(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to return books.');
        window.location.href = 'logIn.html';
        return;
    }

    // Get current books and borrowed books from storage
    const books = getBooksFromStorage();
    let allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Find the book to return
    const bookIndex = books.findIndex(book => book.id === bookId);

    // Find the borrowed book entry for this user
    const borrowedIndex = allBorrowedBooks.findIndex(item =>
        item.bookId === bookId && item.userId === currentUser.id
    );

    if (bookIndex !== -1 && borrowedIndex !== -1) {
        // Update book availability
        books[bookIndex].available = true;

        // Remove from borrowed books
        allBorrowedBooks.splice(borrowedIndex, 1);

        // Update localStorage
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('borrowedBooks', JSON.stringify(allBorrowedBooks));

        // Show success message
        alert(`You have successfully returned "${books[bookIndex].title}".`);

        // Refresh the displayed books
        renderBorrowedBooks();
    } else {
        alert('Error returning the book. Please try again.');
    }
}

// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login page if not logged in
        alert('Please log in to view your borrowed books.');
        window.location.href = 'logIn.html';
        return;
    }

    // Render the borrowed books
    renderBorrowedBooks();

    // Add click event for book covers and details to view book info
    document.querySelector('.book-grid').addEventListener('click', function (e) {
        const bookCover = e.target.closest('.book-cover');
        const bookDetails = e.target.closest('.book-details');

        if (bookCover || bookDetails) {
            const bookCard = (bookCover || bookDetails).closest('.book-card');
            if (bookCard) {
                const viewButton = bookCard.querySelector('.view-btn');
                const bookId = parseInt(viewButton.getAttribute('data-book-id'));

                // View book details
                viewBookDetails(bookId);
            }
        }
    });
});