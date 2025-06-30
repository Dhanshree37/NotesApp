//package com.example.NotesApp.repository;

//public class UserRepository {
    
//}

package com.example.NotesApp.repository;

import com.example.NotesApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}

