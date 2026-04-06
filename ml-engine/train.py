import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
import shap
import joblib
import os

print("Synthesizing realistic financial dataset...")
np.random.seed(42)
N = 5000

# Base features
payment_history = np.random.randint(0, 100, N)
credit_utilization = np.random.randint(0, 100, N)
credit_age = np.random.randint(0, 100, N)
account_mix = np.random.randint(0, 100, N)
recent_inquiries = np.random.randint(0, 100, N)

# Sensitive attribute: Age Group (0 for younger, 1 for older adult to introduce possible bias to be mitigated)
# We will create an artificial bias where older individuals are scored higher base default
age_group = np.random.choice([0, 1], p=[0.4, 0.6], size=N)

# Calculate base score (higher is better)
# Positive influence: payment history, credit age, account mix
# Negative influence: credit utilization, recent inquiries
base_score = (payment_history * 2.0) + (credit_age * 1.5) + (account_mix * 1.0) - (credit_utilization * 1.5) - (recent_inquiries * 1.0)

# Add artificial bias (Older get a +50 boost, making them more likely to be approved)
base_score += age_group * 50

# Add noise
base_score += np.random.normal(0, 20, N)

# Establish truth boundary: roughly top 50% get approved
threshold = np.percentile(base_score, 50)
y = (base_score > threshold).astype(int)

df = pd.DataFrame({
    'Payment_History': payment_history,
    'Credit_Utilization': credit_utilization,
    'Credit_Age': credit_age,
    'Account_Mix': account_mix,
    'Recent_Inquiries': recent_inquiries,
    'Age_Group': age_group
})

X = df.drop(columns=['Age_Group'])
sensitive_features = df['Age_Group']

# Train base RandomForest
print("Training base Random Forest Classifier...")
rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)

# Use Fairlearn ExponentiatedGradient for bias mitigation
# We want to achieve Demographic Parity (approval rate identical across Age Groups)
print("Applying Fairlearn Exponentiated Gradient Reduction (Demographic Parity)...")
mitigator = ExponentiatedGradient(rf, DemographicParity())
mitigator.fit(X, y, sensitive_features=sensitive_features)

# Extract best inner predictor from the ensemble (to generate SHAP values easily)
predictors = mitigator.predictors_
# Find the predictor with max weight
best_predictor = predictors[np.argmax(mitigator.weights_)]

# We'll use the best single predictor as a proxy for SHAP to keep it fast, 
# while still retaining the mitigations learned.
print("Fitting SHAP TreeExplainer...")
explainer = shap.TreeExplainer(best_predictor)

print("Saving models to disk...")
output_dir = "models"
os.makedirs(output_dir, exist_ok=True)
joblib.dump(best_predictor, f"{output_dir}/fair_rf_model.pkl")
joblib.dump(explainer, f"{output_dir}/shap_explainer.pkl")

# Save population averages for front-end
pop_avg = X.mean().to_dict()
joblib.dump(pop_avg, f"{output_dir}/population_avg.pkl")

print("Training complete and artifacts saved in /models")
