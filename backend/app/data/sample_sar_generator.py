import cv2
import numpy as np
import base64

def generate_synthetic_sar_image() -> tuple[bytes, str]:
    """
    Generates a realistic synthetic Sentinel-1 SAR satellite image
    with ocean surface texture, speckle noise, and dark oil spill slick.
    """
    w, h = 600, 600
    
    # 1. Base ocean backscatter intensity (medium gray ~ 130-160)
    ocean = np.random.normal(loc=140, scale=12, size=(h, w)).astype(np.float32)

    # 2. Add SAR speckle noise (multiplicative gamma noise)
    speckle = np.random.gamma(shape=4.0, scale=0.25, size=(h, w)).astype(np.float32)
    sar_texture = ocean * speckle
    sar_texture = np.clip(sar_texture, 0, 255).astype(np.uint8)

    # 3. Draw Dark Oil Slick (Oil dampens surface capillary waves -> low radar backscatter -> dark patch)
    oil_mask = np.zeros((h, w), dtype=np.uint8)
    
    # Main elongated slick body
    cv2.ellipse(oil_mask, (315, 285), (120, 45), 35, 0, 360, 255, -1)
    
    # Secondary slick tail
    cv2.ellipse(oil_mask, (215, 345), (65, 25), 40, 0, 360, 255, -1)
    
    # Smooth oil slick mask edges
    oil_mask_smooth = cv2.GaussianBlur(oil_mask, (15, 15), 0) / 255.0

    # Attenuate backscatter in slick region (dark patch ~ 30-60 intensity)
    dark_oil_intensity = np.random.normal(loc=45, scale=8, size=(h, w)).astype(np.float32)
    dark_oil_intensity = np.clip(dark_oil_intensity, 15, 75)

    final_img = (sar_texture * (1.0 - oil_mask_smooth) + dark_oil_intensity * oil_mask_smooth).astype(np.uint8)
    
    # Convert to BGR for standard image encoding
    bgr_img = cv2.cvtColor(final_img, cv2.COLOR_GRAY2BGR)

    # Encode as PNG bytes and base64
    _, buffer = cv2.imencode('.png', bgr_img)
    img_bytes = buffer.tobytes()
    b64_str = "data:image/png;base64," + base64.b64encode(img_bytes).decode('utf-8')

    return img_bytes, b64_str
