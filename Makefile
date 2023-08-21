install:
	npm install

dev:
	npm run start:dev

build:
	npm run build

lint:
	npm run lint

migrate:
	npm run migrate

seed:
	npx prisma db seed

studio:
	npx prisma studio