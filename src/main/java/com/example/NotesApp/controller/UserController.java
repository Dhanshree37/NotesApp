package com.example.NotesApp.controller;

import com.example.NotesApp.model.UserDTO;
import com.example.NotesApp.model.User;
import com.example.NotesApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String registerUser(@RequestBody UserDTO userDTO) {
        System.out.println("Received username: " + userDTO.getUsername());
        System.out.println("Received password: " + userDTO.getPassword());

        if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
            return "Password is required!";
        }

        if (userRepository.findByUsername(userDTO.getUsername()) != null) {
            return "Username already exists!";
        }

        // Map DTO to entity
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole("ROLE_USER");

        userRepository.save(user);
        return "User registered successfully!";
    }

    @GetMapping("/logout-success")
    public String logoutSuccess() {
        return "You have been logged out.";
    }
}
