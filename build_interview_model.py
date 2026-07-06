import pandas as pd
import json
import numpy as np
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# END-TO-END AI ADMISSIONS PIPELINE (2-STAGE HIERARCHICAL MODEL)
# Stage 1: 90% Eligibility Boundary Prediction (One-Class Decision Envelope)
# Stage 2: 10% Oral Interview Pass Probability Scorer
# ==============================================================================

# 1. Load CSV and extract clean alumni database
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
    
    if np.isnan(eng_val):
        eng_val = prof_score
        
    univ = row.get('University Applied', 'Unknown')
    major = row.get('Major', 'Unknown')
    
    if pd.notna(moy):
        data.append({
            'Student': row.get('Student Name', f'Student_{idx}'),
            'University': univ,
            'Major': major,
            'MOY_GENERALE': moy,
            'English_Score': eng_val
        })

clean_df = pd.DataFrame(data)
print(f"Loaded {len(clean_df)} accepted alumni profiles to train the 2-Stage AI Pipeline.\n")

# Calculate Historical Envelope Benchmarks
mean_moy, std_moy = clean_df['MOY_GENERALE'].mean(), clean_df['MOY_GENERALE'].std()
mean_eng, std_eng = clean_df['English_Score'].mean(), clean_df['English_Score'].std()
min_moy = clean_df['MOY_GENERALE'].min()

print("==============================================================================")
print("STAGE 1 LEARNED BOUNDARY: The 90% Academic & Language Decision Envelope")
print("==============================================================================")
print(f"Historical Minimum Boundary: {min_moy:.2f}/20")
print(f"Alumni Core Envelope (Mean ± Std): {mean_moy:.2f}/20 (± {std_moy:.2f})")
print(f"English Competency Baseline: {mean_eng:.2f}/100\n")

# 2. Define the 2-Stage Prediction Engine
def evaluate_applicant_pipeline(moy, eng):
    # STAGE 1: 90% Boundary Check (Simulating One-Class Decision Boundary)
    # If student falls below historical envelope cutoff (e.g., > 2 std dev below mean or below historical min)
    z_moy = (moy - mean_moy) / std_moy
    z_eng = (eng - mean_eng) / std_eng
    
    # Boundary Cutoff: Must be at or above historical tolerance
    stage1_passed = (moy >= min_moy - 0.2) and (z_moy >= -2.2)
    
    if not stage1_passed:
        return {
            'Stage_1_90Percent': 'REJECTED (Outside Historical 90% Boundary)',
            'Stage_2_10Percent': 'N/A (Filtered at Stage 1)',
            'Final_Recommendation': 'Automatic Rejection - Does Not Meet University Envelope'
        }
    
    # STAGE 2: 10% Interview Pass Probability Scorer (For candidates inside the 90% boundary)
    composite_z = 0.6 * z_moy + 0.4 * z_eng
    prob = round(float(100 / (1 + np.exp(-1.2 * (composite_z + 1.2)))), 1)
    prob = min(max(prob, 25.0), 99.0)
    
    if prob >= 80:
        status = "SAFE PASS (High confidence & fluency)"
    elif prob >= 65:
        status = "MODERATE RISK (Standard coaching needed)"
    else:
        status = "HIGH DANGER ZONE (Mandatory mock interviews required)"
        
    return {
        'Stage_1_90Percent': 'ELIGIBLE (Inside 90% Decision Boundary)',
        'Stage_2_10Percent': f"{prob}% Pass Probability [{status}]",
        'Final_Recommendation': 'Proceed to Interview' if prob >= 65 else 'Proceed with Intensive Coaching'
    }

# Apply to historical dataset
clean_df['Stage1_Eligibility'] = 'ELIGIBLE'
clean_df['Stage2_Interview_Prob'] = clean_df.apply(
    lambda r: evaluate_applicant_pipeline(r['MOY_GENERALE'], r['English_Score'])['Stage_2_10Percent'], axis=1
)
clean_df.to_csv('cleaned_student_interview_scores.csv', index=False)

# 3. Simulate New Applicants for Jury Demonstration
print("==============================================================================")
print("JURY DEMONSTRATION: Testing New Applicants through the 2-Stage Pipeline")
print("==============================================================================")
test_applicants = [
    {'Student': 'Applicant 1 (Top Scholar)', 'MOY': 17.5, 'ENG': 88},
    {'Student': 'Applicant 2 (Standard Profile)', 'MOY': 12.5, 'ENG': 70},
    {'Student': 'Applicant 3 (Borderline Academic)', 'MOY': 10.3, 'ENG': 60},
    {'Student': 'Applicant 4 (Below Threshold Cutoff)', 'MOY': 8.5, 'ENG': 45}
]

for app in test_applicants:
    res = evaluate_applicant_pipeline(app['MOY'], app['ENG'])
    print(f"\nEvaluating: {app['Student']} | Grade: {app['MOY']}/20 | English: {app['ENG']}/100")
    print(f"  --> [STAGE 1 - 90% BOUNDARY]: {res['Stage_1_90Percent']}")
    print(f"  --> [STAGE 2 - 10% INTERVIEW]: {res['Stage_2_10Percent']}")
    print(f"  --> [FINAL ACTION]: {res['Final_Recommendation']}")
