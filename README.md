# NotesApp 📝

A simple Notes CRUD (Create, Read, Update, Delete) API built with Spring Boot, supporting user authentication and personalized note management.

## Screenshots

![Notes Home](/notesHome.png)
![Overlay Notes](/overlayNotes.png)

## Features

✅ User authentication with Spring Security (session-based)  
✅ Secure login with BCrypt password hashing  
✅ Users can manage their own notes — no access to other users' notes  
✅ MySQL database integration using Spring Data JPA  
✅ Cross-origin requests supported for potential frontend connections  
✅ Clean, maintainable REST API structure  

## Tech Stack

- Java 11
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL
- Maven

## Getting Started

### Prerequisites

- Java 11 or higher
- Maven
- MySQL

### Running the App

1. Clone the repository:

```
git clone https://github.com/Dhanshree37/NotesApp.git
cd NotesApp
```
Configure your database connection in src/main/resources/application.properties:
```
spring.datasource.url=jdbc:mysql://localhost:3306/notesdb
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
```
Build and run:
```
mvn spring-boot:run
```
The app will start on http://localhost:8080.

Using the API
Login
POST/login with username and password fields (handled by Spring Security).

Notes Endpoints
GET/api/notes — List all notes for the logged-in user

POST/api/notes — Add a new note

PUT/api/notes/{id} — Update an existing note

DELETE/api/notes/{id} — Delete a note

All these endpoints are protected; you must be logged in.

Folder Structure Overview

```
NotesApp
 ├── src
 │   └── main
 │       ├── java
 │       │   └── com.example.NotesApp
 │       │        ├── controller
 │       │        ├── model
 │       │        ├── repository
 │       │        ├── config
 │       │        └── NotesAppApplication.java
 │       └── resources
 │            ├── application.properties
 │            └── static / templates (for future frontend)
 └── pom.xml
```

## Future Improvements

- Switch to JWT-based authentication for stateless token-based security
- Add role-based authorization (e.g., admin, user)
- Build a frontend using React or Angular for a modern SPA experience
- Implement a user registration page to allow self-signup

  
## License

This project is for educational/demo purposes. Feel free to fork and build upon it!
