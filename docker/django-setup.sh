
until mysqladmin ping &>/dev/null; do
  sleep 1
done

# python app/manage.py createsuperuser
# admin
# example@gmail.com
# password
# password
# y

python app/manage.py runserver 0.0.0.0:8000
