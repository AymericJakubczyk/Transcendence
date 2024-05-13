all :
	mkdir -p ./volumes/nginx
	docker-compose up --build

down : 
	docker-compose down

re : down all

clean :
	docker stop $$(docker ps -qa)
	docker system prune --all --force --volumes
	docker image prune -a --force
	docker network prune --force
	docker volume prune --force
	docker volume rm $$(docker volume ls -q)

.PHONY: all down re clean