import fitz  # PyMuPDF
from PIL import Image
import os
import glob

def pdf_to_images(pdf_path, output_folder="output_images", zoom=2.0):
    """
    Convertit chaque page d'un PDF en image haute qualité.

    :param pdf_path: Chemin vers le fichier PDF.
    :param output_folder: Dossier où sauvegarder les images.
    :param zoom: Facteur de zoom pour améliorer la résolution (par défaut 2.0).
    """
    # Ouvrir le PDF
    pdf_document = fitz.open(pdf_path)

    # Créer le dossier de sortie s'il n'existe pas
    os.makedirs(output_folder, exist_ok=True)

    # Extraire le nom de base du PDF (sans extension)
    pdf_basename = os.path.splitext(os.path.basename(pdf_path))[0]

    # Parcourir chaque page
    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)

        # Définir la matrice de transformation pour le zoom
        mat = fitz.Matrix(zoom, zoom)

        # Rendre la page en pixmap (image)
        pix = page.get_pixmap(matrix=mat)

        # Sauvegarder l'image avec le nom basé sur le PDF d'entrée
        if len(pdf_document) == 1:
            # Si une seule page, utiliser directement le nom du PDF
            output_path = f"{pdf_basename}.png"
        else:
            # Si plusieurs pages, ajouter le numéro de page
            output_path = f"{pdf_basename}_page_{page_number + 1}.png"
        
        pix.save(output_path)

        print(f"Page {page_number + 1} sauvegardée sous : {output_path}")

    pdf_document.close()

# Traiter tous les PDFs du répertoire courant
if __name__ == "__main__":
    # Obtenir le répertoire du script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Trouver tous les fichiers PDF dans le répertoire
    pdf_files = glob.glob(os.path.join(script_dir, "*.pdf"))
    
    if not pdf_files:
        print("Aucun fichier PDF trouvé dans le répertoire.")
    else:
        print(f"Traitement de {len(pdf_files)} fichier(s) PDF...")
        for pdf_file in sorted(pdf_files):
            print(f"\nTraitement de : {os.path.basename(pdf_file)}")
            pdf_to_images(pdf_file, zoom=10.0)  # Augmente le zoom pour une meilleure résolution
        print("\nTous les PDFs ont été traités avec succès!")
