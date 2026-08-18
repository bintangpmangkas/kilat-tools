import asyncio
from playwright.async_api import async_playwright

svg_content = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="#09090b">
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
</svg>
"""

html_content = f"""
<!DOCTYPE html>
<html>
<head>
<style>
  body {{ margin: 0; padding: 0; background: transparent; }}
  svg {{ display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 256, "height": 256})
        await page.set_content(html_content)
        await page.locator('svg').screenshot(path='/app/frontend/public/icon-256.png', omit_background=True)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
