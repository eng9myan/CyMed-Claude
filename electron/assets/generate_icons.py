"""Generate CyMed icon set (PNG + ICO) programmatically using PIL."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).parent
SIZES_ICO = [16, 24, 32, 48, 64, 128, 256]
SIZES_PNG = [16, 32, 48, 64, 128, 256, 512, 1024]

def make_icon(size: int) -> Image.Image:
    """Render the CyMed mark — orange-gradient rounded square with '+' glyph."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * 0.22)
    pad = int(size * 0.05)

    # Background fill — solid orange (mimics gradient closely)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        fill=(230, 126, 34, 255),
    )

    # Plus mark
    try:
        font_size = int(size * 0.7)
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), "+", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1] - size*0.04),
        "+",
        font=font,
        fill=(255, 255, 255, 255),
    )
    return img

def main():
    largest = make_icon(1024)
    largest.save(OUT / "cymed.png")
    print("OK cymed.png (1024)")

    for sz in SIZES_PNG:
        make_icon(sz).save(OUT / f"cymed_{sz}.png")

    # Multi-resolution ICO
    images = [make_icon(s) for s in SIZES_ICO]
    images[-1].save(
        OUT / "cymed.ico",
        format="ICO",
        sizes=[(s, s) for s in SIZES_ICO],
    )
    print("OK cymed.ico (multi-resolution)")
    print(f"\nIcons written to: {OUT}")

if __name__ == "__main__":
    main()
