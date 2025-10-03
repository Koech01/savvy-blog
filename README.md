# Savvy Blog Setup Guide
Built with React and Django, this app uses APScheduler and BeautifulSoup4 to schedule web scraping from blog sites like LiveScience. It then curates blogs based on user-selected topics to deliver a seamless, personalized reading experience.
 
# Ethical and Sustainable Web Scraping
The web scraping process incorporates throttling to ensure ethical data extraction. Throttling minimizes the load on target websites, preventing performance issues and reducing the risk of being blocked. 

# Table of Contents
    - Prerequisites.
    - Installation.
    - Environment Setup.
    - Frontend Setup.
    - Running the Application. 
    - License. 

# Prerequisites
Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/downloads)
- [Python](https://www.python.org/downloads/) (3.x)
- [Node.js](https://nodejs.org/en/download)
- [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html)

# Installation
Clone the repository and set up your virtual environment:

1. Clone the repository:
```bash
git clone https://github.com/Koech01/savvy-blog.git
python3 -m venv savvy-blog/
cd savvy-blog
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

# Running the Application.

1. Start the Django development server:
```bash
python manage.py runserver 
```
You can now access the application at `http://127.0.0.1:8000/`.

# License.
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).