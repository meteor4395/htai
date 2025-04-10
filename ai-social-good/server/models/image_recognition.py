import torch
import torchvision
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import os

class ImageRecognitionModel:
    def __init__(self):
        # Load pre-trained ResNet50 model
        self.model = torchvision.models.resnet50(pretrained=True)
        self.model.eval()
        
        # Define image preprocessing pipeline
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Load ImageNet class labels
        self.classes = []
        with open(os.path.join(os.path.dirname(__file__), 'imagenet_classes.txt'), 'r') as f:
            self.classes = [line.strip() for line in f.readlines()]
    
    def preprocess_image(self, image_data):
        """Preprocess image data for model input"""
        try:
            # Convert image data to PIL Image
            image = Image.open(image_data).convert('RGB')
            
            # Apply preprocessing transforms
            input_tensor = self.preprocess(image)
            input_batch = input_tensor.unsqueeze(0)
            
            return input_batch
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            return None
    
    def predict(self, image_data):
        """Make prediction on image data"""
        try:
            # Preprocess image
            input_batch = self.preprocess_image(image_data)
            if input_batch is None:
                return []
            
            # Make prediction
            with torch.no_grad():
                output = self.model(input_batch)
            
            # Get top 5 predictions
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top5_prob, top5_catid = torch.topk(probabilities, 5)
            
            # Format predictions
            predictions = []
            for i in range(top5_prob.size(0)):
                predictions.append({
                    'label': self.classes[top5_catid[i]],
                    'confidence': float(top5_prob[i])
                })
            
            return predictions
        except Exception as e:
            print(f"Error making prediction: {str(e)}")
            return [] 