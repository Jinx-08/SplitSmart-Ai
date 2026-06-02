import pandas as pd, numpy as np, joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

df = pd.read_csv('data/processed/expenses_features.csv')

df['amount_zscore'] = df.groupby('paid_by')['amount'].transform(
lambda x: (x - x.mean()) / (x.std() + 1e-8) # +epsilon avoids div by zero
)

df['is_duplicate'] = df.duplicated(
subset=['paid_by', 'amount', 'description'], keep=False
).astype(int)

feature_cols = ['amount_zscore', 'day_of_week', 'hour', 'month', 'is_duplicate']

X = df[feature_cols].fillna(0) 


anomaly_model = Pipeline([
('scaler', StandardScaler()), # Normalise all features to same scale
('iforest', IsolationForest(
n_estimators=100, # 100 trees = good accuracy
contamination=0.05, # Expect ~5% of expenses to be anomalies
random_state=42,
))
])

anomaly_model.fit(X)

df['anomaly_label'] = anomaly_model.predict(X)
df['anomaly_score'] = anomaly_model.score_samples(X)    

s = df['anomaly_score']

df['anomaly_pct'] = 1 - (s - s.min()) / (s.max() - s.min())  

flagged = df[df['anomaly_label'] == -1].sort_values('anomaly_pct', ascending=False)
print(f'Flagged {len(flagged)} expenses ({len(flagged)/len(df):.1%} of total)')
print(flagged[['description','amount','anomaly_pct']].head(10))

joblib.dump(anomaly_model, 'models/expense_anomaly_model.joblib')
print('Anomaly detection model saved to models/expense_anomaly_model.joblib')
