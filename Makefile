
all : update_ip
	mkdir -p ./volumes/nginx
	docker compose -f docker-compose-dev.yml up --build

update_ip :
	@NEW_LINE=$$(ifconfig | grep "inet " | awk -F'[: ]+' 'NR==2 { print $$3 }' | sed "s/^/'/" | sed "1iIPHOST=" | tr '\n' ' ' | sed "s/ $$/'/") ; \
	awk -v newline="$$NEW_LINE" 'NR==2{print newline; next}1' .env > .env.tmp && mv .env.tmp .env

prod :
	mkdir -p ./volumes/nginx
	docker compose up --build -d

down : 
	docker compose down

re : down all

clean :
	docker stop $$(docker ps -qa)
	docker system prune --all --force --volumes
	docker image prune -a --force
	docker network prune --force
	docker volume prune --force
	docker volume rm $$(docker volume ls -q)

.PHONY: all down re clean update_ip


# @NEW_LINE=$$(ifconfig | grep "inet " | awk -F'[: ]+' '{ print $$3 }' | sed "s/^/'/;s/$$/',/" | sed '1i"' | sed "1iIPHOST=" | tr '\n' ' ' | sed -e "s/\(.*\), /\1/" | sed 's/$$/"/') ; \
