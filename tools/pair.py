# Junta duas imagens às cegas, rotuladas só como A e B.
# python tools/pair.py <img_A> <img_B> <saida.png>
import sys
from PIL import Image, ImageDraw, ImageFont

a, b, out = sys.argv[1:4]
A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
try:
    font = ImageFont.truetype('arialbd.ttf', 44)
except Exception:
    font = ImageFont.load_default()
strip = max(A.width / A.height, B.width / B.height) > 3.2
bar, gap, bg = 64, 24, (128, 128, 128)
if strip:  # faixas largas: empilha com a mesma largura
    W = 1600
    A = A.resize((W, round(A.height * W / A.width)), Image.LANCZOS)
    B = B.resize((W, round(B.height * W / B.width)), Image.LANCZOS)
    canvas = Image.new('RGB', (W, 2 * bar + A.height + B.height + gap), bg)
    canvas.paste(A, (0, bar)); canvas.paste(B, (0, 2 * bar + A.height + gap))
    pos = [(16, 8), (16, bar + A.height + gap + 8)]
else:  # lado a lado com a mesma altura
    H = 1000
    A = A.resize((round(A.width * H / A.height), H), Image.LANCZOS)
    B = B.resize((round(B.width * H / B.height), H), Image.LANCZOS)
    canvas = Image.new('RGB', (A.width + B.width + gap, H + bar), bg)
    canvas.paste(A, (0, bar)); canvas.paste(B, (A.width + gap, bar))
    pos = [(16, 8), (A.width + gap + 16, 8)]
d = ImageDraw.Draw(canvas)
for (x, y), t in zip(pos, 'AB'):
    d.text((x, y), t, fill=(255, 255, 255), font=font)
canvas.save(out)
print('par ok ->', out, canvas.size)
