import os, pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

response = supabase.table("expenses").select('id , amount, category, date, description , split_type , created_at , paid_by , group_id').execute()

df = pd.DataFrame(response.data)

df['description'] = df['description'].str.lower().str.strip()
df['amount_log'] = df['amount'].apply(lambda x: __import__('math').log1p(x))
df['created_at'] = pd.to_datetime(df['created_at'])
df['day_of_week'] = df['created_at'].dt.dayofweek # 0=Monday
df['hour'] = df['created_at'].dt.hour

df['month'] = df['created_at'].dt.month
df.to_csv('data/raw/expenses_raw.csv', index=False)
print(f'Exported {len(df)} expenses')
print(df['category'].value_counts())