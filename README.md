# Social Network Project

## Description
This project involves building a Facebook-like social network that provides the following features:

- User authentication with sessions and cookies
- Follower system with public and private profiles
- Posts with privacy settings and multimedia support
- Group creation, membership management, and events
- Real-time chat using WebSockets
- Notifications for various actions and events

Both the backend and frontend are containerized using Docker to ensure easy deployment and maintainability.

---

## Features

### Authentication
- Registration with the following fields:
  - **Mandatory:** Email, Password, First Name, Last Name, Date of Birth
  - **Optional:** Avatar/Image, Nickname, About Me
- Login with session persistence using cookies
- Logout functionality

### Followers
- Follow/unfollow users
- Handle follow requests for private profiles
- Automatic follow for public profiles

### Profiles
- Display user information, activity, and posts
- Show followers and following users
- Toggle between public and private profiles

### Posts
- Create posts with images or GIFs
- Comment on posts
- Privacy settings:
  - Public
  - Almost private (followers only)
  - Private (specific followers only)

### Groups
- Create and manage groups with title and description
- Invite members and accept/decline requests
- Browse and request to join groups
- Group-specific posts and comments
- Event creation with RSVP options (e.g., "Going" or "Not Going")

### Chat
- Real-time private messaging between users (via WebSockets)
- Group chat rooms
- Emoji support

### Notifications
- Notifications for:
  - Follow requests
  - Group invitations
  - Requests to join a group
  - New group events
- Separate UI for private messages and notifications

---

## Technologies Used

### Frontend
- **Languages:** HTML, CSS, JavaScript
- **Frameworks:** (Choose one: Next.js, Vue.js, Svelte, Mithril, etc.)

### Backend
- **Language:** Go
- **Database:** SQLite
- **Packages:**
  - `golang-migrate` for migrations
  - `bcrypt` for password hashing
  - `gorilla/websocket` for real-time communication
  - `uuid` for generating unique IDs
- **Web Server:** Caddy (or custom-built server)

### Containerization
- Docker images for frontend and backend

---

## Folder Structure

```
.
├── backend
│   ├── pkg
│   │   ├── db
│   │   │   ├── migrations
│   │   │   │   ├── 000001_create_users_table.up.sql
│   │   │   │   ├── 000001_create_users_table.down.sql
│   │   │   │   ├── 000002_create_posts_table.up.sql
│   │   │   │   └── 000002_create_posts_table.down.sql
│   │   └── sqlite
│   │       └── sqlite.go
│   └── server.go
├── frontend
│   ├── public
│   │   └── index.html
│   └── src
│       ├── components
│       ├── styles
│       └── main.js
├── docker-compose.yml
└── README.md
```

---

## Installation and Setup

### Prerequisites
- Docker and Docker Compose installed on your machine
- Go programming environment

### Clone the Repository
```bash
git clone https://github.com/your-repo/social-network.git
cd social-network
```

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build the Docker image:
   ```bash
   docker build -t social-network-backend .
   ```
3. Run the backend container:
   ```bash
   docker run -p 8080:8080 social-network-backend
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Build the Docker image:
   ```bash
   docker build -t social-network-frontend .
   ```
3. Run the frontend container:
   ```bash
   docker run -p 3000:3000 social-network-frontend
   ```

### Database Setup
1. Apply migrations:
   ```bash
   go run backend/pkg/db/sqlite/sqlite.go
   ```

---

## Usage
1. Open the frontend in your browser at `http://localhost:3000`.
2. Register a new user and log in.
3. Explore features like creating posts, following users, and joining groups.

---

## Contribution Guidelines
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact
For questions or suggestions, please contact [zone01@gmail.com].
