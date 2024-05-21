while ! nc -z postgres 5432; do
    echo 'Waiting for PostgreSQL...'
    sleep 2
done

# python app/manage.py createsuperuser
# admin
# example@gmail.com
# password
# password
# y

python app/manage.py migrate
python app/manage.py runserver 0.0.0.0:8000
