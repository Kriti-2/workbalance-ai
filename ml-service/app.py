from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

model = joblib.load('burnout_model.pkl')
le    = joblib.load('label_encoder.pkl')

FEATURES = [
    'tasks_assigned', 'tasks_completed', 'overdue_tasks',
    'carryover_tasks', 'avg_completion_hrs', 'bug_reopened', 'sprint_pressure'
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        # Support single or batch predictions
        if isinstance(data, list):
            records = data
        else:
            records = [data]

        results = []
        for rec in records:
            features = pd.DataFrame([[rec.get(f, 0) for f in FEATURES]], columns=FEATURES)
            pred_enc = model.predict(features)[0]
            proba    = model.predict_proba(features)[0]
            label    = le.inverse_transform([pred_enc])[0]
            confidence = round(float(max(proba)), 4)
            results.append({
                'userId':      rec.get('userId', ''),
                'burnoutRisk': label,
                'confidence':  confidence,
                'probabilities': {
                    cls: round(float(p), 4)
                    for cls, p in zip(le.classes_, proba)
                }
            })

        return jsonify(results if isinstance(data, list) else results[0])

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("ML Service running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
