from pathlib import Path

import torch
from torchvision import transforms
from PIL import Image
from django.conf import settings
import cv2
import pytesseract





def load_recognition_model():
    """
    Load the YOLOv5 model from the pre-trained .pt file.
    """
    print("Loading model...")
    model_path = Path(settings.BASE_DIR) / 'model' / 'best_submission.pt'
    print(f"Loading YOLOv5 model from: {model_path}")

    # Load the YOLOv5 model
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=str(model_path))
    model.eval()  # Set to evaluation mode
    return model

def extract_license_plates(image_path, results):
    """
    Extract license plates from the detected bounding boxes and apply OCR.
    """
    bboxes = results.pandas().xyxy[0]  # Access bounding boxes
    image = cv2.imread(image_path)

    license_plates = []
    for _, bbox in bboxes.iterrows():
        if bbox['name'] == 'license_plate':  # Match class label (ensure your model's class is 'license_plate')
            x1, y1, x2, y2 = int(bbox['xmin']), int(bbox['ymin']), int(bbox['xmax']), int(bbox['ymax'])

            # Crop the bounding box
            cropped_plate = image[y1:y2, x1:x2]

            # Apply OCR to read the license plate text
            text = pytesseract.image_to_string(cropped_plate, config='--psm 7')
            license_plates.append(text.strip())

    return license_plates

def preprocess_image(image_path):
    """
    Preprocess the input image to match the model's expected input format.
    """
    image = Image.open(image_path).convert('RGB')  # Ensure RGB format
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to match the model input size
        transforms.ToTensor(),         # Convert image to PyTorch tensor
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),  # Normalize
    ])
    return preprocess(image).unsqueeze(0)  # Add batch dimension


def detect_and_recognize_license_plate(image_path):
    """
    Detect license plates and recognize text using YOLOv5 and OCR.
    """
    # Load the YOLOv5 model
    model = load_recognition_model()

    # Run inference on the input image
    print("Running YOLOv5 model...")
    results = model(image_path)

    # Extract and recognize license plates using OCR
    license_plates = extract_license_plates(image_path, results)

    return license_plates



