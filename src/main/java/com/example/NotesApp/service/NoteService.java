package com.example.NotesApp.service;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.NotesApp.repository.NoteRepository;
import com.example.NotesApp.model.Note;
import com.example.NotesApp.model.User;
@Service
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getAllNotesByUser(User user) {
    return noteRepository.findByUserIdOrderByPinnedDescIdDesc(user.getId());
}

    public Note togglePin(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setPinned(!note.isPinned());
        return noteRepository.save(note);
    }
}
