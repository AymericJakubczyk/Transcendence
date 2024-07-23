while ! nc -z postgres 5432; do
    echo 'Waiting for PostgreSQL...'
    sleep 2
done

python transcendence/manage.py makemigrations
python transcendence/manage.py migrate
python transcendence/manage.py createsuperuser --noinput

cd /transcendence
daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application