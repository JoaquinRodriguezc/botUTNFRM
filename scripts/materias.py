import json
import os
import glob
from termcolor import colored


def EXTRACT_MATERIAS_POR_ARCHIVO():
    MATERIAS_POR_ARCHIVO = {}  # Diccionario para almacenar arrays por archivo
    try:
        FILES = glob.glob(os.path.join("docs", "parsed", "parsed-*.json"))
        print(
            colored(f"Encontrados {len(FILES)} archivos JSON en docs/parsed", "green")
        )

        for FILE in FILES:
            try:
                print(
                    colored(
                        f"\nProcesando: {os.path.basename(FILE)}",
                        "cyan",
                        attrs=["bold"],
                    )
                )
                with open(FILE, "r", encoding="utf-8") as f:
                    DATA = json.load(f)

                materias_archivo = []
                if isinstance(DATA, list):
                    for ENTRY in DATA:
                        MATER = ENTRY.get("materia")
                        if MATER and MATER not in materias_archivo:
                            materias_archivo.append(MATER)
                    MATERIAS_POR_ARCHIVO[os.path.basename(FILE)] = materias_archivo
                    print(
                        colored(
                            f"Encontradas {len(materias_archivo)} materias únicas",
                            "light_blue",
                        )
                    )
                else:
                    print(colored("Estructura JSON no es una lista", "yellow"))

            except Exception as e:
                print(colored(f"Error procesando archivo: {e}", "red"))

        print(colored("\nResumen de extracción:", "green", attrs=["bold"]))
        for archivo, materias in MATERIAS_POR_ARCHIVO.items():
            print(colored(f"{archivo}: {len(materias)} materias", "magenta"))

    except Exception as e:
        print(colored(f"Error general: {e}", "red"))

    return MATERIAS_POR_ARCHIVO


def GUARDAR_JSON(data, filename="docs/parsed/materias_por_archivo.json"):
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(colored(f"\nDatos guardados en {filename}", "green", attrs=["bold"]))
    except Exception as e:
        print(colored(f"Error guardando JSON: {e}", "red"))


if __name__ == "__main__":
    MATERIAS_DICT = EXTRACT_MATERIAS_POR_ARCHIVO()
    print("\n" + colored("Diccionario completo:", "yellow", attrs=["bold"]))
    for archivo, materias in MATERIAS_DICT.items():
        print(colored(f"\n{archivo}:", "cyan"))
        print(materias)

    GUARDAR_JSON(MATERIAS_DICT)
