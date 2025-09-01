// ---------------- REGISTER ----------------
function getBaseURL() { return window.location.protocol + "//" + window.location.host; }

document.getElementById("registerForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");
  errorMsg.textContent = "";

  if (!username || !password) {
    errorMsg.textContent = "All fields are required.";
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    const response = await fetch(getBaseURL() + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.text();

    if (result.includes("successfully")) {
      alert("Registration successful! You can now login.");
      window.location.href = getBaseURL() + "/login.html";
    } else {
      errorMsg.textContent = result;
    }
  } catch (err) {
    errorMsg.textContent = "Registration failed. Please try again.";
    console.error(err);
  }
});