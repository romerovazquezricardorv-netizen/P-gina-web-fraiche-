#!/bin/bash
# Extrae el texto de cada página del catálogo a txt/NNN.txt (numeración del catálogo completo).
D="$1"; cd "$D" || exit 1
mkdir -p txt
off=0
for i in 1 2 3; do
  f=$(ls Catalogo_Fraiche_parte${i}_*.pdf)
  n=$(pdfinfo "$f" 2>/dev/null | awk '/Pages/{print $2}')
  for p in $(seq 1 "$n"); do pdftotext -f "$p" -l "$p" "$f" "txt/$(printf %03d $((p+off))).txt" 2>/dev/null; done
  off=$((off+n))
done
ls txt | wc -l
