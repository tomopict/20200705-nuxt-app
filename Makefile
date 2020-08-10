hosting:
	rm -rf ./public/
	rm -rf ./functions/ssr/dist/
	mkdir -p ./public/
	cp -r ./.nuxt/dist/ ./functions/ssr/dist/
	cp -r ./src/static/ ./public/
	firebase deploy --only hosting

build:
	yarn build

deploy:
	make build
	make hosting
	firebase deploy
