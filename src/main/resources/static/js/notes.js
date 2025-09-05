// notes.js

// Force HTTPS for deployment
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
  window.location.href = window.location.href.replace("http:", "https:");
}

console.log("[DEBUG] Script loaded. Current cookies:", document.cookie);

document.addEventListener("DOMContentLoaded", () => {
  console.log("[DEBUG] DOMContentLoaded triggered");

  // --- Elements ---
  const notesList = document.getElementById("notesList");
  const noteForm = document.getElementById("noteForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const logoutBtn = document.getElementById("logoutBtn"); // Make sure your logout button has this ID
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
    console.log("[DEBUG] fetchNotes called, sending request to /api/notes");
    try {
      const res = await fetch("/api/notes", { credentials: "include", cache: "no-store" });
      console.log("[DEBUG] Response status:", res.status);

      if (res.status === 401) {
        console.log("[DEBUG] User not authenticated, redirecting to login");
        window.location.href = "/login.html";
        return;
      }

      notes = await res.json();
      console.log("[DEBUG] Notes fetched:", notes);

      notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      displayNotes(notes);
    } catch (err) {
      console.error("[ERROR] Failed to fetch notes:", err);
      if (notesList) notesList.textContent = "Failed to load notes.";
    }
  }

  // --- Display notes ---
  function displayNotes(noteArray) {
    if (!notesList) return;
    console.log("[DEBUG] displayNotes called with", noteArray.length, "notes");
    notesList.innerHTML = "";

    noteArray.forEach(note => {
      console.log("[DEBUG] Rendering note:", note);
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
        console.log("[DEBUG] Note menu toggled for note id:", note.id);
      });

      // --- Pin/unpin ---
      menu.querySelector(".pin-btn").addEventListener("click", e => {
        e.stopPropagation();
        console.log("[DEBUG] Pin/unpin clicked for note id:", note.id);
        fetch(`/api/notes/${note.id}/pin`, { method: "PUT", credentials: "include" })
          .then(fetchNotes)
          .catch(err => console.error("[ERROR] Pin/unpin failed:", err));
      });

      // --- Delete ---
      menu.querySelector(".delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        console.log("[DEBUG] Delete clicked for note id:", note.id);
        fetch(`/api/notes/${note.id}`, { method: "DELETE", credentials: "include" })
          .then(fetchNotes)
          .catch(err => console.error("[ERROR] Delete failed:", err));
      });

      // --- Open overlay on click ---
      noteDiv.addEventListener("click", e => {
        if (!e.target.classList.contains("note-menu-btn") && !e.target.closest(".note-menu")) {
          console.log("[DEBUG] Overlay opened for note id:", note.id);
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
    console.log("[DEBUG] Overlay visible for note id:", note.id);
  }

  function closeOverlay() {
    overlay.classList.add("hidden");
    currentNote = null;
    console.log("[DEBUG] Overlay closed");
  }

  // --- Autosave overlay edits ---
  function autosave() {
    if (!currentNote) return;
    const updatedNote = { title: overlayTitle.value, content: overlayContent.value };
    console.log("[DEBUG] Autosaving note id:", currentNote.id, "with content:", updatedNote);
    fetch(`/api/notes/${currentNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedNote),
      credentials: "include"
    })
      .then(fetchNotes)
      .catch(err => console.error("[ERROR] Autosave failed:", err));
  }

  overlayTitle.addEventListener("input", autosave);
  overlayContent.addEventListener("input", autosave);
  overlayTitle.addEventListener("paste", autosave);
  overlayContent.addEventListener("paste", autosave);

  // --- Overlay pin/unpin ---
  overlayPinBtn.addEventListener("click", () => {
    if (!currentNote) return;
    console.log("[DEBUG] Overlay pin/unpin clicked for note id:", currentNote.id);
    fetch(`/api/notes/${currentNote.id}/pin`, { method: "PUT", credentials: "include" })
      .then(fetchNotes)
      .then(() => openOverlay(currentNote))
      .catch(err => console.error("[ERROR] Overlay pin failed:", err));
  });

  // --- Overlay delete ---
  overlayDeleteBtn.addEventListener("click", () => {
    if (!currentNote) return;
    console.log("[DEBUG] Overlay delete clicked for note id:", currentNote.id);
    fetch(`/api/notes/${currentNote.id}`, { method: "DELETE", credentials: "include" })
      .then(() => {
        closeOverlay();
        fetchNotes();
      })
      .catch(err => console.error("[ERROR] Overlay delete failed:", err));
  });

  // --- Overlay close ---
  overlayCloseBtn.addEventListener("click", closeOverlay);

  // --- Add new note ---
  noteForm.addEventListener("submit", e => {
    e.preventDefault();
    const note = { title: titleInput.value.trim(), content: contentInput.value.trim() };
    if (!note.title || !note.content) return;

    console.log("[DEBUG] Adding new note:", note);
    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
      credentials: "include"
    })
      .then(() => {
        titleInput.value = "";
        contentInput.value = "";
        console.log("[DEBUG] Note added, fetching updated notes");
        fetchNotes();
      })
      .catch(err => console.error("[ERROR] Adding note failed:", err));
  });

  // --- Search/filter ---
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    notes.forEach(note => {
      const visible = note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
      const el = Array.from(notesList.children).find(div => div.querySelector("h3").textContent === note.title);
      if (el) el.style.display = visible ? "flex" : "none";
    });
    console.log("[DEBUG] Search filter applied:", query);
  });

  // --- Theme toggle ---
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "☀️";
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
      themeToggleBtn.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    } else {
      themeToggleBtn.textContent = "🌙";
      localStorage.setItem("theme", "light");
    }
    console.log("[DEBUG] Theme toggled:", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      console.log("[DEBUG] Logging out");
      fetch("/logout", { method: "POST", credentials: "include" })
        .then(() => window.location.href = "/login.html?logout=true")
        .catch(err => console.error("[ERROR] Logout failed:", err));
    });
  } else {
    console.warn("[WARN] logoutBtn not found");
  }

  // --- Initial fetch ---
  fetchNotes();
});

// --- Reload notes on back/refresh ---
window.addEventListener("pageshow", () => {
  console.log("[DEBUG] pageshow event triggered");
  setTimeout(() => {
    if (typeof fetchNotes === "function") {
      console.log("[DEBUG] Reloading notes after pageshow");
      fetchNotes();
    }
  }, 0);
});
