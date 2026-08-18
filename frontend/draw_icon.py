from PIL import Image, ImageDraw
import sys

def main():
    img = Image.new('RGBA', (256, 256), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    # Scaled from 24x24: 256 / 24 = 10.66
    # Original: M13 2L3 14h9l-1 8 10-12h-9l1-8z
    # 13*10.66, 2*10.66 ...
    scale = 10.66
    points = [
        (13 * scale, 2 * scale),
        (3 * scale, 14 * scale),
        (12 * scale, 14 * scale),
        (11 * scale, 22 * scale),
        (21 * scale, 10 * scale),
        (12 * scale, 10 * scale)
    ]
    draw.polygon(points, fill="#09090b")

    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save('/app/frontend/public/favicon-32x32.png')
    
    img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save('/app/frontend/public/favicon-16x16.png')
    
    img.save('/app/frontend/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

if __name__ == '__main__':
    main()
