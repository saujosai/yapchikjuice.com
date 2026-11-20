"""Crop the finished strips into search/social thumbnails, plus a brand card.

Run from anywhere: `python3 tools/make-thumbs.py` (inside site/).

Each crop is deliberately framed to draw the reader in without revealing the
strip's punchline. The boxes are (left, upper, right, lower) in source pixels,
sized to the 1200x630 ratio Google and social previews like. Re-run this only
when a strip image is replaced or a crop needs adjusting; then run
`node tools/build.js` so the pages point at the new files.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT.parent / "fonts"
OUT = ROOT / "comics" / "thumbs"
TARGET = (1200, 630)
PAPER = (242, 235, 217)
INK = (26, 26, 26)

# source image, crop box, output name
CROPS = [
    # The two scooter setup panels — no sign of what's hidden in the hat.
    ("frum-inventions.jpeg", (0, 170, 900, 642), "frum-inventions.jpg"),
    # The stack of phones on the shtender table, with the open sefer.
    ("rrrring-rrrring.png", (40, 520, 765, 900), "rrrring-rrrring.jpg"),
    # The catapult and its passenger — no destination callout or sign.
    ("frum-tech-2.png", (0, 205, 700, 573), "frum-tech-2.jpg"),
    # The "gift of the decade" posters, stopping before the punchline.
    ("kallah-couture.jpeg", (120, 410, 710, 720), "kallah-couture.jpg"),
    # The ark and the two men on the stairs — no upside-down figures or sponsor band.
    ("shul-renovation.jpeg", (250, 365, 1050, 784), "shul-renovation.jpg"),
    # The rebbe, the board and the class — the cow is out of frame.
    ("experiential-learning.png", (250, 280, 896, 618), "experiential-learning.jpg"),
    # The wrapped gift by the menorah, before the "uses" start.
    ("discount-chanuka-gifts.png", (20, 180, 440, 400), "discount-chanuka-gifts.jpg"),
    # The parents staring at the hole in the wall — no classroom reveal.
    ("show-and-bath.png", (0, 480, 590, 790), "show-and-bath.jpg"),
    # The pricey catalogue and the bargain laptop — no "ethically sourced" reveal.
    ("factory-direct.png", (0, 170, 730, 552), "factory-direct.jpg"),
]


def make_strip_thumbs():
    OUT.mkdir(parents=True, exist_ok=True)
    for source, box, name in CROPS:
        with Image.open(ROOT / "comics" / source) as im:
            crop = im.convert("RGB").crop(box).resize(TARGET, Image.Resampling.LANCZOS)
            crop.save(OUT / name, "JPEG", quality=90, optimize=True, progressive=True)
        print(f"thumbs/{name}")


def make_home_card():
    """The base URL gets a brand card, not a strip-specific image."""
    card = Image.new("RGB", TARGET, PAPER)
    with Image.open(ROOT / "assets" / "mark.png") as mark_file:
        mark = mark_file.convert("RGBA")
        width = 940
        mark = mark.resize((width, round(mark.height * width / mark.width)), Image.Resampling.LANCZOS)
    card.paste(mark, ((TARGET[0] - mark.width) // 2, 110), mark)

    draw = ImageDraw.Draw(card)
    draw.line((495, 375, 705, 375), fill=(200, 134, 58), width=3)
    font = ImageFont.truetype(str(FONTS / "Handlee-Regular.ttf"), 40)
    lines = [
        "A frum comic strip with wacky humor,",
        "ridiculous inventions, and a touch of satire.",
    ]
    y = 415
    for line in lines:
        x = (TARGET[0] - draw.textlength(line, font=font)) / 2
        draw.text((x, y), line, font=font, fill=INK)
        y += 56

    card.save(ROOT / "assets" / "og-home.png", optimize=True)
    print("assets/og-home.png")


if __name__ == "__main__":
    make_strip_thumbs()
    make_home_card()
