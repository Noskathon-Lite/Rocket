Vehicle Number Plate Recognition System with Parking Management
The Auto Plate Recognition System is a Django-based web application that integrates with machine learning to identify, process, and manage vehicle license plates for parking lots. This project automates license plate detection and recognition, and provides a user-friendly way to handle parking lot occupancy and fee management.


Features
User Management: Admins and general users with role-based access.
License Plate Recognition: Detects and recognizes license plates from uploaded images using YOLOv5 and OCR.
Parking Lot Management: Handles parking lot capacity, records vehicle entries/exits, and calculates fees.
API-Driven Design: Exposes a RESTful API for seamless integration with React-based frontend.
Scalable Architecture: Modularized for future expansion and ML model integration.


Prerequisites
Python 3.8+
Django 4.x
PyTorch
PostgreSQL
Node.js (for frontend development)
Tesseract OCR (optional for enhanced plate recognition)


Installation for Team Members
Install dependencies: pip install -r requirements.txt
Make corresponding db in postgreSQL with the credentials provided in settings.py
Apply database migrations: python manage.py migrate
Run the development server: python manage.py runserver

Backend Setup
Clone the repository:
git clone https://github.com/yourusername/auto-plate-recognition.git
cd auto-plate-recognition
2.Create Database:

Create a databse inside postgreSQL with the name provided in settings.py
Make the corresponding database in PostgreSQL with the credentials provided in settings.py.
Apply migration
python manage.py makemigration
python manage.py migrate
Start server with Pycharm or
python manage.py runserver