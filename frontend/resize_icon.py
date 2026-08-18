import sys
from PIL import Image

def main():
    img = Image.open('/app/frontend/public/icon-256.png')
    
    # Save 32x32
    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save('/app/frontend/public/favicon-32x32.png')
    
    # Save 16x16
    img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save('/app/frontend/public/favicon-16x16.png')
    
    # Save favicon.ico (includes multiple sizes)
    img.save('/app/frontend/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

if __name__ == '__main__':
    main()
