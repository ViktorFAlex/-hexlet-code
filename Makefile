install:
	npm ci
lint:
	npx eslint
gendiff:
	node bin/gendiff.js
publish:
	npm publish --dry-run
test:
	npx jest
