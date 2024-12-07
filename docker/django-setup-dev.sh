while ! nc -z postgres 5432; do
    echo 'Waiting for PostgreSQL...'
    sleep 2
done

python transcendence/manage.py makemigrations app
python transcendence/manage.py makemigrations
python transcendence/manage.py migrate

# if in env file AI_TRAINING is set to True, then train the model
if [ "$TRAIN" = "True" ]; then
    python transcendence/ai_utils/supervised_collect.py
    python transcendence/ai_utils/supervised_train.py
    cp model_supervised.pth transcendence/app/static/ai_models/new_model.pth
fi

python transcendence/manage.py createsuperuser --noinput
python transcendence/manage.py runserver 0.0.0.0:8000