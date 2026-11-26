FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput || true
CMD gunicorn filo_coffee_and_matcha.wsgi:application --bind 0.0.0.0:$PORT
