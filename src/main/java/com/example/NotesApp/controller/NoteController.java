// package com.example.NotesApp.controller;

// public class NoteController {
    
// }

package com.example.NotesApp.controller;

import com.example.NotesApp.model.Note;
import com.example.NotesApp.model.User;
import com.example.NotesApp.repository.NoteRepository;
import com.example.NotesApp.repository.UserRepository;
import org.springframework.security.core.Authentication;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // Allow frontend access (for now)
public class NoteController {


    @Autowired
    private NoteRepository noteRepository;
    @Autowired
    private UserRepository userRepository;

    // GET all notes
    @GetMapping
    public List<Note> getAllNotes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username);

        return noteRepository.findByUserId(user.getId());
    }

    // POST a new note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String username = auth.getName();
    User user = userRepository.findByUsername(username);
    
    note.setUser(user);
    return noteRepository.save(note);
    }

    // GET note by ID
    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    // PUT (update) note
    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {
        return noteRepository.findById(id).map(note -> {
            note.setTitle(updatedNote.getTitle());
            note.setContent(updatedNote.getContent());
            return noteRepository.save(note);
        }).orElse(null);
    }

    // DELETE note
    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }
}