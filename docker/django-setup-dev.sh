while ! nc -z postgres 5432; do
    echo 'Waiting for PostgreSQL...'
    sleep 2
done

python transcendence/manage.py makemigrations app
python transcendence/manage.py makemigrations
python transcendence/manage.py migrate
python transcendence/manage.py createsuperuser --noinput
python transcendence/manage.py runserver 0.0.0.0:8000