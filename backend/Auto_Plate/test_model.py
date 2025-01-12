#Model Testing
import torch

model = torch.hub.load('ultralytics/yolov5', 'custom', path='model/best_submission.pt')


test_image_path = 'model/images/6.jpg'

# Run inference
results = model(test_image_path)

# Print results
print("Results:", results)               # Full results object
print(results.pandas().xyxy)            # Bounding boxes with class labels
