# Veg-Connect Setup Guide
A data-driven React-Django app that fetches plant data from OpenFarm’s API, allowing users to schedule and share farming tasks in topic-specific communities while accessing plant growth insights and growing tips through features like bar graphs. Additionally, it incorporates a robust real-time chat system utilizing WebSocket technology for instantaneous communication and seamless collaboration among community members.

# Table of Contents
    - Prerequisites.
    - Installation.
    - Environment Setup.
    - Frontend Setup.
    - Database Migrations.
    - Running the Application. 
    - License. 

# Prerequisites
Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/downloads)
- [Python](https://www.python.org/downloads/) (3.x)
- [Node.js](https://nodejs.org/en/download)
- [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html)
- [Docker](https://docs.docker.com/engine/install/)

# Installation
Clone the repository and set up your virtual environment:

1. Clone the repository:
```bash
git clone https://github.com/Koech01/veg-connect.git
virtualenv veg-connect/
cd veg-connect
```

2. Install dependencies:
```bash
source bin/activate
pip install -r requirements.txt
```

# Environment Setup.
Configure the environment:

1. Create an .env file:
```bash
touch .env 
```

2. Generate a Django secret key:
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

3. Open the `.env` file and add the following lines, with your newly generated secret key for `SECRET_KEY`. Make sure to keep DEBUG=True for local development:
```env
SECRET_KEY=your_generated_secret_key_here
DEBUG=True
```

# Frontend Setup.

1. Set up the frontend by navigating to the frontend directory and installing dependencies:
```bash
cd frontend
npm install
npm run build
cd ..
```

# Database Migrations.

1. Run Django migrations:
```bash
python manage.py makemigrations
python manage.py migrate 
``` 

# Running the Application.

1. For chat functionality, ensure Redis is running:
```bash
sudo docker run -d -p 6379:6379 redis 
```
Enter your password.

2. Start the Django development server:
```bash
python manage.py runserver 
```
You can now access the application at `http://127.0.0.1:8000/`.

# License.
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).