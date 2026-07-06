import os
import shutil
import pandas as pd

def merge_younes_datasets():
    file_main = 'younes .csv'
    file_secondary = 'Younes2.csv'
    file_backup = 'younes_backup.csv'
    file_merged_output = 'younes_merged.csv'

    print("=== Starting Dataset Merge: 'younes .csv' + 'Younes2.csv' ===")

    # 1. Backup original main file
    if os.path.exists(file_main):
        shutil.copyfile(file_main, file_backup)
        print(f"[Backup] Created safety backup of '{file_main}' as '{file_backup}'")

    # 2. Read both datasets
    df1 = pd.read_csv(file_main)
    df2 = pd.read_csv(file_secondary)

    print(f"[Load] '{file_main}': {len(df1)} rows, {len(df1.columns)} columns")
    print(f"[Load] '{file_secondary}': {len(df2)} rows, {len(df2.columns)} columns")

    # 3. Define column mapping from Younes2.csv to younes .csv
    col_map = {
        'Student Name': 'Student Name',
        'change University': 'University Applied',
        'scholarship': 'Scholarship',
        'Degree': 'Degree',
        'Major': 'Major',
        'Transcript': 'Transcript 成绩单',
        'physical': 'physical 外国人体格检查表'
    }

    # 4. Prepare normalized matching key
    df1['_key'] = df1['Student Name'].astype(str).str.strip().str.lower()
    df2['_key'] = df2['Student Name'].astype(str).str.strip().str.lower()

    # Create mapping of normalized key to row indices in df1
    df1_key_to_indices = {}
    for idx, key in enumerate(df1['_key']):
        if key != 'nan' and key != '':
            if key not in df1_key_to_indices:
                df1_key_to_indices[key] = []
            df1_key_to_indices[key].append(idx)

    updated_count = 0
    added_rows = []

    # 5. Process records from Younes2.csv
    for idx, row2 in df2.iterrows():
        key = row2['_key']
        if key == 'nan' or not key:
            continue

        if key in df1_key_to_indices:
            # Student exists in df1 -> Update existing record(s)
            target_indices = df1_key_to_indices[key]
            record_updated = False
            for target_idx in target_indices:
                for col2, col1 in col_map.items():
                    val2 = row2.get(col2)
                    if pd.notna(val2) and str(val2).strip() != '':
                        df1.at[target_idx, col1] = val2
                        record_updated = True
            if record_updated:
                updated_count += 1
        else:
            # New student -> Add new record
            new_row = {col: None for col in df1.columns if col != '_key'}
            for col2, col1 in col_map.items():
                val2 = row2.get(col2)
                if pd.notna(val2):
                    new_row[col1] = val2
            added_rows.append(new_row)

    # 6. Combine updated df1 with newly added rows
    if added_rows:
        df_added = pd.DataFrame(added_rows)
        df_final = pd.concat([df1, df_added], ignore_index=True)
    else:
        df_final = df1.copy()

    # Clean up temporary key column
    if '_key' in df_final.columns:
        df_final.drop(columns=['_key'], inplace=True)

    print("\n--- Merge Statistics ---")
    print(f"Existing student records updated : {updated_count}")
    print(f"New student records added        : {len(added_rows)}")
    print(f"Total rows in merged dataset     : {len(df_final)}")

    # 7. Save merged dataset
    df_final.to_csv(file_main, index=False)
    df_final.to_csv(file_merged_output, index=False)

    print(f"\n[Success] Merged dataset saved to '{file_main}' (active file) and '{file_merged_output}' (copy).")

if __name__ == '__main__':
    merge_younes_datasets()
