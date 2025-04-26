// searchResults-script.js

// Get search query from URL
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';
}

// Display search query
function displaySearchQuery() {
    const searchQuery = getSearchQuery();
    const searchInput = document.querySelector('.search-bar input[name="q"]');
    const searchTermSpan = document.querySelector('.search-term');
    
    if (searchInput) {
        searchInput.value = searchQuery;
    }
    if (searchTermSpan) {
        searchTermSpan.textContent = searchQuery ? `"${searchQuery}"` : 'all books';
    }
}

// Search books based on query and filters
function searchBooks() {
    const searchQuery = getSearchQuery().toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const availabilityFilter = document.getElementById('availability-filter').value;
    
    // Get all books from localStorage
    const books = JSON.parse(localStorage.getItem('books')) || [];
    
    // If no search query, show all books (filtered by category/availability)
    let results = books;
    
    // Apply search query filter if exists
    if (searchQuery) {
        results = results.filter(book => {
            return book.title.toLowerCase().includes(searchQuery) ||
                   book.author.toLowerCase().includes(searchQuery) ||
                   book.category.toLowerCase().includes(searchQuery) ||
                   book.description.toLowerCase().includes(searchQuery);
        });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        results = results.filter(book => 
            book.category.toLowerCase() === categoryFilter.toLowerCase()
        );
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
        results = results.filter(book => 
            book.available === (availabilityFilter === 'available')
        );
    }
    
    displayResults(results);
}

// Display search results
function displayResults(results) {
    const bookGrid = document.querySelector('.book-grid');
    const noResults = document.getElementById('no-results');
    const currentUser = getCurrentUser();
    
    if (!results.length) {
        bookGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    bookGrid.innerHTML = results.map(book => `
        <article class="book-card" role="listitem">
            <div class="book-cover">
                <img src="${book.cover}" alt="Cover of ${book.title}" loading="lazy">
                <div class="book-actions">
                    ${currentUser ? `
                        <button class="action-btn ${book.available ? 'borrow-btn' : 'wishlist-btn'}" 
                                data-book-id="${book.id}"
                                aria-label="${book.available ? 'Borrow this book' : 'Add to wishlist'}">
                            ${book.available ? 'Borrow' : 'Add to Wishlist'}
                        </button>
                    ` : `
                        <a href="logIn.html" class="action-btn login-prompt">
                            Login to Borrow
                        </a>
                    `}
                    <a href="bookDetails.html?id=${book.id}" class="action-btn view-details" aria-label="View book details">
                        View Details
                    </a>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    <span class="book-status ${book.available ? 'available' : 'borrowed'}">
                        ${book.available ? 'Available' : 'Borrowed'}
                    </span>
                </div>
            </div>
        </article>
    `).join('');

    // Add event listeners to the action buttons
    setupBookCardListeners();
}

// Set up event listeners for book card actions
function setupBookCardListeners() {
    // Borrow button listeners
    document.querySelectorAll('.borrow-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-book-id');
            borrowBook(parseInt(bookId));
            // Refresh the search results after borrowing
            searchBooks();
        });
    });

    // Wishlist button listeners
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-book-id');
            addToWishlist(parseInt(bookId));
            // Show confirmation message
            this.textContent = 'Added to Wishlist';
            this.disabled = true;
        });
    });
}

// Handle search form submission
function handleSearchSubmit(e) {
    e.preventDefault();
    const searchInput = e.target.querySelector('input[name="q"]');
    const searchQuery = searchInput.value.trim();
    
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    window.history.pushState({}, '', url);
    
    // Perform search
    searchBooks();
}

// Set up event listeners
function setupEventListeners() {
    // Filter controls
    const filterControls = document.querySelectorAll('.filter-controls select');
    filterControls.forEach(control => {
        control.addEventListener('change', searchBooks);
    });
    
    // Search form
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
}

// Initialize search results page
function initializeSearchResults() {
    // Initialize localStorage if needed
    if (!localStorage.getItem('books')) {
        initializeLocalStorage(); // This function should be defined in shared.js
    }
    
    displaySearchQuery();
    searchBooks();
    setupEventListeners();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearchResults);

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Get current user
function getCurrentUser() {
    // Implementation of getCurrentUser function
    return null; // Placeholder return, actual implementation needed
}

// Get borrowed books from localStorage
function getBorrowedBooksFromStorage() {
    return JSON.parse(localStorage.getItem('borrowedBooks')) || [];
}

// Borrow a book
function borrowBook(bookId) {
    // Implementation of borrowBook function
}

// Add a book to wishlist
function addToWishlist(bookId) {
    // Implementation of addToWishlist function
}