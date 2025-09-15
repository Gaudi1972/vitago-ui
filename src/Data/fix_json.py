import json

# Carga el archivo original
with open("alimentos.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for alimento in data:
    # Renombra "unidades habitual" → "Unidad habitual"
    if "unidades habitual" in alimento:
        alimento["Unidad habitual"] = alimento.pop("unidades habitual")

    # Renombra "gramos por unidades" → "gramos por unidad"
    if "gramos por unidades" in alimento:
        alimento["gramos por unidad"] = alimento.pop("gramos por unidades")

# Guarda el archivo nuevo
with open("alimentos_fixed.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Archivo normalizado guardado como alimentos_fixed.json")
