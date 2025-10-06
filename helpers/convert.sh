# Conversion simple
mogrify -format webp -resize '670>' *.png

# Ou avec boucle pour plus de contrôle
for f in *.png; do
    magick "$f" -resize '670>' "${f%.png}.webp"
done

# Avec qualité spécifique (80%)
mogrify -format webp -resize '670>' -quality 80 *.png

# Garder ratio, max width 670px
mogrify -format webp -resize '670x>' *.png