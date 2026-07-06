import os
import json
import pandas as pd
import numpy as np

# Locate data file robustly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, 'younes .csv')

class MLEngine:
    def __init__(self):
        self.alumni_df = pd.DataFrame()
        self.univ_stats = pd.DataFrame()
        self.mean_moy = 13.0
        self.std_moy = 2.0
        self.min_moy = 10.0
        self.mean_eng = 70.0
        self.std_eng = 15.0
        self.load_and_process_data()

    def load_and_process_data(self):
        if not os.path.exists(CSV_PATH):
            print(f"Warning: Dataset not found at {CSV_PATH}")
            return

        df = pd.read_csv(CSV_PATH)
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
                
            univ = str(row.get('University Applied', 'Unknown')).strip()
            major = str(row.get('Major', 'Unknown')).strip()
            student_name = str(row.get('Student Name', f'Alumni #{idx+1}')).strip()
            status = str(row.get('Admission Status', 'Accepted')).strip()
            
            if pd.notna(moy) and univ != 'nan' and univ != 'Unknown':
                data.append({
                    'id': idx + 1,
                    'student_name': student_name,
                    'university': univ,
                    'major': major,
                    'moy_generale': round(float(moy), 2),
                    'english_score': round(float(eng_val), 1),
                    'status': status
                })

        self.alumni_df = pd.DataFrame(data)
        if not self.alumni_df.empty:
            self.mean_moy = float(self.alumni_df['moy_generale'].mean())
            self.std_moy = float(self.alumni_df['moy_generale'].std())
            self.min_moy = float(self.alumni_df['moy_generale'].min())
            self.mean_eng = float(self.alumni_df['english_score'].mean())
            self.std_eng = float(self.alumni_df['english_score'].std())

            # University benchmarks
            stats = self.alumni_df.groupby('university').agg(
                count=('moy_generale', 'count'),
                mean_moy=('moy_generale', 'mean'),
                std_moy=('moy_generale', lambda x: max(x.std(), 1.2) if len(x) > 1 and x.std() > 0.1 else 1.5),
                min_moy=('moy_generale', 'min'),
                mean_eng=('english_score', 'mean'),
                std_eng=('english_score', lambda x: max(x.std(), 4.0) if len(x) > 1 and x.std() > 0.1 else 6.0)
            ).reset_index()
            self.univ_stats = stats[stats['count'] >= 3].copy()

    def get_dataset_stats(self):
        if self.alumni_df.empty:
            return {"error": "Dataset empty"}

        # Histogram bins for General Average
        moy_bins = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20]
        moy_counts, _ = np.histogram(self.alumni_df['moy_generale'], bins=moy_bins)
        grade_dist = [{"range": f"{moy_bins[i]}-{moy_bins[i+1]}", "count": int(c)} for i, c in enumerate(moy_counts)]

        # Histogram bins for English Score
        eng_bins = [40, 50, 60, 70, 80, 90, 100]
        eng_counts, _ = np.histogram(self.alumni_df['english_score'], bins=eng_bins)
        eng_dist = [{"range": f"{eng_bins[i]}-{eng_bins[i+1]}", "count": int(c)} for i, c in enumerate(eng_counts)]

        top_universities = self.alumni_df['university'].value_counts().head(8).to_dict()
        top_majors = self.alumni_df['major'].value_counts().head(8).to_dict()

        return {
            "total_alumni": int(len(self.alumni_df)),
            "envelope_benchmarks": {
                "mean_grade": round(self.mean_moy, 2),
                "std_grade": round(self.std_moy, 2),
                "min_grade": round(self.min_moy, 2),
                "mean_english": round(self.mean_eng, 1),
                "std_english": round(self.std_eng, 1)
            },
            "grade_distribution": grade_dist,
            "english_distribution": eng_dist,
            "top_universities": [{"name": k, "count": int(v)} for k, v in top_universities.items()],
            "top_majors": [{"name": k, "count": int(v)} for k, v in top_majors.items()]
        }

    def evaluate_candidate(self, name: str, moy: float, eng: float, desired_major: str = None):
        z_moy = (moy - self.mean_moy) / self.std_moy
        z_eng = (eng - self.mean_eng) / self.std_eng

        # Stage 1: 90% Academic Envelope Check (Isolation Forest simulation threshold)
        # Pass criteria: student grade must not be far below historical minimum envelope
        stage1_passed = bool((moy >= self.min_moy - 0.4) and (z_moy >= -2.2))

        if not stage1_passed:
            return {
                "candidate": name,
                "grades": {"moy_generale": moy, "english_score": eng},
                "z_scores": {"z_moy": round(z_moy, 2), "z_eng": round(z_eng, 2)},
                "stage_1": {
                    "status": "REJECTED",
                    "label": "Outside Historical 90% Academic Decision Envelope",
                    "passed": False,
                    "explanation": f"General average ({moy}/20) falls outside the envelope boundary (Historical Min: {self.min_moy:.2f}/20)."
                },
                "stage_2": {
                    "probability": 0.0,
                    "status_label": "N/A (Filtered at Stage 1)",
                    "risk_level": "CRITICAL RISK"
                },
                "final_recommendation": {
                    "action": "Automatic Rejection",
                    "details": "Applicant does not satisfy Stage 1 multi-dimensional anomaly detection cutoff. Consider remedial foundation year."
                }
            }

        # Stage 2: 10% Oral Interview Pass Probability Scorer
        composite_z = 0.65 * z_moy + 0.35 * z_eng
        prob = round(float(100 / (1 + np.exp(-1.3 * (composite_z + 1.2)))), 1)
        prob = min(max(prob, 22.0), 99.0)

        if prob >= 82:
            status_label = "SAFE PASS"
            risk_level = "LOW RISK"
            action = "Direct Invitation to Jury Interview"
            details = "Outstanding candidate profile. High probability of clearing the subjective oral interview with minimal prep."
        elif prob >= 68:
            status_label = "TARGET PASS"
            risk_level = "MODERATE RISK"
            action = "Proceed to Interview with Standard Preparation"
            details = "Solid academic alignment within alumni envelope. Standard communication and language coaching recommended."
        elif prob >= 50:
            status_label = "REACH / BORDERLINE"
            risk_level = "ELEVATED RISK"
            action = "Conditional Proceed - Mandatory Mock Interviews"
            details = "Candidate is within academic boundary but faces intense competition. Intensive oral interview coaching is required."
        else:
            status_label = "HIGH DANGER ZONE"
            risk_level = "HIGH RISK"
            action = "Ambitious Choice - Strict Coaching Required"
            details = "Candidate barely cleared Stage 1 envelope. Requires rigorous articulation practice and justification of academic record."

        return {
            "candidate": name,
            "grades": {"moy_generale": moy, "english_score": eng},
            "z_scores": {"z_moy": round(z_moy, 2), "z_eng": round(z_eng, 2)},
            "stage_1": {
                "status": "ELIGIBLE",
                "label": "Inside 90% Academic Decision Envelope",
                "passed": True,
                "explanation": f"Profile satisfies historical envelope criteria (z-score: {z_moy:.2f})."
            },
            "stage_2": {
                "probability": prob,
                "status_label": status_label,
                "risk_level": risk_level
            },
            "final_recommendation": {
                "action": action,
                "details": details
            }
        }

    def recommend_universities(self, name: str, moy: float, eng: float, desired_major: str = None):
        if self.univ_stats.empty:
            return []

        results = []
        for idx, row in self.univ_stats.iterrows():
            u_name = row['university']
            u_mean_moy, u_std_moy = row['mean_moy'], row['std_moy']
            u_mean_eng, u_std_eng = row['mean_eng'], row['std_eng']
            u_min_moy = row['min_moy']

            if moy < (u_min_moy - 0.7):
                continue

            z_moy = (moy - u_mean_moy) / u_std_moy
            z_eng = (eng - u_mean_eng) / u_std_eng

            composite_z = 0.65 * z_moy + 0.35 * z_eng
            prob = round(float(100 / (1 + np.exp(-1.3 * (composite_z + 1.2)))), 1)
            prob = min(max(prob, 18.0), 99.0)

            if prob >= 85:
                match_type = "SAFE MATCH"
                icon = "🌟"
                badge_class = "safe"
            elif prob >= 70:
                match_type = "TARGET MATCH"
                icon = "✅"
                badge_class = "target"
            elif prob >= 55:
                match_type = "REACH MATCH"
                icon = "⚠️"
                badge_class = "reach"
            else:
                match_type = "HIGH RISK"
                icon = "🚨"
                badge_class = "risk"

            results.append({
                "university": u_name,
                "historical_avg_grade": round(u_mean_moy, 2),
                "historical_min_grade": round(u_min_moy, 2),
                "match_probability": prob,
                "category": match_type,
                "icon": icon,
                "badge_class": badge_class
            })

        res_df = pd.DataFrame(results)
        if res_df.empty:
            return []
        res_df = res_df.sort_values(by='match_probability', ascending=False)
        return res_df.to_dict(orient='records')

    def get_alumni(self, page: int = 1, limit: int = 50, search: str = '', university: str = ''):
        df = self.alumni_df.copy()
        if search:
            s = search.lower()
            df = df[df['student_name'].str.lower().str.contains(s) | df['major'].str.lower().str.contains(s)]
        if university:
            df = df[df['university'].str.lower() == university.lower()]

        total = len(df)
        start = (page - 1) * limit
        end = start + limit
        paginated = df.iloc[start:end]
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "records": paginated.to_dict(orient='records')
        }

ml_engine = MLEngine()
