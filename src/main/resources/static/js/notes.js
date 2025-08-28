document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("noteForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const notesList = document.getElementById("notesList");
  const logoutBtn = document.getElementById("logoutBtn");

  const overlay = document.getElementById("noteOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayContent = document.getElementById("overlayContent");
  const overlayPinBtn = document.getElementById("overlayPinBtn");
  const overlayCloseBtn = document.getElementById("overlayCloseBtn");
  const overlayDeleteBtn = document.getElementById("overlayDeleteBtn");

  let currentNote = null;

  // Fetch all notes
  const fetchNotes = () => {
    fetch("/api/notes", { credentials: "include" })
      .then(res => res.status === 401 ? window.location.href = "/login.html" : res.json())
      .then(data => {
        if (!data) return;
        data.sort((a,b)=>b.pinned-a.pinned);
        notesList.innerHTML = "";

        data.forEach(note => {
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

          // Toggle card menu
          menuBtn.addEventListener("click", e => {
            e.stopPropagation();
            menu.classList.toggle("hidden");
          });

          // Pin/unpin from card menu
          menu.querySelector(".pin-btn").addEventListener("click", e => {
            e.stopPropagation();
            fetch(`/api/notes/${note.id}/pin`, { method:"PUT", credentials:"include" })
              .then(fetchNotes);
          });

          // Delete from card menu
          menu.querySelector(".delete-btn").addEventListener("click", e => {
            e.stopPropagation();
            fetch(`/api/notes/${note.id}`, { method:"DELETE", credentials:"include" })
              .then(fetchNotes);
          });

          // Open overlay if clicking outside menu
          noteDiv.addEventListener("click", e => {
            if (!e.target.classList.contains("note-menu-btn") && !e.target.closest(".note-menu")) {
              openOverlay(note);
            }
          });

          notesList.appendChild(noteDiv);
        });
      })
      .catch(err => console.error("Error fetching notes:", err));
  };

  // Overlay functions
  const openOverlay = (note) => {
    currentNote = note;
    overlayTitle.value = note.title;
    overlayContent.value = note.content;
    overlay.classList.remove("hidden");
  };

  const closeOverlay = () => {
    overlay.classList.add("hidden");
    currentNote = null;
  };

  // Autosave for typing and paste
  overlayTitle.addEventListener("input", autosave);
  overlayContent.addEventListener("input", autosave);
  overlayTitle.addEventListener("paste", autosave);
  overlayContent.addEventListener("paste", autosave);

  function autosave() {
    if (!currentNote) return;

    const updatedNote = {
      title: overlayTitle.value,
      content: overlayContent.value
    };

    fetch(`/api/notes/${currentNote.id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(updatedNote),
      credentials: "include"
    }).then(fetchNotes)
      .catch(err => console.error("Error updating note:", err));
  }

  // Overlay pin/unpin
  overlayPinBtn.addEventListener("click", () => {
    if (!currentNote) return;
    fetch(`/api/notes/${currentNote.id}/pin`, { method:"PUT", credentials:"include" })
      .then(fetchNotes)
      .then(()=> openOverlay(currentNote))
      .catch(err=>console.error("Error pinning note:", err));
  });

  // Overlay delete
  overlayDeleteBtn.addEventListener("click", () => {
    if (!currentNote) return;
    fetch(`/api/notes/${currentNote.id}`, { method:"DELETE", credentials:"include" })
      .then(()=> { closeOverlay(); fetchNotes(); })
      .catch(err=>console.error("Error deleting note:", err));
  });

  // Overlay close
  overlayCloseBtn.addEventListener("click", closeOverlay);

  // Logout
  logoutBtn.addEventListener("click", ()=> {
    fetch("/logout", {method:"POST"})
      .then(()=> window.location.href="/login.html?logout=true")
      .catch(err=>console.error("Error logging out:",err));
  });

  // Add note
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = { title: titleInput.value, content: contentInput.value };
    if(!note.title.trim() || !note.content.trim()) return;

    fetch("/api/notes", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(note),
      credentials:"include"
    }).then(() => {
      titleInput.value = "";
      contentInput.value = "";
      fetchNotes();
    }).catch(err => console.error("Error adding note:",err));
  });

  fetchNotes();
  const searchInput = document.getElementById("searchNotes");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const allNotes = document.querySelectorAll("#notesList .note");
  
  allNotes.forEach(note => {
    const title = note.querySelector("h3").textContent.toLowerCase();
    const content = note.querySelector("p").textContent.toLowerCase();
    if (title.includes(query) || content.includes(query)) {
      note.style.display = "flex";
    } else {
      note.style.display = "none";
    }
  });
});


const themeToggleBtn = document.getElementById("themeToggleBtn");

// Load theme from localStorage if available
if(localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggleBtn.textContent = "☀️";
}

// Toggle theme on button click
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if(document.body.classList.contains("dark-mode")) {
    themeToggleBtn.textContent = "☀️"; // sun icon for light mode
    localStorage.setItem("theme", "dark");
  } else {
    themeToggleBtn.textContent = "🌙"; // moon icon for dark mode
    localStorage.setItem("theme", "light");
  }
});


});
