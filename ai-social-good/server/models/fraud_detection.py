import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import Dict, List, Any, Union

class FraudDetectionModel:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,  # Expected proportion of outliers
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.feature_names = [
            'amount', 'frequency', 'time_of_day', 'location_risk_score',
            'previous_activity', 'device_risk_score'
        ]
        
    def preprocess_data(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess input data for fraud detection.
        """
        features = np.array([
            float(data.get('amount', 0)),
            float(data.get('frequency', 0)),
            float(data.get('time_of_day', 0)) / 24.0,  # Normalize time to 0-1
            float(data.get('location_risk_score', 0)),
            float(data.get('previous_activity', 0)),
            float(data.get('device_risk_score', 0))
        ]).reshape(1, -1)
        
        return self.scaler.fit_transform(features)
    
    def detect_fraud(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect potential fraud in the input data.
        Returns a dictionary with fraud probability and risk factors.
        """
        try:
            # Preprocess the data
            processed_data = self.preprocess_data(data)
            
            # Get anomaly score (-1 for anomalies, 1 for normal)
            score = self.model.predict(processed_data)[0]
            
            # Convert score to fraud probability (anomaly score to 0-1 scale)
            # -1 (anomaly) becomes 1.0 (high fraud probability)
            # 1 (normal) becomes 0.0 (low fraud probability)
            fraud_probability = (1 - score) / 2
            
            # Calculate feature importance scores
            feature_scores = {}
            for i, feature in enumerate(self.feature_names):
                # Higher absolute value indicates more importance in decision
                feature_scores[feature] = abs(processed_data[0][i])
            
            # Sort risk factors by importance
            risk_factors = sorted(
                feature_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]  # Top 3 risk factors
            
            return {
                'fraud_probability': float(fraud_probability),
                'is_fraudulent': bool(score == -1),
                'risk_factors': [
                    {
                        'factor': factor,
                        'importance': float(score)
                    }
                    for factor, score in risk_factors
                ],
                'confidence': min(1.0, abs(fraud_probability - 0.5) * 2)
            }
            
        except Exception as e:
            raise Exception(f"Error in fraud detection: {str(e)}")
    
    def save_model(self, path: str):
        """Save the model to disk"""
        model_path = os.path.join(path, 'fraud_detection_model.joblib')
        scaler_path = os.path.join(path, 'fraud_detection_scaler.joblib')
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
    
    def load_model(self, path: str):
        """Load the model from disk"""
        model_path = os.path.join(path, 'fraud_detection_model.joblib')
        scaler_path = os.path.join(path, 'fraud_detection_scaler.joblib')
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            # Train on some initial data if no model exists
            self._train_initial_model() 