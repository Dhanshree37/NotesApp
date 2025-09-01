package com.example.NotesApp.controller;

import com.example.NotesApp.model.Note;
import com.example.NotesApp.model.User;
import com.example.NotesApp.repository.NoteRepository;
import com.example.NotesApp.repository.UserRepository;
import com.example.NotesApp.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // For frontend access
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteService noteService;

    // GET all notes
    @GetMapping
    public List<Note> getAllNotes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName());
        return noteRepository.findByUserIdOrderByPinnedDescIdDesc(user.getId());
    }

    // POST a new note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName());
        note.setUser(user);
        return noteRepository.save(note);
    }

    // GET note by ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        Optional<Note> optionalNote = noteRepository.findById(id);
        return optionalNote.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT (update) note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName());

        Optional<Note> optionalNote = noteRepository.findById(id);

        if (!optionalNote.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Note note = optionalNote.get();

        // Only owner can update
        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        note.setTitle(updatedNote.getTitle());
        note.setContent(updatedNote.getContent());

        Note saved = noteRepository.save(note);
        return ResponseEntity.ok(saved);
    }

    // PUT toggle pin
    @PutMapping("/{id}/pin")
    public ResponseEntity<Note> togglePin(@PathVariable Long id) {
    Note toggled = noteService.togglePin(id); // Note, not Optional
    if (toggled == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(toggled);
    }


    // DELETE note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName());

        Optional<Note> optionalNote = noteRepository.findById(id);

        if (!optionalNote.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Note note = optionalNote.get();

        // Only owner can delete
        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        noteRepository.delete(note);
        return ResponseEntity.ok().build();
    }
    
}
