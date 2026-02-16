#!/bin/bash

# Wait for database (simple check or rely on docker-compose healthcheck/depends_on)
# In production, use wait-for-it or similar.

echo "Running migrations..."
python manage.py makemigrations accounts pedagogical people academic diary
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
# Use 0.0.0.0 for Docker
python manage.py runserver 0.0.0.0:8000
