// searchResults-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Get search query from sessionStorage
    const searchQuery = sessionStorage.getItem('searchQuery');

    if (!searchQuery) {
        window.location.href = 'index.html';
        return;
    }

    // Set search term in page
    document.getElementById('search-term').textContent = searchQuery;

    // Set search input value
    document.getElementById('search-input').value = searchQuery;

    // Perform search
    performSearch(searchQuery);
});

// Get books from localStorage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

// Perform search
function performSearch(query) {
    const books = getBooksFromStorage();
    const resultsContainer = document.getElementById('results-container');

    // Clear existing results
    resultsContainer.innerHTML = '';

    // Convert query to lowercase for case-insensitive search
    const lowercaseQuery = query.toLowerCase();

    // Filter books by title, author, or category
    const matchingBooks = books.filter(book =>
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.category.toLowerCase().includes(lowercaseQuery) ||
        book.description.toLowerCase().includes(lowercaseQuery)
    );

    // If no results found
    if (matchingBooks.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No books found matching "${query}".</p>
                <p>Try different keywords or browse our <a href="allBooks.html">complete catalog</a>.</p>
            </div>
        `;
        return;
    }

    // Create result cards
    matchingBooks.forEach((book, index) => {
        // Create result card
        const resultCard = document.createElement('div');
        resultCard.className = 'card';

        // Create card content
        resultCard.innerHTML = `
            <h3>Search Result ${index + 1}</h3>
            <div class="book-grid">
                <div class="book-card" data-book-id="${book.id}">
                    <img src="${book.cover}" alt="${book.title}">
                    <p>${book.title}</p>
                </div>
            </div>
            <a href="#" class="view-book" data-book-id="${book.id}">View Book</a>
        `;

        resultsContainer.appendChild(resultCard);
    });

    // Add event listeners to view book links
    document.querySelectorAll('.view-book').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const bookId = parseInt(this.getAttribute('data-book-id'));

            // Store selected book ID in sessionStorage
            sessionStorage.setItem('selectedBookId', bookId);

            // Redirect to book details page
            window.location.href = 'BookInfo.html';
        });
    });

    // Add click event to book cards
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', function () {
            const bookId = parseInt(this.getAttribute('data-book-id'));

            // Store selected book ID in sessionStorage
            sessionStorage.setItem('selectedBookId', bookId);

            // Redirect to book details page
            window.location.href = 'BookInfo.html';
        });
    });
}

// Handle search form submission
document.querySelector('.search-bar').addEventListener('submit', function (e) {
    e.preventDefault();

    const searchInput = document.getElementById('search-input').value.trim();

    if (searchInput) {
        // Store search query in sessionStorage
        sessionStorage.setItem('searchQuery', searchInput);

        // Update search term in page
        document.getElementById('search-term').textContent = searchInput;

        // Perform search
        performSearch(searchInput);
    }
});