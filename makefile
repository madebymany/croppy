SHELL = /bin/bash
BIN  := ./node_modules/.bin

.PHONY: setup
setup:
	npm install

# SASS
STYLESRC   = ./src/stylesheets/
STYLEOUT   = ./build/
STYLEFLAGS = --watch="$(STYLESRC)" --output-style="compressed" --source-map="$(STYLEOUT)/croppy.css.map" --source-map-embed --source-map-contents --recursive $(STYLESRC) -o $@
STYLEOBJ   = $(STYLESRC) $(wildcard ./src/stylesheets/*.scss)

# Build SASS
$(STYLEOUT): $(STYLEOBJ)
	@$(BIN)/node-sass $(STYLEFLAGS)
	@$(BIN)/autoprefixer $@

.PHONY: styles
styles: $(STYLEOUT)

