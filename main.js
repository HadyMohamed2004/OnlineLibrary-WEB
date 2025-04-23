// Variables
const nav = document.querySelector("nav");

// Setup Navigation Bar
c_status = "logged out"; // Change this to 'unknown', 'loading', or 'loaded' based on the user's status

if (c_status == "logged out") {
  nav.innerHTML = `
        <a href="../index.html">Home</a>
        <a href="../account_setup/login.html">Login</a>
        <a href="../account_setup/signUp.html">Register</a>
    `;
}
