import pandas as pd
import json
import numpy as np
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# AI UNIVERSITY RECOMMENDER & INTERVIEW MATCHMAKER ENGINE
# ==============================================================================

# 1. Load historical accepted alumni database
df = pd.read_csv('younes .csv')

data = []
for idx, row in df.iterrows():
    notes = row.get('Transcript Notes', '')
    moy = np.nan
    if pd.notna(notes) and isinstance(notes, str) and '{' in notes:
        try:
            parsed = json.loads(notes)
            m = parsed.get('MOY. GENERALE') or parsed.get('MOY. GENERALE ')
            if m:
                moy = float(str(m).replace(',', '.'))
        except:
            pass
    
    eng_score = row.get('English Score')
    eng_val = np.nan
    if pd.notna(eng_score) and isinstance(eng_score, str) and '/' in eng_score:
        try:
            eng_val = float(eng_score.split('/')[0])
        except:
            pass
            
    eng_prof = row.get('English Proficiency', 'FAIR')
    prof_map = {'EXCELLENT': 88, 'GOOD': 75, 'FAIR': 62}
    prof_score = prof_map.get(str(eng_prof).strip().upper(), 70)
    if np.isnan(eng_val): eng_val = prof_score
        
    univ = str(row.get('University Applied', 'Unknown')).strip()
    major = str(row.get('Major', 'Unknown')).strip()
    
    if pd.notna(moy) and univ != 'nan' and univ != 'Unknown':
        data.append({
            'University': univ,
            'Major': major,
            'MOY_GENERALE': moy,
            'English_Score': eng_val
        })

alumni_df = pd.DataFrame(data)

# Calculate University Profiles (Min, Mean, Std for Grade & English)
univ_stats = alumni_df.groupby('University').agg(
    count=('MOY_GENERALE', 'count'),
    mean_moy=('MOY_GENERALE', 'mean'),
    std_moy=('MOY_GENERALE', lambda x: max(x.std(), 1.2) if len(x) > 1 and x.std() > 0.1 else 1.5),
    min_moy=('MOY_GENERALE', 'min'),
    mean_eng=('English_Score', 'mean'),
    std_eng=('English_Score', lambda x: max(x.std(), 4.0) if len(x) > 1 and x.std() > 0.1 else 6.0)
).reset_index()

univ_stats = univ_stats[univ_stats['count'] >= 3].copy()
print(f"Loaded {len(univ_stats)} competitive university profiles from historical database.\n")

# 2. Recommendation Engine Function
def recommend_universities(student_name, student_moy, student_eng, desired_major=None):
    print("==============================================================================")
    print(f"🎯 AI MATCHMAKING REPORT FOR: {student_name.upper()}")
    print(f"📋 Profile: General Average = {student_moy}/20 | English Score = {student_eng}/100")
    if desired_major:
        print(f"🎓 Desired Major: {desired_major}")
    print("==============================================================================")
    
    results = []
    for idx, row in univ_stats.iterrows():
        u_name = row['University']
        u_mean_moy, u_std_moy = row['mean_moy'], row['std_moy']
        u_mean_eng, u_std_eng = row['mean_eng'], row['std_eng']
        u_min_moy = row['min_moy']
        
        # Check Stage 1 Cutoff (Envelope check)
        z_moy = (student_moy - u_mean_moy) / u_std_moy
        z_eng = (student_eng - u_mean_eng) / u_std_eng
        
        if student_moy < (u_min_moy - 0.5):
            continue
            
        # Calculate Stage 2 Probability for this specific university
        composite_z = 0.65 * z_moy + 0.35 * z_eng
        prob = round(float(100 / (1 + np.exp(-1.3 * (composite_z + 1.2)))), 1)
        prob = min(max(prob, 20.0), 99.0)
        
        # Categorize Match Type
        if prob >= 85:
            match_type = "🌟 SAFE MATCH (High Acceptance & Easy Interview)"
        elif prob >= 70:
            match_type = "✅ TARGET MATCH (Strong Chance of Acceptance)"
        elif prob >= 55:
            match_type = "⚠️ REACH MATCH (Moderate Risk - Interview Prep Needed)"
        else:
            match_type = "🚨 HIGH RISK (Ambitious Choice - Intensive Coaching Required)"
            
        results.append({
            'University': u_name,
            'Historical_Avg_Grade': round(u_mean_moy, 2),
            'Match_Probability': prob,
            'Category': match_type
        })
        
    res_df = pd.DataFrame(results).sort_values(by='Match_Probability', ascending=False)
    
    print("🏆 TOP 5 RECOMMENDED UNIVERSITIES FOR YOUR PROFILE:\n")
    for rank, (_, r) in enumerate(res_df.head(5).iterrows(), 1):
        print(f"{rank}. {r['University']}  -->  [{r['Match_Probability']}% Match Probability]")
        print(f"   Alumni Benchmark: {r['Historical_Avg_Grade']}/20 avg | Evaluation: {r['Category']}")
        print("   -------------------------------------------------------------------------")
    return res_df

# 3. Simulate 3 Real Students Seeking University Recommendations
recommend_universities("Younes (Strong Scholar)", student_moy=16.0, student_eng=85)
print("\n")
recommend_universities("Fatima (Standard Profile)", student_moy=12.5, student_eng=70)
print("\n")
recommend_universities("Anouar (Borderline Profile)", student_moy=10.8, student_eng=60)
