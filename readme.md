## Secure File Sharing Web Application

A robust, enterprise-grade web application designed for secure, granular file sharing with advanced user authentication, comprehensive admin management, and intelligent role-based access controls.

### Demo
![demo.gif](demo.gif)
### Tech Stack

**Backend Infrastructure:**
- **FastAPI**: High-performance, async-first Python web framework
- **SQLAlchemy**: Advanced ORM with asynchronous database interactions
- **Alembic**: Sophisticated database migration management
- **Redis**: In-memory token blacklist and caching solution
- **FastAPI-JWT**: Secure, stateless authentication mechanism
- **MySQL**: Reliable relational database for persistent storage

**Frontend Architecture:**
- **React.js**: Modern component-based UI library
- **Vite**: Lightning-fast development and build optimization
- **shadcn/ui**: Elegant, accessible component ecosystem
- **Tailwind CSS**: Hyper-efficient utility-first styling framework

### Key Features

- **Granular Authentication & Authorization:**
    - Stateless JWT-based authentication with robust token management
    - Intelligent token blacklisting to prevent unauthorized access
    - Multi-layered security with role-specific permissions

- **Intelligent Access Control:**
    - **Admin Capabilities:**
        - Comprehensive system analytics (file download metrics, user-specific insights)
        - Full file management suite (upload, download, delete)
        - Advanced user permission management
        - Granular file sharing controls

    - **User Restrictions:**
        - Restricted access based on explicit file permissions
        - Transparent, need-to-know file visibility

- **Advanced Logging & Tracking:**
    - Middleware-driven file operation logging
    - Detailed audit trails for uploads and downloads
    - Immutable transaction records

- **Smart File Storage:**
    - Collision-proof file naming using UUID4
    - Secure original filename preservation
    - Efficient storage mechanism with metadata tracking

### Quick Start Guide

**Prerequisites:**
- Docker (latest version)
- Basic understanding of containerized applications

**Deployment Steps:**

1. Clone the repository:
```bash
git clone https://github.com/anjaysahoo/secure-file-sharing-web-application.git
cd secure-file-web-application
```

2. Initialize deployment:
```bash
docker compose up --build
```

3. Access the application:
- **URL:** http://localhost:5173
- **First-time Setup:** First registered user automatically receives admin privileges

### Project Architecture

```
secure-file-exchange/
│
├── backend/                # FastAPI server
│   ├── alembic/           # Database migration management
│   ├── app/
│   │   ├── core/          # Core configurations and database setup
│   │   ├── crud/          # Database operations and queries
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── routes/        # API endpoint definitions
│   │   ├── schemas/       # Pydantic models for request/response
│   │   └── utils/         # Helper functions for auth, files, etc.
│   └── tests/             # Backend test suites
│
├── frontend/              # React + TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components with shadcn
│   │   │   ├── ui/       # shadcn component library
│   │   ├── store/        # Redux state management
│   │   ├── api/          # API client and interceptors
│   └── public/           # Static assets
│
├── file_storage/         # Secure file storage location
│
├── .gitignore         # Git ignore rules
├── docker-compose.yml # Multi-container Docker setup
└── README.md          # Project documentation
```

### Development Workflow

**Frontend Development:**
```bash
cd frontend
npm install
npm run dev
```

### Security Considerations
- JWT with secure blacklisting
- Role-based access control
- Middleware-driven logging
- Unique file identification
- Explicit permission management

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Commit with clear, descriptive messages
4. Push your changes
5. Open a detailed pull request
