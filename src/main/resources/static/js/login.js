// Helper to get correct base URL dynamically
function getBaseURL() {
  // Force HTTPS on deployment, keep HTTP for localhost
  return (window.location.hostname === "localhost" ? window.location.protocol : "https:") + "//" + window.location.host;
}


// ---------------- LOGIN ----------------
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
    const response = await fetch(getBaseURL() + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
      credentials: "include"
    });

    if (response.ok) {
      // Redirect to notes page
      window.location.href = getBaseURL() + "/notes.html";
    } else {
      errorMsg.textContent = "Invalid username or password.";
    }
  } catch (err) {
    errorMsg.textContent = "Login failed. Please try again.";
    console.error(err);
  }
});