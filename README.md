# Expense Tracker

A mobile app for tracking personal spending. Built with React Native (Expo) on the front end and a Node.js/Express REST API with a SQLite database on the back end.

## Features
- Add, edit, and delete expenses
- Running total of all spending
- Categories: Food, Transport, Bills, Shopping, Other
- Filter the list by category
- Pull down to refresh
- Input validation on both the app and the server

## Tech stack
- **Mobile app:** React Native, Expo, JavaScript
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Tools:** Git, GitHub, IntelliJ IDEA

## Project structure
```
expense-tracker/
├── backend/   # Express API and SQLite database
└── mobile/    # Expo React Native app
```

## API endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses | List expenses (optional `?category=Food`) |
| GET | /api/expenses/summary | Total spending and total per category |
| GET | /api/expenses/:id | Get one expense |
| POST | /api/expenses | Create an expense |
| PUT | /api/expenses/:id | Update an expense |
| DELETE | /api/expenses/:id | Delete an expense |

## Getting started

### 1. Run the backend
```bash
cd backend
npm install
node server.js
```
The API runs on http://localhost:3000.

### 2. Run the mobile app
```bash
cd mobile
npm install
npx expo start
```
Open `mobile/config.js` and set `API_URL` to your computer's local IP address (for example `http://192.168.1.25:3000`). Your phone cannot use `localhost`.

Install the **Expo Go** app on your phone, make sure the phone and computer are on the same network, and scan the QR code.

## What I learned
- Designing and building a REST API with validation and error handling
- Writing SQL queries with parameters to prevent SQL injection
- Managing state and making API calls in React Native
- Connecting a mobile app to a backend over a local network
- Using Git and GitHub to track a project

## Author
Helly Patel