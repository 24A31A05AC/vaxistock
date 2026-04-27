# VaxiStock – Livestock Vaccination Tracker

## Overview

VaxiStock is a web-based application designed to help farmers manage livestock and track vaccination schedules efficiently. The system allows users to register animals, schedule vaccinations, monitor due dates, and maintain a complete vaccination history.

This project is built using HTML, CSS, and JavaScript, with browser localStorage used for data persistence.

---

## Features

### 1. Dashboard

* Displays total number of animals
* Shows overdue, due today, and upcoming vaccinations
* Provides alerts for urgent vaccinations
* Displays recent vaccination activity

### 2. Animal Management

* Register animals with details (name, species, breed, gender, notes)
* View all registered animals in a table
* Search animals by name, ID, or species
* Delete animals (automatically removes related vaccination records)

### 3. Vaccination Management

* Schedule vaccinations for animals
* Select predefined or custom vaccines
* Filter vaccinations:

  * All
  * Overdue
  * Due Today
  * Upcoming
  * Completed
* Mark vaccinations as completed
* Automatically create follow-up vaccination if next due date is provided
* Search functionality

### 4. Vaccination History

* View completed vaccination records
* Filter by animal
* Search by animal name or vaccine
* Displays total records and number of animals tracked

---

## Technologies Used

* HTML5
* CSS3 (Flexbox, responsive layout, custom styling)
* JavaScript (DOM manipulation, event handling, business logic)
* Browser LocalStorage (data persistence)

---

## Project Structure

```
VaxiStock/
│
├── index.html          # Dashboard
├── animals.html        # Animal management
├── vaccination.html    # Vaccination scheduling
├── history.html        # Vaccination history
├── style.css           # Styling
├── script.js           # Core logic
└── README.md           # Documentation
```

---

## How to Run

1. Download or clone the repository
2. Open the project folder
3. Open `index.html` in any web browser

No installation or server required.

---

## How It Works

* Data is stored in browser localStorage
* Animals and vaccinations are saved in JSON format
* JavaScript handles:

  * CRUD operations (Create, Read, Update, Delete)
  * Vaccination status calculation (overdue, due today, upcoming)
  * Dynamic UI updates

---

## Limitations

* No backend (data stored only in browser)
* No user authentication
* Data will be lost if browser storage is cleared
* Not suitable for multi-user environments

---

## Future Improvements

* Add backend (Node.js / Firebase)
* Implement user authentication
* Add edit functionality for animals and vaccinations
* Improve validation and error handling
* Make UI fully responsive for mobile devices

---

## Team Members

1. BODASINGI DIVYASRI
2. SINGAMSETTY MONIKA DEVI
3. ATTILI HIZIKIA FRANCIS
4. POKANTI NAGA VENKATA SAI

---

## Purpose

This project was developed as a practical implementation to understand:

* Frontend web development
* DOM manipulation
* State management using localStorage
* Designing real-world applications

---

## License

This project is for educational purposes.
