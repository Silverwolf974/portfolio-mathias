from pathlib import Path
from pypdf import PdfReader

source = Path(r"C:\Users\alyde\Downloads\Kali Mana - AUT Report (english internship).pdf")
output = Path(r"C:\Users\alyde\Documents\portefolio\toto\portfolio-mathias\.build\report-images")
output.mkdir(parents=True, exist_ok=True)

reader = PdfReader(source)
for page_number, page in enumerate(reader.pages, start=1):
    for image_number, image in enumerate(page.images, start=1):
        suffix = Path(image.name).suffix or ".bin"
        target = output / f"p{page_number:02d}_i{image_number:02d}{suffix}"
        target.write_bytes(image.data)
        print(f"{target.name}\t{len(image.data)}")
