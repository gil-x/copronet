.DEFAULT_GOAL := help

help:		# Affiche cette aide
	@echo 'Commandes disponibles :'
	@grep -E '^[a-zA-Z0-9_-]+:.*#' $(MAKEFILE_LIST) | sed 's/:.*#/\t/' | sort

serve: clean	# Lance le serveur Hugo sans cache pour tests dev
	hugo serve --disableFastRender --noHTTPCache --ignoreCache

clean:      # Nettoie les fichiers publics et temporaires Hugo
	@rm -rf public resources .hugo_* .cache
