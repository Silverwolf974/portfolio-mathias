from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\alyde\Documents\portefolio\toto\portfolio-mathias\.build")

def sheet(paths, output, thumb=(280, 180), cols=4):
    font = ImageFont.load_default()
    rows = (len(paths) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * (thumb[0] + 20), rows * (thumb[1] + 48)), "white")
    draw = ImageDraw.Draw(canvas)
    for index, path in enumerate(paths):
        with Image.open(path) as source:
            image = source.convert("RGB")
            image.thumbnail(thumb)
            x = (index % cols) * (thumb[0] + 20) + 10 + (thumb[0] - image.width) // 2
            y = (index // cols) * (thumb[1] + 48) + 10 + (thumb[1] - image.height) // 2
            canvas.paste(image, (x, y))
        draw.text(((index % cols) * (thumb[0] + 20) + 10, (index // cols) * (thumb[1] + 48) + thumb[1] + 16), path.name, fill="black", font=font)
    canvas.save(output, quality=90)

images = sorted((ROOT / "report-images").glob("*"))
sheet(images, ROOT / "report-images-contact.jpg", cols=4)

page_numbers = {1, 10, 13, 14, 15, 16, 18, 20, 21, 22, 23, 24, 25, 29, 32, 33, 34}
pages = [p for p in sorted((ROOT / "report-pages").glob("*.jpg")) if int(p.stem.split("-")[-1]) in page_numbers]
sheet(pages, ROOT / "report-pages-contact.jpg", thumb=(240, 340), cols=4)

slides = sorted((ROOT / "pptx/final-previews").glob("*.png"))
if slides:
    sheet(slides, ROOT / "pptx/slides-contact.jpg", thumb=(320, 180), cols=4)
