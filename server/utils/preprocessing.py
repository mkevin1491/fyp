import pandas as pd
import requests
import logging

logger = logging.getLogger(__name__)

MAPBOX_API_KEY = 'pk.eyJ1IjoibWtldmluMTQ5MSIsImEiOiJjbHdsd2l2MmEwNzAyMmlwczdnbXdpZjdyIn0.zxStZQKdpsmOT7kMG2M_MA'  # Replace with your actual Mapbox API key

# Define a mapping of functional location prefixes to cities
LOCATION_MAPPING = {
    "WKL": "Kuala Lumpur",
    "JB": "Johor Bahru",
    # Add other mappings as needed
}

def geocode_address(address, city=None, api_key=None):
    try:
        query = address
        if city:
            query = f"{address}, {city}, Malaysia"
        else:
            query = f"{address}, Malaysia"

        # logger.debug(f"Geocoding query: {query}")
        
        response = requests.get(
            f"https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json",
            params={"access_token": api_key}
        )
        response.raise_for_status()
        data = response.json()
        
        # logger.debug(f"Geocoding result for '{query}': {data}")
        
        if data['features']:
            longitude, latitude = data['features'][0]['geometry']['coordinates']
            return latitude, longitude
        else:
            logger.warning(f"No geocoding results for address '{query}'.")
            return None, None

    except Exception as e:
        logger.error(f"Error in geocoding address '{query}': {e}")
        return None, None

def get_city_from_functional_location(functional_location):
    if isinstance(functional_location, str):
        for prefix, city in LOCATION_MAPPING.items():
            if functional_location.startswith(prefix):
                return city
    return None

def preprocess_data(file_path):
    try:
        df = pd.read_excel(file_path, header=None)
        df.columns = df.iloc[1]
        df = df.iloc[2:]

        df['Report Date '] = pd.to_datetime(df['Report Date '], errors='coerce')
        df['TEV/US In DB'] = pd.to_numeric(df['TEV/US In DB'], errors='coerce')
        df['Hotspot ∆T In ⁰C'] = pd.to_numeric(df['Hotspot ∆T In ⁰C'], errors='coerce')

        # Geocode addresses and add latitude and longitude
        def geocode_with_context(row):
            substation_name = row['Substation Name']
            functional_location = str(row['Functional Location'])  # Ensure it is treated as a string
            city = get_city_from_functional_location(functional_location)
            return geocode_address(substation_name, city, MAPBOX_API_KEY)
        
        df['latitude'], df['longitude'] = zip(*df.apply(geocode_with_context, axis=1))
        print(df)
    except Exception as e:
        logger.error(f"Error in preprocessing data: {e}")
        raise
    return df

# Set logging level to DEBUG to see detailed logs
# logging.basicConfig(level=logging.DEBUG)
