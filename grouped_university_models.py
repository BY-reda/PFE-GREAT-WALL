import pandas as pd
import json
import numpy as np
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# HIERARCHICAL & GROUPED MACHINE LEARNING STRATEGY
# Training Local Models for High-Volume Universities vs. Global Tier Models
# ==============================================================================

# 1. Load CSV data
df = pd.read_csv('younes .csv')

data = []
for idx, row in df.iterrows():
    notes = row.get('Transcript Notes', '')
    moy = np.nan
    if pd.notna(notes) and isinstance(notes, str) and '{' in notes:
        try:
            parsed = json.loads(notes)
            m = parsed.get('MOY. GENERALE') or parsed.get('MOY. GENERALE ')
            if m: moy = float(str(m).replace(',', '.'))
        except: pass
    
    eng_score = row.get('English Score')
    eng_val = np.nan
    if pd.notna(eng_score) and isinstance(eng_score, str) and '/' in eng_score:
        try: eng_val = float(eng_score.split('/')[0])
        except: pass
            
    eng_prof = row.get('English Proficiency', 'FAIR')
    prof_map = {'EXCELLENT': 88, 'GOOD': 75, 'FAIR': 62}
    prof_score = prof_map.get(str(eng_prof).strip().upper(), 70)
    if np.isnan(eng_val): eng_val = prof_score
        
    univ = str(row.get('University Applied', 'Unknown')).strip()
    if pd.notna(moy) and univ != 'nan' and univ != 'Unknown':
        data.append({'University': univ, 'MOY_GENERALE': moy, 'English_Score': eng_val})

alumni_df = pd.DataFrame(data)

# 2. Count and Group Universities by Frequency
counts = alumni_df['University'].value_counts()
print("==============================================================================")
print("📊 UNIVERSITY DATA DISTRIBUTION (COUNT OF HISTORICAL ACCEPTED STUDENTS)")
print("==============================================================================")
print(counts.head(10))
print("...\n")

# Define High-Volume Universities (N >= 15) vs Low-Volume
high_vol_univs = counts[counts >= 15].index.tolist()
low_vol_univs = counts[counts < 15].index.tolist()

print(f"✅ High-Volume Universities (Dedicated Local Model): {len(high_vol_univs)} universities ({counts[high_vol_univs].sum()} students)")
print(f"ℹ️ Low-Volume Universities (Grouped Global Model): {len(low_vol_univs)} universities ({counts[low_vol_univs].sum()} students)\n")

# 3. Train Tiered Models
models = {}

# Train dedicated local models for high-volume universities
for u in high_vol_univs:
    sub = alumni_df[alumni_df['University'] == u]
    models[u] = {
        'type': 'LOCAL_DEDICATED_MODEL',
        'sample_size': len(sub),
        'mean_moy': sub['MOY_GENERALE'].mean(),
        'std_moy': max(sub['MOY_GENERALE'].std(), 1.0),
        'mean_eng': sub['English_Score'].mean(),
        'std_eng': max(sub['English_Score'].std(), 4.0),
        'min_moy': sub['MOY_GENERALE'].min()
    }

# Train 1 Global Grouped Model for all remaining low-volume universities
global_sub = alumni_df[alumni_df['University'].isin(low_vol_univs)]
models['GLOBAL_GROUPED_MODEL'] = {
    'type': 'GLOBAL_TIER_MODEL',
    'sample_size': len(global_sub),
    'mean_moy': global_sub['MOY_GENERALE'].mean(),
    'std_moy': max(global_sub['MOY_GENERALE'].std(), 1.2),
    'mean_eng': global_sub['English_Score'].mean(),
    'std_eng': max(global_sub['English_Score'].std(), 5.0),
    'min_moy': global_sub['MOY_GENERALE'].min()
}

print("==============================================================================")
print("🏛️ TRAINED MODEL SPECIFICATIONS")
print("==============================================================================")
for name, spec in list(models.items())[:6]:
    print(f"Model: [{name}] | Type: {spec['type']} | Sample Size (N): {spec['sample_size']}")
    print(f"   Learned Envelope -> Grade Mean: {spec['mean_moy']:.2f}/20 (±{spec['std_moy']:.2f}) | Min Cutoff: {spec['min_moy']:.2f}/20")
    print("   -------------------------------------------------------------------------")
