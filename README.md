# Full-Stack Project: Vite (ReactJS) + Django Backend

This project consists of a **frontend** built with Vite + ReactJS + TailwindCSS and a **backend** built with Django. Follow the steps below to set up and run both parts of the project.

---

## Frontend Setup (Vite + ReactJS + TailwindCSS)

### Prerequisites

- [Node.js](https://nodejs.org/) installed (v14 or later recommended)
- A package manager like `npm` or `yarn`

### Steps

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd <repository_folder>/frontend
   ```
2. **Install Dependencies**:

```bash
npm install
```

3. **Run the Development Server**:

```bash
npm run dev
```

4. **Access the Frontend**: Open your browser and navigate to:

```adruino
http://localhost:5173
```

**TailwindCSS Setup (Already Configured)**
TailwindCSS is pre-installed. To modify styles, edit the `tailwind.config.js` file and the CSS in the `src` folder.

---

## Backend Setup (Django)

The backend of this project is built using Django, a high-level Python web framework. Follow the steps below to set up and run the backend server.

---

### Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Python** (version 3.8 or later)
- **pip** (Python package manager)
- **virtualenv** (for creating a virtual environment)
- **SQLite** (default database, included with Django)
- Optionally, **PostgreSQL** or another database if needed for production.

---

### Steps to Set Up the Backend

1. **Navigate to the Backend Directory**  
   Open a terminal and change your directory to the backend folder:
   ```bash
   cd <repository_folder>/backend
   ```

- Activate the Virtual Environment:
  -Set up a virtual environment to manage dependencies:

```
  python -m venv venv
```

- On macOS/Linux:

```bash
source venv/bin/activate
```

- On Windows

```bash
venv\Scripts\activate
```

3. Install Dependencies
   Install all required Python packages listed in the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

4. Apply Database Migrations
   Django uses migrations to apply database schema changes. Run the following commands:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. Run the Development Server
   Start the Django development server:

```bash
python manage.py runserver
```

The server will run by default at:

```adruino
http://127.0.0.1:8000
```

6. Create a Superuser
   Create an admin user for accessing the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to set up a username, email, and password.

## Setting Up PostgreSQL for Django

PostgreSQL is a powerful, open-source relational database that works seamlessly with Django. Follow these steps to configure and use PostgreSQL in your project.

---

### Prerequisites

- Install PostgreSQL on your system:

  - [Download PostgreSQL](https://www.postgresql.org/download/)
  - On Ubuntu/Linux:
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```
  - On macOS:  
    Use Homebrew:
    ```bash
    brew install postgresql
    brew services start postgresql
    ```
  - On Windows:  
    Download the installer from the PostgreSQL website and follow the setup wizard.
