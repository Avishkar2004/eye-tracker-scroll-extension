from PIL import Image, ImageDraw

def create_icon(size, filename):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw eye icon (simple representation)
    # Face circle
    margin = size // 8
    face_size = size - (margin * 2)
    draw.ellipse([margin, margin, margin + face_size, margin + face_size], 
                 fill=(66, 133, 244, 255), outline=(25, 118, 210, 255), width=2)
    
    # Left eye
    eye_y = size // 2 - size // 12
    left_eye_x = size // 2 - size // 6
    eye_size = size // 8
    draw.ellipse([left_eye_x - eye_size//2, eye_y - eye_size//2, 
                  left_eye_x + eye_size//2, eye_y + eye_size//2], 
                 fill=(255, 255, 255, 255))
    
    # Right eye
    right_eye_x = size // 2 + size // 6
    draw.ellipse([right_eye_x - eye_size//2, eye_y - eye_size//2, 
                  right_eye_x + eye_size//2, eye_y + eye_size//2], 
                 fill=(255, 255, 255, 255))
    
    # Pupils
    pupil_size = eye_size // 3
    draw.ellipse([left_eye_x - pupil_size//2, eye_y - pupil_size//2, 
                  left_eye_x + pupil_size//2, eye_y + pupil_size//2], 
                 fill=(0, 0, 0, 255))
    draw.ellipse([right_eye_x - pupil_size//2, eye_y - pupil_size//2, 
                  right_eye_x + pupil_size//2, eye_y + pupil_size//2], 
                 fill=(0, 0, 0, 255))
    
    img.save(filename, 'PNG')
    print(f'Created {filename}')

if __name__ == '__main__':
    try:
        create_icon(16, 'icon16.png')
        create_icon(48, 'icon48.png')
        create_icon(128, 'icon128.png')
        print('All icons created successfully!')
    except ImportError:
        print('PIL (Pillow) is required. Install it with: pip install Pillow')
        print('Alternatively, you can create simple icon PNG files manually.')

