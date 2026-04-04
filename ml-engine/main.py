from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import shap
import uvicorn

app = FastAPI()

# -------------------------------------------------------------
# 1. Train a mock Machine Learning Model on Startup
# -------------------------------------------------------------
print("Training the Explainable AI Credit Model...")

# Generate some synthetic training data
np.random.seed(42)
n_samples = 1000
features = ['Payment_History', 'Credit_Utilization', 'Credit_Age', 'Account_Mix', 'Recent_Inquiries']

X_train = pd.DataFrame(np.random.randint(40, 100, size=(n_samples, 5)), columns=features)
# Intentionally create linear relationships for the risk
y_train = (
    X_train['Payment_History'] * 3.5 + 
    X_train['Credit_Utilization'] * -1.5 + 
    X_train['Credit_Age'] * 1.2 + 
    X_train['Account_Mix'] * 2.0 + 
    X_train['Recent_Inquiries'] * 0.8
)
# Normalize score to approx 300 - 850 (FICO scale)
y_train = 300 + ((y_train - y_train.min()) / (y_train.max() - y_train.min())) * 550

# Train Random Forest
model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X_train, y_train)

# Initialize SHAP explainer
explainer = shap.TreeExplainer(model)

print("Model fully trained & SHAP Explainer initialized.")

# -------------------------------------------------------------
# 2. Define Request / Response Schemas
# -------------------------------------------------------------
class CustomerData(BaseModel):
    customer_id: str
    Payment_History: int
    Credit_Utilization: int
    Credit_Age: int
    Account_Mix: int
    Recent_Inquiries: int

# -------------------------------------------------------------
# 3. Create Prediction Endpoint
# -------------------------------------------------------------
@app.post("/predict_credit_risk")
def predict_credit_risk(data: CustomerData):
    # Convert input to dataframe
    input_features = [
        data.Payment_History,
        data.Credit_Utilization,
        data.Credit_Age,
        data.Account_Mix,
        data.Recent_Inquiries
    ]
    df_input = pd.DataFrame([input_features], columns=features)
    
    # Run Prediction
    prediction = model.predict(df_input)[0]
    credit_score = int(prediction)
    
    # Run SHAP Explainability Logic
    shap_values = explainer.shap_values(df_input)[0]
    
    # Format Explainability Response
    factors = []
    population_avg = {
        'Payment_History': 65,
        'Credit_Utilization': 70,
        'Credit_Age': 60,
        'Account_Mix': 50,
        'Recent_Inquiries': 80
    }
    
    for i, feature in enumerate(features):
        feature_name = feature.replace('_', ' ')
        factors.append({
            "factor": feature_name,
            "score": input_features[i],          # The raw feature input score (0-100 format)
            "avg": population_avg[feature],      # Comparison Average
            "shap_impact": shap_values[i],       # Direct mathematical impact of this feature
        })

    # Inference Decision Logic
    recommendation = "Reject Credit Line"
    limit = 0
    tier = "N/A"
    
    if credit_score >= 720:
        recommendation = "Approve Credit Line"
        limit = 15000 + (credit_score - 720) * 100
        tier = "Premium (14.9%)"
    elif credit_score >= 650:
        recommendation = "Approve Credit Line (Restricted)"
        limit = 5000 + (credit_score - 650) * 50
        tier = "Standard (22.9%)"
    
    return {
        "id": data.customer_id,
        "score": credit_score,
        "recommendation": recommendation,
        "limit": int(limit),
        "tier": tier,
        "factors": factors
    }

if __name__ == "__main__":
    # Start the fast API server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
