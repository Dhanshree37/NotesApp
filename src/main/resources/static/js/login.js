// Force HTTPS in production
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
  window.location.href = window.location.href.replace("http:", "https:");
}

// Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Clear previous error
  errorMsg.textContent = "";

  // Basic validation
  if (!username || !password) {
    errorMsg.textContent = "Username and password are required.";
    return;
  }

  try {
    // Use relative URL for login to avoid mixed content
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
      credentials: "include" // important to store session cookie
    });

    if (response.ok) {
      // Redirect using relative URL (automatically uses HTTPS)
      window.location.href = "/notes.html";
    } else {
      errorMsg.textContent = "Invalid username or password.";
    }
  } catch (err) {
    errorMsg.textContent = "Login failed. Please try again.";
    console.error(err);
  }
});
