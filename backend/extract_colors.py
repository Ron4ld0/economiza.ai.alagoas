import sys
try:
    from colorthief import ColorThief
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "colorthief"])
    from colorthief import ColorThief

color_thief = ColorThief('../docs/assets/economizaAIlogopng.png')
dominant_color = color_thief.get_color(quality=1)
palette = color_thief.get_palette(color_count=5)

def rgb2hex(r, g, b):
    return f"#{r:02x}{g:02x}{b:02x}"

print("Dominant Color:", rgb2hex(*dominant_color))
print("Palette:")
for c in palette:
    print(rgb2hex(*c))
