// notes.js

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
  const logoutBtn = document.getElementById("logoutBtn"); // optional, may not exist
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
      const res = await fetch("/api/notes", { credentials: "include", cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login.html";
        return;
      }
      notes = await res.json();
      notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      displayNotes(notes);
    } catch (err) {
      if (notesList) notesList.textContent = "Failed to load notes.";
    }
  }

  // --- Display notes ---
  function displayNotes(noteArray) {
    if (!notesList) return;
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

      const menuBtn = noteDiv.querySelector(".note-menu-btn");
      const menu = noteDiv.querySelector(".note-menu");

      menuBtn.addEventListener("click", e => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
      });

      menu.querySelector(".pin-btn").addEventListener("click", e => {
        e.stopPropagation();
        fetch(`/api/notes/${note.id}/pin`, { method: "PUT", credentials: "include" })
          .then(fetchNotes)
          .catch(console.error);
      });

      menu.querySelector(".delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        fetch(`/api/notes/${note.id}`, { method: "DELETE", credentials: "include" })
          .then(fetchNotes)
          .catch(console.error);
      });

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
  function autosave() {
    if (!currentNote) return;
    const updatedNote = { title: overlayTitle.value, content: overlayContent.value };
    fetch(`/api/notes/${currentNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedNote),
      credentials: "include"
    })
      .then(fetchNotes)
      .catch(console.error);
  }

  overlayTitle.addEventListener("input", autosave);
  overlayContent.addEventListener("input", autosave);
  overlayTitle.addEventListener("paste", autosave);
  overlayContent.addEventListener("paste", autosave);

  overlayPinBtn.addEventListener("click", () => {
    if (!currentNote) return;
    fetch(`/api/notes/${currentNote.id}/pin`, { method: "PUT", credentials: "include" })
      .then(fetchNotes)
      .then(() => openOverlay(currentNote))
      .catch(console.error);
  });

  overlayDeleteBtn.addEventListener("click", () => {
    if (!currentNote) return;
    fetch(`/api/notes/${currentNote.id}`, { method: "DELETE", credentials: "include" })
      .then(() => {
        closeOverlay();
        fetchNotes();
      })
      .catch(console.error);
  });

  overlayCloseBtn.addEventListener("click", closeOverlay);

  // --- Add new note ---
  noteForm.addEventListener("submit", e => {
    e.preventDefault();
    const note = { title: titleInput.value.trim(), content: contentInput.value.trim() };
    if (!note.title || !note.content) return;

    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
      credentials: "include"
    })
      .then(() => {
        titleInput.value = "";
        contentInput.value = "";
        fetchNotes();
      })
      .catch(console.error);
  });

  // --- Search/filter ---
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    notes.forEach(note => {
      const visible = note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
      const el = Array.from(notesList.children).find(div => div.querySelector("h3").textContent === note.title);
      if (el) el.style.display = visible ? "flex" : "none";
    });
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
  });

  // --- Logout ---
  if (logoutBtn) {
  logoutBtn.addEventListener("click", e => {
    e.preventDefault(); // stop default form behavior
    fetch("/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "/login.html?logout=true")
      .catch(console.error);
  });
}


  // --- Initial fetch ---
  fetchNotes();
});

// --- Reload notes on back/refresh ---
window.addEventListener("pageshow", () => {
  setTimeout(() => {
    if (typeof fetchNotes === "function") {
      fetchNotes();
    }
  }, 0);
});
