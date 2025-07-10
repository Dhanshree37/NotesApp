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
    if (username === "" || password === "") {
        errorMsg.textContent = "Username and password are required.";
        return;
    }

    if (username.length < 3) {
        errorMsg.textContent = "Username must be at least 3 characters.";
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ username, password })
        });

        if (response.ok) {
            window.location.href = "/notes.html";
        } else {
            errorMsg.textContent = "Invalid username or password.";
        }
    } catch (err) {
        errorMsg.textContent = "Login failed. Please try again.";
        console.error(err);
    }
});
