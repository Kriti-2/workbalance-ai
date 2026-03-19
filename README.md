# ⚖️ WorkBalance AI — Complete Setup Guide

## Folder Structure
```
WorkBalance-AI/
├── ml-service/        → Python ML model + Flask API
├── backend/           → Node.js + Express + MongoDB
└── frontend/          → React app
```

---

## STEP 1 — ML Service Setup

```bash
cd ml-service

# Install dependencies
pip install flask flask-cors scikit-learn pandas numpy joblib

# Generate dataset + train model (already done — files exist)
python generate_dataset.py
python train_model.py

# Start Flask API on port 5001
python app.py
```
✅ ML service running at: http://localhost:5001

---

## STEP 2 — Backend Setup

```bash
cd backend

# Install Node dependencies
npm install

# Make sure MongoDB is running:
# Windows: net start MongoDB
# Mac:     brew services start mongodb-community
# Linux:   sudo systemctl start mongod

# Start backend
npm run dev       ← development (auto-restart)
npm start         ← production
```
✅ Backend running at: http://localhost:5000

---

## STEP 3 — Frontend Setup

```bash
cd frontend

# Install React dependencies
npm install

# Start React app
npm start
```
✅ Frontend running at: http://localhost:3000

---

## Run All Together (3 terminals)

| Terminal | Command |
|---|---|
| Terminal 1 | `cd ml-service && python app.py` |
| Terminal 2 | `cd backend && npm run dev` |
| Terminal 3 | `cd frontend && npm start` |

---

## How to Use

1. Open http://localhost:3000
2. Register as **Manager** (to create projects)
3. Create a project → add sprints → assign tasks
4. Go to **Burnout Risk** page
5. Select project → click **Run Burnout Prediction**
6. View risk levels (Low / Medium / High) + recommendations

---

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me

### Projects
- GET  /api/projects
- POST /api/projects
- GET  /api/projects/:id
- PUT  /api/projects/:id

### Sprints
- GET  /api/sprints?projectId=...
- POST /api/sprints

### Tasks
- GET  /api/tasks?projectId=...&sprintId=...
- POST /api/tasks
- PUT  /api/tasks/:id  ← drag-drop Kanban update

### Burnout
- POST /api/burnout/predict-project/:projectId
- GET  /api/burnout/project/:projectId
- GET  /api/burnout/history/:userId

### ML Service
- GET  http://localhost:5001/health
- POST http://localhost:5001/predict

---

## ML Model Performance

| Model | Accuracy | CV Accuracy |
|---|---|---|
| Logistic Regression | 100% | 100% |
| Decision Tree | 99.5% | 99.8% |
| **Random Forest** ✅ | **100%** | **100%** |

Best model: **Random Forest** (saved as `burnout_model.pkl`)
