document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    if (username === "" || password === "") {
        errorMsg.textContent = "All fields are required.";
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        return;
    }

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.text();
    if (result.includes("successfully")) {
        alert("Registration successful! You can now login.");
        window.location.href = "login.html";
    } else {
        errorMsg.textContent = result;
    }
});
