# AI for Social Good

An AI-powered platform that leverages machine learning to improve disaster response, fraud detection, and accessibility for vulnerable groups.

## Features

- Real-time data processing for voice and image recognition
- Fraud/anomaly detection engine
- Accessibility features for vulnerable groups
- SMS-based accessibility (coming soon)
- GIS mapping for disaster zones (coming soon)
- Auto-generated NGO reports (coming soon)

## Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Flask, TensorFlow
- **Database**: Firebase / PostgreSQL
- **ML Models**: TensorFlow, PyTorch
- **APIs**: Twilio (SMS), Mapbox (GIS)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- pip
- npm or yarn

### Frontend Setup

```bash
cd client
npm install
npm start
```

### Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Environment Variables

Create `.env` files in both client and server directories:

```
# Client .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your_firebase_config

# Server .env
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=your_database_url
```

## Project Structure

```
ai-social-good/
├── client/                     # React frontend
├── server/                     # Flask backend
├── firebase/                   # Firebase configuration
├── models/                     # ML models
├── reports/                    # Auto-generated reports
└── data/                       # Training/testing data
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TensorFlow team for ML tools
- React team for frontend framework
- Firebase for backend services 