document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("noteForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const notesList = document.getElementById("notesList");
  const logoutBtn = document.getElementById("logoutBtn");

  const fetchNotes = () => {
    fetch("/api/notes", {
      credentials: "include" // include session cookie
    })
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
            <button onclick="deleteNote(${note.id})">Delete</button>
          `;
          notesList.appendChild(noteDiv);
        });
      });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = {
      title: titleInput.value,
      content: contentInput.value
    };

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
  });

  window.deleteNote = (id) => {
    fetch(`/api/notes/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(() => {
      fetchNotes();
    });
  };

  logoutBtn.addEventListener("click", () => {
    fetch("/logout", {
      method: "POST"
    }).then(() => {
      window.location.href = "/login.html?logout=true";
    });
  });

  fetchNotes();
});
