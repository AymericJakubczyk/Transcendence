while ! nc -z postgres 5432; do
    echo 'Waiting for PostgreSQL...'
    sleep 2
done

# python transcendence/manage.py createsuperuser
# admin
# example@gmail.com
# password
# password
# y

python transcendence/manage.py migrate
# python transcendence/manage.py runserver 0.0.0.0:8000
# python transcendence/manage.py runserver
pip install gunicorn
gunicorn --chdir transcendence transcendence.wsgi:application --bind 0.0.0.0:8000