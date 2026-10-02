import os
from PIL import Image, ImageDraw

def create_gotechplace_icon(size=512, portal_name=None):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded squircle background
    radius = int(size * 0.22)
    # Background gradient: Rich Brand Blue #026FC7 -> #0C3F6E
    # Draw rounded rectangle
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=(2, 111, 199, 255))
    
    # Subtle inner gloss / border highlight
    draw.rounded_rectangle([2, 2, size - 2, size - 2], radius=radius, outline=(54, 169, 250, 180), width=int(size * 0.02))
    
    # Graduation Cap Geometry (matching Lucide GraduationCap / website logo)
    cx, cy = size // 2, int(size * 0.46)
    w = int(size * 0.58)
    h = int(size * 0.18)
    
    # Diamond / Top Mortarboard (pointing up, right, down, left)
    top_cap = [
        (cx, cy - h // 2),        # Top vertex
        (cx + w // 2, cy),        # Right vertex
        (cx, cy + h // 2),        # Bottom vertex
        (cx - w // 2, cy),        # Left vertex
    ]
    draw.polygon(top_cap, fill=(255, 255, 255, 255))
    
    # Skull cap (underneath the diamond)
    skull_w = int(w * 0.55)
    skull_h = int(size * 0.16)
    skull_top = cy + int(h * 0.2)
    draw.polygon([
        (cx - skull_w // 2, skull_top),
        (cx + skull_w // 2, skull_top),
        (cx + int(skull_w * 0.4), skull_top + skull_h),
        (cx - int(skull_w * 0.4), skull_top + skull_h),
    ], fill=(240, 247, 255, 255))
    
    # Tassel Button
    btn_r = int(size * 0.022)
    draw.ellipse([cx - btn_r, cy - btn_r, cx + btn_r, cy + btn_r], fill=(254, 230, 138, 255))
    
    # Tassel String & Bob
    tassel_start = (cx, cy)
    tassel_bend = (cx + int(w * 0.52), cy + int(h * 0.2))
    tassel_end = (cx + int(w * 0.54), cy + int(size * 0.24))
    draw.line([tassel_start, tassel_bend, tassel_end], fill=(251, 191, 36, 255), width=max(2, int(size * 0.02)))
    
    # Tassel bob
    bob_w = int(size * 0.04)
    bob_h = int(size * 0.08)
    draw.ellipse([tassel_end[0] - bob_w // 2, tassel_end[1], tassel_end[0] + bob_w // 2, tassel_end[1] + bob_h], fill=(245, 158, 11, 255))
    
    # Small Portal Badge at bottom if specified
    if portal_name:
        badge_y = int(size * 0.76)
        badge_h = int(size * 0.16)
        badge_w = int(size * 0.75)
        badge_x = (size - badge_w) // 2
        # Pill
        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=badge_h // 2, fill=(12, 63, 110, 240), outline=(255, 255, 255, 160), width=max(1, int(size * 0.015)))

    return img

def export_all_mipmap_icons():
    sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    apps = {
        'student': 'STUDENT',
        'client': 'CLIENT',
        'admin': 'ADMIN'
    }
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for app_name, label in apps.items():
        res_dir = os.path.join(base_dir, app_name, 'android', 'app', 'src', 'main', 'res')
        if not os.path.exists(res_dir):
            continue
            
        print(f"Generating icons for {app_name}...")
        for folder, px in sizes.items():
            target_folder = os.path.join(res_dir, folder)
            os.makedirs(target_folder, exist_ok=True)
            
            icon = create_gotechplace_icon(size=px)
            icon.save(os.path.join(target_folder, 'ic_launcher.png'))
            icon.save(os.path.join(target_folder, 'ic_launcher_round.png'))
            
        # Also generate high-res 512x512
        icon_512 = create_gotechplace_icon(size=512)
        icon_512.save(os.path.join(base_dir, app_name, 'app_logo_512.png'))

    print("All app icons successfully generated matching website logo!")

if __name__ == '__main__':
    export_all_mipmap_icons()
