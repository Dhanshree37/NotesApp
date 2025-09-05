// ---------------- LOGIN ----------------

// Force HTTPS on deployment (not for localhost)
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
  window.location.href = window.location.href.replace("http:", "https:");
}

// Handle login form submit
document.getElementById("loginForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");
  errorMsg.textContent = "";

  if (!username || !password) {
    errorMsg.textContent = "Username and password are required.";
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
      credentials: "include" // important to store session cookie
    });

    if (response.ok) {
      // Redirect to notes page using relative path
      await response.text(); 
      window.location.href = "/notes.html";
    } else {
      errorMsg.textContent = "Invalid username or password.";
    }
  } catch (err) {
    errorMsg.textContent = "Login failed. Please try again.";
    console.error(err);
  }
});
