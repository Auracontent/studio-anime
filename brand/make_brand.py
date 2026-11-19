from PIL import Image, ImageDraw, ImageFont
import math
FONT = 'assets/fonts/LuckiestGuy-Regular.ttf'
BG = (37, 99, 214)       # bright blue (not RicksClips red)
EXT = (16, 40, 110)      # extrusion
INK = (39, 25, 37)       # plum-black outline, as in the videos
FILL = (255, 255, 255)
ACC = (255, 200, 40)     # yellow accent letter
def word(img, text, cx, cy, size, depth, accent=()):
    f = ImageFont.truetype(FONT, size)
    widths = [f.getbbox(ch)[2] - f.getbbox(ch)[0] for ch in text]
    gap = -size * 0.02; total = sum(widths) + gap * (len(text) - 1)
    x = cx - total / 2; stroke = max(4, size // 14)
    for i, ch in enumerate(text):
        w = widths[i]; ang = [-4, 3, -2, 4, -3, 2, -4, 3, -2][i % 9]; dy = [0, -8, 4, -6, 6, -4, 2, -8, 4][i % 9] * size / 300
        L = Image.new('RGBA', (int(w + size), int(size * 1.6)), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
        ox, oy = size * 0.4, size * 0.2
        for k in range(depth, 0, -2):  # extrusion down-right
            d.text((ox + k * 0.55, oy + k), ch, font=f, fill=EXT, stroke_width=stroke, stroke_fill=INK)
        d.text((ox, oy), ch, font=f, fill=ACC if i in accent else FILL, stroke_width=stroke, stroke_fill=INK)
        L = L.rotate(ang, resample=Image.BICUBIC, expand=False)
        img.alpha_composite(L, (int(x - ox + w * 0), int(cy - size * 0.55 - oy + dy)))
        x += w + gap
# banner 2560x1440 (safe area 1546x423 centred)
b = Image.new('RGBA', (2560, 1440), BG + (255,))
d = ImageDraw.Draw(b)
for i in range(-20, 60):  # subtle diagonal stripes
    x = i * 90; d.polygon([(x, 0), (x + 40, 0), (x + 40 - 1440 * 0.5, 1440), (x - 1440 * 0.5, 1440)], fill=(44, 108, 224, 255))
word(b, 'POURKOIPA', 1280, 740, 280, 32, accent=(8,))
b.convert('RGB').save('brand/Pourkoipa-banniere-2560x1440.jpg', quality=94)
c = b.convert('RGB').copy(); ImageDraw.Draw(c).rectangle([507, 508, 2053, 931], outline=(0, 255, 120), width=6); c.resize((1280, 720)).save('/tmp/b2_check.jpg')
# avatar 800x800: a big "P" with a "?" tucked in
a = Image.new('RGBA', (800, 800), BG + (255,))
word(a, 'P', 375, 440, 480, 40)
word(a, '?', 585, 480, 270, 24, accent=(0,))
a.convert('RGB').save('brand/Pourkoipa-logo-800x800.png')
m = Image.new('L', (600, 600), 0); ImageDraw.Draw(m).ellipse([0, 0, 599, 599], fill=255)
w = a.resize((600, 600), Image.LANCZOS); w.putalpha(m); ImageDraw.Draw(w).ellipse([6, 6, 593, 593], outline=(255, 255, 255, 255), width=22)
w.resize((150, 150), Image.LANCZOS).save('brand/Pourkoipa-filigrane-150x150.png')
p = Image.new('RGB', (1000, 420), (15, 15, 15)); cc = a.resize((400, 400)); mm = Image.new('L', (400, 400), 0); ImageDraw.Draw(mm).ellipse([0, 0, 399, 399], fill=255); cc.putalpha(mm); p.paste(cc, (10, 10), cc)
s = Image.open('brand/Pourkoipa-filigrane-150x150.png'); p.paste(s, (500, 135), s); p.save('/tmp/l2_check.jpg')
