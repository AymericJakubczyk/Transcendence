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

python transcendence/manage.py makemigrations
python transcendence/manage.py migrate
python transcendence/manage.py runserver 0.0.0.0:8000