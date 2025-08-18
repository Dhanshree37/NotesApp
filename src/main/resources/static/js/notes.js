document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("noteForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const notesList = document.getElementById("notesList");
  const logoutBtn = document.getElementById("logoutBtn");
  const submitBtn = document.getElementById("submitBtn");

  let editingNoteId = null; // Track note being edited

  const fetchNotes = () => {
  fetch("/api/notes", { credentials: "include" })
    .then(res => {
      if (res.status === 401) {
        window.location.href = "/login.html";
        return;
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      notesList.innerHTML = "";

      data.forEach(note => {
        const noteDiv = document.createElement("div");
        noteDiv.className = "note";
        noteDiv.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.content}</p>
          <div class="note-actions">
            <button class="pinBtn" onclick="togglePin('${note.id}')">
              ${note.pinned ? "📌 Unpin" : "📌 Pin"}
            </button>
            <button class="editBtn" onclick="startEdit('${note.id}', \`${note.title}\`, \`${note.content}\`)">✏ Edit</button>
            <button class="deleteBtn" onclick="deleteNote('${note.id}')">🗑 Delete</button>
          </div>
        `;
        notesList.appendChild(noteDiv);
      });
    });
};
  window.togglePin = (id) => {
  fetch(`/api/notes/${id}/pin`, {
    method: "PUT",
    credentials: "include"
  }).then(() => {
    fetchNotes(); // refresh list so pinned notes move to top
  });
};

  form.addEventListener("submit", (e) => {
  e.preventDefault();

  const note = {
    title: titleInput.value,
    content: contentInput.value
  };

  // If editing
  if (editingNoteId) {
    fetch(`/api/notes/${editingNoteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(note),
      credentials: "include"
    }).then(() => {
      titleInput.value = "";
      contentInput.value = "";
      submitBtn.textContent = "Add Note";
      editingNoteId = null;
      fetchNotes();
    });
  } else {
    // If creating new note
    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(note),
      credentials: "include"
    }).then(() => {
      titleInput.value = "";
      contentInput.value = "";
      fetchNotes();
    });
  }
});



  logoutBtn.addEventListener("click", () => {
    fetch("/logout", {
      method: "POST"
    }).then(() => {
      window.location.href = "/login.html?logout=true";
    });
  });

  fetchNotes();
});
