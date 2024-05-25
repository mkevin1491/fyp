import pandas as pd
import requests
import logging

logger = logging.getLogger(__name__)

MAPBOX_API_KEY = 'pk.eyJ1IjoibWtldmluMTQ5MSIsImEiOiJjbHdsd2l2MmEwNzAyMmlwczdnbXdpZjdyIn0.zxStZQKdpsmOT7kMG2M_MA'  # Replace with your actual Mapbox API key

def geocode_address(address, api_key):
    address = "Cendekiawan Apartment, Persiaran Cendekiawan, 43009 Kajang, Selangor"
    try:
        response = requests.get(
            f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json",
            params={"access_token": api_key}
        )
        response.raise_for_status()
        data = response.json()
        if data['features']:
            longitude, latitude = data['features'][0]['geometry']['coordinates']
            return latitude, longitude
        else:
            return None, None
    except Exception as e:
        logger.error(f"Error in geocoding address '{address}': {e}")
        return None, None

def preprocess_data(file_path):
    try:
        df = pd.read_excel(file_path, header=None)
        df.columns = df.iloc[1]
        df = df.iloc[2:]

        df['Report Date '] = pd.to_datetime(df['Report Date '], errors='coerce')
        df['TEV/US In DB'] = pd.to_numeric(df['TEV/US In DB'], errors='coerce')
        df['Hotspot ∆T In ⁰C'] = pd.to_numeric(df['Hotspot ∆T In ⁰C'], errors='coerce')

        
        # Assuming the address column is named 'Address'
        df['latitude'], df['longitude'] = zip(*df['Substation Name'].apply(lambda x: geocode_address(x, MAPBOX_API_KEY)))
        print(df)
    except Exception as e:
        logger.error(f"Error in preprocessing data: {e}")
        raise
    return df
