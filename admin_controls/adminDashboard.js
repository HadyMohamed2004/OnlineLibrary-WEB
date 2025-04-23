document.addEventListener("DOMContentLoaded", () => {
    const bookGrid = document.querySelector(".book-grid");
    const addBtn = document.querySelector(".add-btn");

    // Load books from localStorage
    const storedBooks = JSON.parse(localStorage.getItem("books")) || [];

    // Render all stored books
function renderBooks() {
    bookGrid.innerHTML = ""; // Clear existing content
    const books = JSON.parse(localStorage.getItem("books")) || [];

    books.slice(0, 2).forEach(book => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");
        bookItem.setAttribute("data-id", book.id);

        bookItem.innerHTML = `
            <img src="${book.cover}" alt="Book Cover">
            <div class="book-actions">
                <p>${book.title} by ${book.author}</p>
                <div class="action-buttons">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        bookGrid.appendChild(bookItem);
    });
}

 renderBooks();

    // Delete book
    bookGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const bookItem = e.target.closest(".book-item");
            const bookId = parseInt(bookItem.getAttribute("data-id"));

            if (confirm("Are you sure you want to delete this book?")) {
                let books = JSON.parse(localStorage.getItem("books")) || [];
                books = books.filter(book => book.id !== bookId);
                localStorage.setItem("books", JSON.stringify(books));

                bookItem.remove();
            }
			
			renderBooks();
        }

        // Edit button
        if (e.target.classList.contains("edit-btn")) {
            alert(" ");
        }
    });

    // Redirect to Add Book page
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            window.location.href = "addBook.html";
        });
    }
});
