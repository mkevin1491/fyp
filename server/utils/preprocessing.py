import pandas as pd
import logging

logger = logging.getLogger(__name__)

def preprocess_data(file_path):
    try:
        df = pd.read_excel(file_path, header=None)
        df.columns = df.iloc[1]
        df = df.iloc[2:]
        
        df['Report Date '] = pd.to_datetime(df['Report Date '], errors='coerce')
        df['TEV/US In DB'] = pd.to_numeric(df['TEV/US In DB'], errors='coerce')
        df['Hotspot ∆T In ⁰C'] = pd.to_numeric(df['Hotspot ∆T In ⁰C'], errors='coerce')
    except Exception as e:
        logger.error(f"Error in preprocessing data: {e}")
        raise
    return df
