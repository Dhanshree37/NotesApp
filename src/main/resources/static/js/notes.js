// =========================
// NOTES.JS
// =========================

// Force HTTPS for deployment
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
    window.location.href = window.location.href.replace("http:", "https:");
}

document.addEventListener("DOMContentLoaded", () => {
    // --- Elements ---
    const notesList = document.getElementById("notesList");
    const noteForm = document.getElementById("noteForm");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const logoutBtn = document.getElementById("logoutBtn");
    const searchInput = document.getElementById("searchNotes");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const overlay = document.getElementById("noteOverlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayContent = document.getElementById("overlayContent");
    const overlayCloseBtn = document.getElementById("overlayCloseBtn");
    const overlayDeleteBtn = document.getElementById("overlayDeleteBtn");
    const overlayPinBtn = document.getElementById("overlayPinBtn");

    let notes = [];
    let currentNote = null;

    // --- Fetch all notes ---
    async function fetchNotes() {
        try {
            const res = await fetch("/api/notes", { credentials: "include" });
            if (res.status === 401) {
                window.location.href = "/login.html";
                return;
            }
            notes = await res.json();
            notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
            displayNotes(notes);
        } catch (err) {
            console.error("Error fetching notes:", err);
            notesList.textContent = "Failed to load notes.";
        }
    }

    // --- Display notes ---
    function displayNotes(noteArray) {
        notesList.innerHTML = "";
        noteArray.forEach(note => {
            const noteDiv = document.createElement("div");
            noteDiv.className = "note";
            if (note.pinned) noteDiv.classList.add("pinned");

            noteDiv.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <button class="note-menu-btn">⋮</button>
                <div class="note-menu hidden">
                    <button class="pin-btn">${note.pinned ? "Unpin" : "Pin"}</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // --- Card menu toggle ---
            const menuBtn = noteDiv.querySelector(".note-menu-btn");
            const menu = noteDiv.querySelector(".note-menu");
            menuBtn.addEventListener("click", e => {
                e.stopPropagation();
                menu.classList.toggle("hidden");
            });

            // --- Pin/unpin from card ---
            menu.querySelector(".pin-btn").addEventListener("click", async e => {
                e.stopPropagation();
                await fetch(`/api/notes/${note.id}/pin`, { method: "PUT", credentials: "include" });
                note.pinned = !note.pinned;
                displayNotes(notes);
            });

            // --- Delete from card ---
            menu.querySelector(".delete-btn").addEventListener("click", async e => {
                e.stopPropagation();
                await fetch(`/api/notes/${note.id}`, { method: "DELETE", credentials: "include" });
                notes = notes.filter(n => n.id !== note.id);
                displayNotes(notes);
                if (currentNote && currentNote.id === note.id) closeOverlay();
            });

            // --- Open overlay on click (outside menu) ---
            noteDiv.addEventListener("click", e => {
                if (!e.target.classList.contains("note-menu-btn") && !e.target.closest(".note-menu")) {
                    openOverlay(note);
                }
            });

            notesList.appendChild(noteDiv);
        });
    }

    // --- Overlay functions ---
    function openOverlay(note) {
        currentNote = note;
        overlayTitle.value = note.title;
        overlayContent.value = note.content;
        overlay.classList.remove("hidden");
    }

    function closeOverlay() {
        overlay.classList.add("hidden");
        currentNote = null;
    }

    // --- Autosave overlay edits ---
    async function autosave() {
        if (!currentNote) return;
        const updatedNote = {
            title: overlayTitle.value,
            content: overlayContent.value
        };
        try {
            await fetch(`/api/notes/${currentNote.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedNote),
                credentials: "include"
            });
            currentNote.title = updatedNote.title;
            currentNote.content = updatedNote.content;
            displayNotes(notes);
        } catch (err) {
            console.error("Error updating note:", err);
        }
    }

    overlayTitle.addEventListener("input", autosave);
    overlayContent.addEventListener("input", autosave);
    overlayTitle.addEventListener("paste", autosave);
    overlayContent.addEventListener("paste", autosave);

    // --- Overlay pin/unpin ---
    overlayPinBtn.addEventListener("click", async () => {
        if (!currentNote) return;
        await fetch(`/api/notes/${currentNote.id}/pin`, { method: "PUT", credentials: "include" });
        currentNote.pinned = !currentNote.pinned;
        displayNotes(notes);
        openOverlay(currentNote);
    });

    // --- Overlay delete ---
    overlayDeleteBtn.addEventListener("click", async () => {
        if (!currentNote) return;
        await fetch(`/api/notes/${currentNote.id}`, { method: "DELETE", credentials: "include" });
        notes = notes.filter(n => n.id !== currentNote.id);
        displayNotes(notes);
        closeOverlay();
    });

    // --- Overlay close ---
    overlayCloseBtn.addEventListener("click", closeOverlay);

    // --- Add new note ---
    noteForm.addEventListener("submit", async e => {
        e.preventDefault();
        const note = { title: titleInput.value.trim(), content: contentInput.value.trim() };
        if (!note.title || !note.content) return;
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(note),
                credentials: "include"
            });
            const newNote = await res.json();
            notes.unshift(newNote); // add new note to the top
            displayNotes(notes);
            titleInput.value = "";
            contentInput.value = "";
        } catch (err) {
            console.error("Error adding note:", err);
        }
    });

    // --- Search/filter ---
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        notes.forEach(note => {
            const noteDiv = [...notesList.children].find(d => d.querySelector("h3").textContent === note.title && d.querySelector("p").textContent === note.content);
            if (!noteDiv) return;
            const matches = note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
            noteDiv.style.display = matches ? "flex" : "none";
        });
    });

    // --- Theme toggle ---
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggleBtn.textContent = "☀️";
    }
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        themeToggleBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });

    // --- Logout ---
    logoutBtn.addEventListener("click", async () => {
        await fetch("/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login.html?logout=true";
    });

    // --- Initialize ---
    fetchNotes();
});
