#!/bin/bash
# Renderiza cada página del catálogo a 100 dpi como catalogo/pag/NNN.png (numeración del catálogo completo).
D="$1"; cd "$D" || exit 1; mkdir -p pag; off=0
for i in 1 2 3; do
  f=$(ls Catalogo_Fraiche_parte${i}_*.pdf); n=$(pdfinfo "$f" 2>/dev/null | awk '/Pages/{print $2}')
  for p in $(seq 1 "$n"); do pdftoppm -r 100 -png -f "$p" -l "$p" -singlefile "$f" "pag/$(printf %03d $((p+off)))" 2>/dev/null; done
  off=$((off+n))
done
ls pag | wc -l
