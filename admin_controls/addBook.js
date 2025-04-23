document.addEventListener("DOMContentLoaded", () => {
	
    const coverInput = document.getElementById("cover");
    const previewImg = document.querySelector(".book-cover-preview");
    const cancelBtn = document.querySelector(".delete-btn");
    const form = document.querySelector(".add-form");

    // Image preview
    coverInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Cancel button
    cancelBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
            form.reset();
            previewImg.src = "images.jpg"; 
            window.location.href = "../myBooks.html";
        }
    });

    // Save to local storage
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const book = {
            id: Date.now(), // unique ID
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            category: document.getElementById("category").value,
            description: document.getElementById("description").value,
            pages: document.getElementById("pages").value,
            status: document.getElementById("status").value,
            cover: previewImg.src 
        };

        const books = JSON.parse(localStorage.getItem("books")) || [];
        books.push(book);
        localStorage.setItem("books", JSON.stringify(books));

        alert("Book added successfully!");
        window.location.href = "AdminDashboard.html";
    });
});
