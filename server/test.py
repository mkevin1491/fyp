import pandas as pd

# Assuming "FY2023_QR03_KL11KV v2 (1).xlsx" is an Excel file
df = pd.read_excel(r"C:\Users\Kevin Loh\OneDrive - Universiti Tenaga Nasional\Desktop\FYP 2023-24\code_fyp\server\testfyp.xlsx", header=None)

# Set the second row as the column names
df.columns = df.iloc[1]

# Drop the first two rows (header and unnecessary row)
df = df.iloc[2:]
df.reset_index(drop=True, inplace=True)

# Select only the columns you need
selected_columns = [
    'Report Date ',
    'Defect From',
    'TEV/US In DB',
    'Hotspot ∆T In ⁰C',
    'Switchgear Type',
    'Switchgear Brand',
    'Functional Location',
    'Substation Name',
    'Defect Description 1',
    'Defect Description 2',
    'Defect Owner'
]

df = df[selected_columns]

# Convert 'Report Date ' to datetime
df['Report Date '] = pd.to_datetime(df['Report Date '])

# Convert 'TEV/US In DB' and 'Hotspot ∆T In ⁰C' to float (double)
df['TEV/US In DB'] = pd.to_numeric(df['TEV/US In DB'], errors='coerce')  # Coerce errors to NaN if conversion fails
df['Hotspot ∆T In ⁰C'] = pd.to_numeric(df['Hotspot ∆T In ⁰C'], errors='coerce')  # Coerce errors to NaN if conversion fails

print(df)
