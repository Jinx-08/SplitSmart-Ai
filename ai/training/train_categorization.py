import pandas as pd, joblib, json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

df = pd.read_csv('data/labeled/expenses_labeled.csv')
print(f'Dataset size: {len(df)} rows')
print(df['category'].value_counts())

X = df['description'] # Raw text descriptions
y = df['category'] # Category labels (strings)
X_train, X_test, y_train, y_test = train_test_split(
X, y, test_size=0.2, random_state=42, stratify=y
# stratify=y ensures each category is proportionally represented in train/test
)

model = Pipeline([
('tfidf', TfidfVectorizer(
ngram_range=(1, 2), # Use single words AND word pairs
max_features=5000, # Keep top 5000 most informative features
stop_words='english', # Remove 'the', 'a', 'at', etc.
min_df=2, # Ignore words that appear only once
)),
('classifier', MultinomialNB(
alpha=0.1 # Smoothing — prevents zero probabilities
))
])

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print('\n=== Test Set Results ===')
print(f'Accuracy: {(y_pred == y_test).mean():.2%}') # Should be >90%
print('\n=== Per-Category Report ===')
print(classification_report(y_test, y_pred))

cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')

print(f'Cross-val accuracy: {cv_scores.mean():.2%} ± {cv_scores.std():.2%}')

joblib.dump(model, 'models/expense_categorization_model.joblib')
print('Model saved to models/expense_categorization_model.joblib')

test_descriptions = [
'Lunch at Subway',
'Uber ride to airport',
'Monthly Netflix subscription',
'Grocery shopping at Walmart',
'Coffee at Starbucks',
'Gym membership fee',
]

predicted_categories = model.predict(test_descriptions)
probabilities = model.predict_proba(test_descriptions)
print('\n=== Sample Predictions ===')
for desc, pred, prob in zip(test_descriptions, predicted_categories, probabilities):
    print(f'{desc:35} → {pred:20} ({prob:.0%} confidence)')