# NotesApp 📝

A simple Notes CRUD (Create, Read, Update, Delete) API built with Spring Boot, supporting user authentication and personalized note management.

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

```bash
git clone https://github.com/Dhanshree37/NotesApp.git
cd NotesApp
Configure your database connection in src/main/resources/application.properties:

properties
Copy
Edit
spring.datasource.url=jdbc:mysql://localhost:3306/notesdb
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
Build and run:

bash
Copy
Edit
mvn spring-boot:run

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
arduino
Copy
Edit
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


Future Improvements
JWT-based authentication
Role-based authorization
Frontend with React or Angular
User registration page

License
This project is for educational/demo purposes. Feel free to fork and build upon it!
