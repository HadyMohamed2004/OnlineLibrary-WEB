// Variables
const nav = document.querySelector("nav");

// Setup Navigation Bar
c_status = "logged out";

if (c_status == "logged out") {
  nav.innerHTML = `
        <a href="../index.html">Home</a>
        <a href="../account_setup/login.html">Login</a>
        <a href="../account_setup/signUp.html">Register</a>
    `;

} else if (c_status == "logged in") {
  nav.innerHTML = `
        <a href="../index.html">Home</a>
        <a href="mybooks.html">My Books</a>
        <a href="wishlist.html">Wishlist</a>
        <a href="userDashboard.html">Profile</a>
        <a href="../account_setup/login.html">Logout</a>
        
    `;
}
