// =========================
// NOTES.JS
// =========================

// Load notes when page is ready
document.addEventListener("DOMContentLoaded", () => {
    fetchNotes();

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        window.location.href = "/login.html";
    });

    // Add note
    document.getElementById("noteForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;

        const response = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            document.getElementById("noteForm").reset();
            fetchNotes(); // refresh after adding
        }
    });

    // Search notes
    document.getElementById("searchNotes").addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(".note").forEach(note => {
            const title = note.querySelector("h3").textContent.toLowerCase();
            const content = note.querySelector("p").textContent.toLowerCase();
            note.style.display = (title.includes(query) || content.includes(query)) ? "block" : "none";
        });
    });
});

// =========================
// Fetch & Display Notes
// =========================
async function fetchNotes() {
    try {
        const response = await fetch("/api/notes");
        if (response.ok) {
            const notes = await response.json();
            displayNotes(notes);
        } else {
            console.error("Failed to load notes");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

function displayNotes(notes) {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";

    notes.forEach(note => {
        const div = document.createElement("div");
        div.className = "note";
        div.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <button onclick="openOverlay(${note.id}, '${note.title}', '${note.content}', ${note.pinned})">Edit</button>
            <button onclick="deleteNote(${note.id})">Delete</button>
        `;
        notesList.appendChild(div);
    });
}

// =========================
// Delete Note
// =========================
async function deleteNote(id) {
    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (response.ok) {
        fetchNotes(); // refresh after deleting
    }
}

// =========================
// Overlay (Edit Notes)
// =========================
function openOverlay(id, title, content, pinned) {
    const overlay = document.getElementById("noteOverlay");
    overlay.classList.remove("hidden");

    document.getElementById("overlayTitle").value = title;
    document.getElementById("overlayContent").value = content;

    // Save updated note
    document.getElementById("overlayCloseBtn").onclick = () => {
        overlay.classList.add("hidden");
    };

    document.getElementById("overlayDeleteBtn").onclick = () => deleteNote(id);

    document.getElementById("overlayPinBtn").onclick = async () => {
        await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: document.getElementById("overlayTitle").value,
                content: document.getElementById("overlayContent").value,
                pinned: !pinned
            })
        });
        overlay.classList.add("hidden");
        fetchNotes();
    };

    // Save on close (update note content)
    document.getElementById("overlayCloseBtn").onclick = async () => {
        await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: document.getElementById("overlayTitle").value,
                content: document.getElementById("overlayContent").value,
                pinned: pinned
            })
        });
        overlay.classList.add("hidden");
        fetchNotes();
    };
}
