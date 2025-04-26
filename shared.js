// shared.js

// User roles
const ROLE_GUEST = 'guest';
const ROLE_USER = 'user';
const ROLE_ADMIN = 'admin';

// Initialize localStorage with default data if needed
function initializeLocalStorage() {
    // Initialize books if not already done
    if (!localStorage.getItem('books')) {
        const defaultBooks = [
            {
                id: 1,
                title: "Tyll",
                author: "Daniel Kehlmann",
                cover: "https://covers.openlibrary.org/b/id/10648514-L.jpg",
                category: "Fantasy",
                description: "A historical novel set during the Thirty Years' War in Europe, following the adventures of the legendary trickster Tyll Ulenspiegel.",
                pages: 352,
                available: true
            },
            {
                id: 2,
                title: "The Martian",
                author: "Andy Weir",
                cover: "https://covers.openlibrary.org/b/id/11446888-L.jpg",
                category: "Sci-Fi",
                description: "After a dust storm nearly kills him and forces his crew to evacuate while thinking him dead, Mark Watney finds himself stranded and completely alone on Mars.",
                pages: 369,
                available: true  // Changed to true
            },
            {
                id: 3,
                title: "A Gentleman in Moscow",
                author: "Amor Towles",
                cover: "https://covers.openlibrary.org/b/id/11326818-L.jpg",
                category: "Historical Fiction",
                description: "In 1922, Count Alexander Rostov is deemed an unrepentant aristocrat by a Bolshevik tribunal, and is sentenced to house arrest in the Metropol, a grand hotel across the street from the Kremlin.",
                pages: 462,
                available: true
            },
            {
                id: 4,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                cover: "https://covers.openlibrary.org/b/id/14811180-L.jpg",
                category: "Classics",
                description: "Set in the Jazz Age on Long Island, the novel depicts mysterious millionaire Jay Gatsby and his obsession to reunite with his former lover Daisy Buchanan.",
                pages: 180,
                available: true
            },
            {
                id: 5,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                cover: "https://covers.openlibrary.org/b/id/14858485-L.jpg",
                category: "Romance",
                description: "The story follows the main character, Elizabeth Bennet, as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of the British Regency.",
                pages: 432,
                available: true
            },
            {
                id: 6,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                cover: "https://covers.openlibrary.org/b/id/9269962-M.jpg",
                category: "Classics",
                description: "The story takes place during three years of the Great Depression in the fictional 'tired old town' of Maycomb, Alabama. It focuses on six-year-old Scout Finch, who lives with her older brother Jem and their widowed father Atticus, a middle-aged lawyer.",
                pages: 281,
                available: true  // Changed to true
            }
        ];
        localStorage.setItem('books', JSON.stringify(defaultBooks));
    }

    // Initialize users if not already done
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                fullName: "John Doe",
                email: "john.doe@example.com",
                username: "johndoe",
                password: "password123", // In a real app, passwords should be hashed
                role: ROLE_ADMIN,
                joinDate: "2023-01-15T00:00:00.000Z",
                status: "active"
            },
            {
                id: 2,
                fullName: "Jane Smith",
                email: "jane.smith@example.com",
                username: "janesmith",
                password: "password123",
                role: ROLE_USER,
                joinDate: "2023-02-20T00:00:00.000Z",
                status: "active"
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // Initialize borrowedBooks if not already done
    if (!localStorage.getItem('borrowedBooks')) {
        localStorage.setItem('borrowedBooks', JSON.stringify([]));
    } else {
        // Update the structure of existing borrowedBooks to include userId if it doesn't exist
        convertBorrowedBooksFormat();
    }

    // Initialize wishlist if not already done
    if (!localStorage.getItem('wishlist')) {
        localStorage.setItem('wishlist', JSON.stringify([]));
    } else {
        // Update the structure of existing wishlist to include userId if it doesn't exist
        convertWishlistFormat();
    }

    // Initialize current user if not already done
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', null);
    }
}

// Function to convert old borrowed books format to include userId
function convertBorrowedBooksFormat() {
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    const currentUser = getCurrentUser();

    if (borrowedBooks.length > 0 && !borrowedBooks[0].hasOwnProperty('userId') && currentUser) {
        // Convert to new format with userId
        const newBorrowedBooks = borrowedBooks.map(book => ({
            ...book,
            userId: currentUser.id
        }));

        localStorage.setItem('borrowedBooks', JSON.stringify(newBorrowedBooks));
    }
}

// Function to convert old wishlist format to include userId
function convertWishlistFormat() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const currentUser = getCurrentUser();

    if (wishlist.length > 0 && typeof wishlist[0] !== 'object' && currentUser) {
        // Convert old format to new format
        const newWishlist = wishlist.map(bookId => ({
            userId: currentUser.id,
            bookId: bookId
        }));

        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const currentUserJSON = localStorage.getItem('currentUser');
    return currentUserJSON && currentUserJSON !== 'null' ? JSON.parse(currentUserJSON) : null;
}

// Get user role (guest, user, admin)
function getUserRole() {
    const currentUser = getCurrentUser();
    return currentUser ? currentUser.role : ROLE_GUEST;
}

// Check if current user can borrow books (not suspended)
function canUserBorrow() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }
    return currentUser.status !== 'suspended';
}

// Update navigation based on user role
function updateNavigation() {
    const navElement = document.querySelector('header nav');
    if (!navElement) return; // Exit if nav element is not found

    const role = getUserRole();

    // Create navigation HTML based on role
    let navHTML = '';

    // Add common links for all users (Home, All Books)
    navHTML += `
        <a href="index.html">Home</a>
        <a href="allBooks.html">All Books</a>
    `;

    if (role === ROLE_GUEST) {
        // Add guest links (Log In, Sign Up)
        navHTML += `
            <a href="logIn.html">Log In</a>
            <a href="signUp.html">Sign Up</a>
        `;
    } else if (role === ROLE_USER || role === ROLE_ADMIN) {
        // Add authenticated user links (My Books, Wishlist)
        navHTML += `
            <a href="myBooks.html">My Books</a>
            <a href="wishlist.html">Wishlist</a>
        `;

        // Add admin-only links
        if (role === ROLE_ADMIN) {
            navHTML += `
                <a href="addBook.html">Add a book</a>
                <a href="AdminDashboard.html">Dashboard</a>
            `;
        }

        // Add common authenticated user links (My account, Logout)
        navHTML += `
            <a href="userDashboard.html">My account</a>
            <a href="#" id="logout-link">Logout</a>
        `;
    }

    // Set the navigation HTML
    navElement.innerHTML = navHTML;

    // Add logout event listener
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Highlight current page
    highlightCurrentPage();
}

// Highlight the current page in navigation
function highlightCurrentPage() {
    // Get the current page filename from the URL
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html'; // Default to index.html if empty

    // Find all navigation links
    const navLinks = document.querySelectorAll('header nav a');

    // Remove active class from all links and add to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Get borrowed books for the current user
function getUserBorrowedBooks() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allBorrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

    // Filter to show only books borrowed by current user
    return allBorrowedBooks.filter(item =>
        item.userId === currentUser.id ||
        // Support for legacy data
        !item.hasOwnProperty('userId')
    );
}

// Get wishlist items for the current user
function getUserWishlist() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If old format, convert
    if (allWishlistItems.length > 0 && typeof allWishlistItems[0] !== 'object') {
        // Convert to new format
        const newWishlist = allWishlistItems.map(bookId => ({
            userId: currentUser.id,
            bookId: bookId
        }));

        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
    }

    // Filter to show only current user's wishlist
    return allWishlistItems.filter(item =>
        item.userId === currentUser.id ||
        // Support for legacy data
        !item.hasOwnProperty('userId')
    );
}

// Login function
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Don't store password in the current user session
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        // Convert any existing data structures to include userId
        convertBorrowedBooksFormat();
        convertWishlistFormat();

        return true;
    }

    return false;
}

// Logout function
function logout() {
    localStorage.setItem('currentUser', null);
    window.location.href = 'index.html';
}

// Update user display name
function updateUserDisplayName() {
    const user = getCurrentUser();
    const welcomeElement = document.querySelector('.dashboard h2');

    if (user && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.fullName}!`;
    }
}

// Handle search form submission
function setupSearchForm() {
    const searchForm = document.querySelector('.search-bar');

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const searchInput = this.querySelector('input').value.trim();

            if (searchInput) {
                // Store search query in sessionStorage
                sessionStorage.setItem('searchQuery', searchInput);

                // Redirect to search results page
                window.location.href = 'searchResults.html';
            }
        });
    }
}

// Prevent multiple initializations
if (typeof window.navInitialized === 'undefined') {
    // Initialize localStorage
    initializeLocalStorage();

    // Function to initialize the navigation
    function initializeNavigation() {
        updateNavigation();
        updateUserDisplayName();
        setupSearchForm();
    }

    // Initialize navigation immediately if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeNavigation();
    } else {
        // Otherwise wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', initializeNavigation);
    }

    // Mark as initialized to prevent duplicate calls
    window.navInitialized = true;
}