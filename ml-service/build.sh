#!/bin/bash
pip install --upgrade pip
pip install --only-binary=:all: numpy==1.24.4
pip install --only-binary=:all: scipy==1.10.1
pip install --only-binary=:all: scikit-learn==1.2.2
pip install flask==3.0.3 flask-cors==4.0.1 gunicorn==21.2.0 joblib==1.3.2
