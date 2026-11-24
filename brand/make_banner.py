# Bannière YouTube 2560x1440 à partir du rendu de la scène episodes/_brand (Kipa et les héros des meilleures vidéos).
# 1) SIZE=2560x1440 CHROME=/usr/bin/google-chrome node tools/render.mjs episodes/_brand /tmp/br "0"
# 2) python3 brand/make_banner.py /tmp/br/f0000.jpg brand/Pourkoipa-banniere-2560x1440.jpg
# La promesse est dans la bande visible sur téléphone (1546x423 au centre).
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONT = 'assets/fonts/LuckiestGuy-Regular.ttf'
INK = (39, 25, 37); WHITE = (255, 255, 255); YEL = (255, 199, 44); BLUE = (37, 99, 214)
b = Image.open(sys.argv[1]).convert('RGBA')
cx, cy = 1280, 720
lines = [('UNE HISTOIRE', WHITE, 84), ('VRAIE', YEL, 112), ('PAR JOUR', WHITE, 84)]
f = {s: ImageFont.truetype(FONT, s) for _, _, s in lines}
hs = [f[s].getbbox(t)[3] - f[s].getbbox(t)[1] for t, _, s in lines]; gap = 14
tot = sum(hs) + gap * 2; ws = [f[s].getbbox(t)[2] - f[s].getbbox(t)[0] for t, _, s in lines]
pw, ph = max(ws) + 90, tot + 70
L = Image.new('RGBA', b.size, (0, 0, 0, 0)); d = ImageDraw.Draw(L)
x0, y0 = cx - pw // 2, cy - ph // 2
sh = Image.new('RGBA', b.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x0 + 10, y0 + 14, x0 + pw + 10, y0 + ph + 14], 46, fill=(39, 25, 37, 110))
b.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 46, fill=BLUE + (255,), outline=INK, width=10)
y = y0 + 35
for (t, c, s), h, w in zip(lines, hs, ws):
    bb = f[s].getbbox(t); tx = cx - w // 2 - bb[0]; ty = y - bb[1]
    d.text((tx + 4, ty + 7), t, font=f[s], fill=INK, stroke_width=8, stroke_fill=INK)
    d.text((tx, ty), t, font=f[s], fill=c, stroke_width=8, stroke_fill=INK)
    y += h + gap
L = L.rotate(-2, resample=Image.BICUBIC, center=(cx, cy))
b.alpha_composite(L)
b.convert('RGB').save(sys.argv[2], quality=94)
print(pw, ph, x0, y0)
