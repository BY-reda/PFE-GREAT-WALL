import pandas as pd
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load CSV
df = pd.read_csv('younes .csv')

print("Total rows:", len(df))

# Print clean English column names
cols = [c.encode('ascii', 'ignore').decode() for c in df.columns]
print("Columns:", cols)

if 'English Proficiency' in df.columns:
    print("\nEnglish Proficiency value counts:")
    for k, v in df['English Proficiency'].value_counts(dropna=False).items():
        print(f"  {str(k).encode('ascii', 'ignore').decode()}: {v}")

if 'English Score' in df.columns:
    print("\nEnglish Score value counts (top 10):")
    for k, v in df['English Score'].value_counts(dropna=False).head(10).items():
        print(f"  {str(k).encode('ascii', 'ignore').decode()}: {v}")

if 'University Applied' in df.columns:
    print("\nUniversity Applied value counts (top 10):")
    for k, v in df['University Applied'].value_counts(dropna=False).head(10).items():
        print(f"  {str(k).encode('ascii', 'ignore').decode()}: {v}")

# Extract grades
valid_json = 0
moy_list = []
eng_notes = []
for idx, row in df.iterrows():
    notes = row.get('Transcript Notes', '')
    if pd.notna(notes) and isinstance(notes, str) and '{' in notes:
        try:
            data = json.loads(notes)
            moy = data.get('MOY. GENERALE') or data.get('MOY. GENERALE ')
            if moy:
                # convert to float if string like '12,06' or '12.06'
                moy_float = float(str(moy).replace(',', '.'))
                moy_list.append(moy_float)
                valid_json += 1
        except Exception as e:
            pass

print(f"\nSuccessfully extracted {valid_json} MOY. GENERALE scores.")
if moy_list:
    moy_series = pd.Series(moy_list)
    print("MOY. GENERALE stats:")
    print(moy_series.describe())
