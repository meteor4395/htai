from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import tensorflow as tf
import numpy as np
from models.image_recognition import ImageRecognitionModel
from models.voice_recognition import VoiceRecognitionModel
from werkzeug.utils import secure_filename
from datetime import datetime
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'wav', 'mp3'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Store analysis results in memory (replace with database in production)
analysis_history = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize ML models
image_model = None
voice_model = None

def load_models():
    global image_model, voice_model
    image_model = ImageRecognitionModel()
    voice_model = VoiceRecognitionModel()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/analyze/voice', methods=['POST'])
def analyze_voice():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                # Perform voice recognition
                result = voice_model.transcribe(filepath)
                
                # Store analysis result
                analysis_result = {
                    'id': len(analysis_history) + 1,
                    'type': 'voice',
                    'timestamp': datetime.now().isoformat(),
                    'text': result['text'],
                    'confidence': result['confidence'],
                    'language': result['language']
                }
                analysis_history.append(analysis_result)
                
                # Clean up the file
                voice_model.cleanup(filepath)
                
                return jsonify(analysis_result)
            
            except Exception as e:
                if os.path.exists(filepath):
                    os.remove(filepath)
                raise e
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Process the image directly from the file data
            file_data = file.read()
            predictions = image_model.predict(file_data)
            
            # Store analysis result
            analysis_result = {
                'id': len(analysis_history) + 1,
                'type': 'image',
                'timestamp': datetime.now().isoformat(),
                'predictions': predictions
            }
            analysis_history.append(analysis_result)
            
            return jsonify(analysis_result)
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyses', methods=['GET'])
def get_analyses():
    try:
        # Get query parameters for filtering
        analysis_type = request.args.get('type')
        limit = int(request.args.get('limit', 10))
        
        # Filter and sort analyses
        filtered_analyses = analysis_history
        if analysis_type:
            filtered_analyses = [a for a in analysis_history if a['type'] == analysis_type]
        
        # Sort by timestamp (most recent first) and limit results
        sorted_analyses = sorted(
            filtered_analyses,
            key=lambda x: x['timestamp'],
            reverse=True
        )[:limit]
        
        # Calculate statistics
        stats = {
            'totalAnalyses': len(analysis_history),
            'imageAnalyses': len([a for a in analysis_history if a['type'] == 'image']),
            'voiceAnalyses': len([a for a in analysis_history if a['type'] == 'voice']),
            'fraudDetections': len([a for a in analysis_history if a['type'] == 'fraud'])
        }
        
        return jsonify({
            'analyses': sorted_analyses,
            'stats': stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect/fraud', methods=['POST'])
def detect_fraud():
    try:
        # TODO: Implement fraud detection
        return jsonify({'message': 'Fraud detection endpoint'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_models()
    app.run(debug=True) 