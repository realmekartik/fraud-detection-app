from fastapi import FastAPI
from pydantic import BaseModel
import random
import uvicorn

app = FastAPI()

print("Training the Explainable AI Credit Model mock...")
print("Model fully trained & SHAP Explainer initialized.")

class CustomerData(BaseModel):
    customer_id: str
    Payment_History: int
    Credit_Utilization: int
    Credit_Age: int
    Account_Mix: int
    Recent_Inquiries: int

@app.post("/predict_credit_risk")
def predict_credit_risk(data: CustomerData):
    credit_score = random.randint(550, 800)
    
    factors = []
    population_avg = {
        'Payment_History': 65,
        'Credit_Utilization': 70,
        'Credit_Age': 60,
        'Account_Mix': 50,
        'Recent_Inquiries': 80
    }
    
    input_features = [
        data.Payment_History,
        data.Credit_Utilization,
        data.Credit_Age,
        data.Account_Mix,
        data.Recent_Inquiries
    ]
    features = ['Payment_History', 'Credit_Utilization', 'Credit_Age', 'Account_Mix', 'Recent_Inquiries']

    for i, feature in enumerate(features):
        feature_name = feature.replace('_', ' ')
        factors.append({
            "factor": feature_name,
            "score": input_features[i],
            "avg": population_avg[feature],
            "shap_impact": random.uniform(-10.0, 10.0),
        })

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
