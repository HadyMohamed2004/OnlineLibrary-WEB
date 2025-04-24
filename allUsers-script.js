// allUsers-script.js

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
        // Redirect to login page if not admin
        alert('You need to be logged in as an admin to access this page.');
        window.location.href = 'logIn.html';
        return;
    }

    // Load users
    loadUsers();

    // Handle search
    document.querySelector('.search-bar').addEventListener('submit', function (e) {
        e.preventDefault();
        const searchQuery = this.querySelector('input').value.trim().toLowerCase();
        filterUsers(searchQuery);
    });

    // Handle filters
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-by').addEventListener('change', applyFilters);
});

// Get users from localStorage
function getUsersFromStorage() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Load users into the table
function loadUsers(filteredUsers = null) {
    const users = filteredUsers || getUsersFromStorage();
    const tbody = document.querySelector('.users-table tbody');

    // Clear existing content
    tbody.innerHTML = '';

    // Create a row for each user
    users.forEach(user => {
        // Skip the current admin to prevent self-changes
        const currentUser = getCurrentUser();
        const isSelf = currentUser && user.id === currentUser.id;

        const tr = document.createElement('tr');

        // Get borrowedBooks count
        const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
        const userBorrowedCount = borrowedBooks.filter(item =>
            item.userId === user.id
        ).length;

        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><span class="status-${user.status}">${user.status}</span></td>
            <td>${userBorrowedCount}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-user-id="${user.id}">Edit</button>
                ${!isSelf ? `<button class="${user.status === 'active' ? 'suspend-btn' : 'activate-btn'}" data-user-id="${user.id}">
                    ${user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>` : ''}
                ${!isSelf && user.role !== 'admin' ? `<button class="make-admin-btn" data-user-id="${user.id}">Make Admin</button>` : ''}
                ${user.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Add event listeners to buttons
    addButtonEventListeners();
}

// Filter users by search query
function filterUsers(query) {
    if (!query) {
        loadUsers();
        return;
    }

    const users = getUsersFromStorage();
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );

    loadUsers(filteredUsers);
}

// Apply status and sort filters
function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    let users = getUsersFromStorage();

    // Apply status filter
    if (statusFilter !== 'all') {
        users = users.filter(user => user.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
        case 'name':
            users.sort((a, b) => a.fullName.localeCompare(b.fullName));
            break;
        case 'name-desc':
            users.sort((a, b) => b.fullName.localeCompare(a.fullName));
            break;
        case 'recent':
            // Sort by join date (newest first)
            users.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
            break;
        case 'books':
            // Sort by borrowed books count
            const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
            users.sort((a, b) => {
                const aBooks = borrowedBooks.filter(item => item.userId === a.id).length;
                const bBooks = borrowedBooks.filter(item => item.userId === b.id).length;
                return bBooks - aBooks;
            });
            break;
    }

    loadUsers(users);
}

// Add event listeners to user action buttons
function addButtonEventListeners() {
    // Edit user
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = parseInt(this.getAttribute('data-user-id'));
            editUserDetails(userId);
        });
    });

    // Suspend/Activate user
    document.querySelectorAll('.suspend-btn, .activate-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = parseInt(this.getAttribute('data-user-id'));
            toggleUserStatus(userId);
        });
    });

    // Make user admin
    document.querySelectorAll('.make-admin-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = parseInt(this.getAttribute('data-user-id'));
            makeUserAdmin(userId);
        });
    });
}

// Edit user details
function editUserDetails(userId) {
    // In a real app, this would redirect to an edit user page
    alert('Edit user functionality not fully implemented in this version.');
}

// Toggle user status (suspend/activate)
function toggleUserStatus(userId) {
    // Get users from storage
    let users = getUsersFromStorage();

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        // Toggle status
        users[userIndex].status = users[userIndex].status === 'active' ? 'suspended' : 'active';

        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // If the user being suspended is currently logged in, log them out
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId && users[userIndex].status === 'suspended') {
            alert('Your account has been suspended. You will be logged out.');
            logout();
            return;
        }

        // Reload users
        loadUsers();

        // Show success message
        const statusVerb = users[userIndex].status === 'active' ? 'activated' : 'suspended';
        alert(`User ${statusVerb} successfully.`);
    }
}

// Make user an admin
function makeUserAdmin(userId) {
    // Confirm action
    if (!confirm('Are you sure you want to make this user an administrator? This will give them full access to the system.')) {
        return;
    }

    // Get users from storage
    let users = getUsersFromStorage();

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        // Change role to admin
        users[userIndex].role = 'admin';

        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Reload users
        loadUsers();

        // Show success message
        alert(`${users[userIndex].fullName} is now an administrator.`);
    }
}

// Add CSS for admin badge
document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.textContent = `
        .admin-badge {
            display: inline-block;
            background-color: #4a89dc;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .make-admin-btn {
            background-color: #4a89dc;
            color: white;
        }
        
        .make-admin-btn:hover {
            background-color: #3a70c2;
        }
        
        .suspend-btn {
            background-color: #fc6e51;
            color: white;
        }
        
        .suspend-btn:hover {
            background-color: #e9573f;
        }
        
        .activate-btn {
            background-color: #a0d468;
            color: white;
        }
        
        .activate-btn:hover {
            background-color: #8cc152;
        }
    `;
    document.head.appendChild(style);
});