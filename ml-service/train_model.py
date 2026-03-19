import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

df = pd.read_csv('dataset.csv')

FEATURES = [
    'tasks_assigned', 'tasks_completed', 'overdue_tasks',
    'carryover_tasks', 'avg_completion_hrs', 'bug_reopened', 'sprint_pressure'
]

X = df[FEATURES]
y = df['burnout_risk']

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

models = {
    'Logistic Regression': LogisticRegression(max_iter=500, random_state=42),
    'Decision Tree':       DecisionTreeClassifier(max_depth=8, random_state=42),
    'Random Forest':       RandomForestClassifier(n_estimators=100, random_state=42)
}

results = {}
print("=" * 60)
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cv  = cross_val_score(model, X, y_enc, cv=5).mean()
    results[name] = {
        'accuracy': round(float(acc), 4),
        'cv_accuracy': round(float(cv), 4),
        'report': classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    }
    print(f"\n{name}  |  Acc: {acc:.4f}  |  CV: {cv:.4f}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

with open('model_results.json', 'w') as f:
    json.dump(results, f, indent=2)

joblib.dump(models['Random Forest'], 'burnout_model.pkl')
joblib.dump(le, 'label_encoder.pkl')
print("\n✅ Model saved: burnout_model.pkl")
print(f"🎯 Random Forest Accuracy: {results['Random Forest']['accuracy']}")
