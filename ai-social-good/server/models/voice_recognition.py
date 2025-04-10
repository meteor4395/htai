import os
import torch
import whisper
from typing import Dict, Any

class VoiceRecognitionModel:
    def __init__(self):
        # Load the small model for faster inference
        self.model = whisper.load_model("small")
        
    def transcribe(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribe audio file to text using Whisper model.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Dictionary containing transcription results
        """
        try:
            # Transcribe the audio
            result = self.model.transcribe(audio_path)
            
            # Extract relevant information
            response = {
                'text': result['text'],
                'language': result['language'],
                'segments': result['segments'],
                'confidence': float(sum(s['confidence'] for s in result['segments']) / len(result['segments']))
            }
            
            return response
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")
        
    def cleanup(self, audio_path: str):
        """
        Clean up temporary audio files
        """
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception as e:
            print(f"Error cleaning up audio file: {str(e)}") 