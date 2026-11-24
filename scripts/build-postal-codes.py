"""
Genera src/data/postal-codes-cat.ts (codi postal → poblacions) per a Catalunya.

Font: INE, "Callejero del Censo Electoral" (CC BY 4.0), a través del fitxer
data.js del paquet npm `spain-postal-codes` (no és una dependència de la web:
només se n'extreuen les dades).

Ús:
    npm pack spain-postal-codes --ignore-scripts   # en una carpeta temporal
    tar -xzf spain-postal-codes-*.tgz
    python3 -I scripts/build-postal-codes.py package/data.js
"""
import json
import re
import sys
from collections import defaultdict

PROVINCES = ("08", "17", "25", "43")  # Barcelona, Girona, Lleida, Tarragona

src = open(sys.argv[1], encoding="utf-8").read()
meta = json.loads(re.search(r"export const META = (.*);", src).group(1))
municipis = json.loads(re.search(r"export const MUNICIPIOS = (.*);", src).group(1))

towns = defaultdict(list)
for ine_id, name, codes in municipis:
    if ine_id[:2] not in PROVINCES:
        continue
    for code in codes.split():
        # Alguns municipis de frontera fan servir codis d'una altra província: els ignorem
        if code[:2] in PROVINCES and name not in towns[code]:
            towns[code].append(name)

data = {code: sorted(names) for code, names in sorted(towns.items())}
out = (
    "/**\n"
    " * Codi postal → població/ons de Catalunya. FITXER GENERAT: no editar a mà.\n"
    " * Regenerar amb scripts/build-postal-codes.py.\n"
    f" * Font: {meta['attribution']} Llicència {meta['license']}. Període {meta['period']}.\n"
    " * Pot faltar algun codi \"general\" (p. ex. 08400): llavors el client escriu la població a mà.\n"
    " */\n"
    f"export const POSTAL_CODE_TOWNS: Record<string, string[]> = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};\n"
)
open("src/data/postal-codes-cat.ts", "w", encoding="utf-8").write(out)
print(f"{len(data)} codis postals, {sum(len(v) > 1 for v in data.values())} amb més d'una població")
