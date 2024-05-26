import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Asset {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface AssetMapProps {
  assets: Asset[];
}

const AssetMap: React.FC<AssetMapProps> = ({ assets = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://demotiles.maplibre.org/style.json', // replace with your MapLibre style URL
        center: [101.9758, 4.2105], // Centered on Malaysia [lng, lat]
        zoom: 6, // Initial zoom level
      });

      // Add a GeoJSON source for Malaysia states
      mapRef.current.on('load', () => {
        mapRef.current?.addSource('states', {
          type: 'geojson',
          data: 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/malaysia/malaysia-states.json'
        });

        mapRef.current?.addLayer({
          id: 'state-boundaries',
          type: 'line',
          source: 'states',
          paint: {
            'line-color': '#FF0000',
            'line-width': 2,
          }
        });
      });
    }

    if (mapRef.current && assets.length > 0) {
      assets.forEach(asset => {
        const [lat, lng] = asset.coordinates; // Coordinates are in [lat, lng] format
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          console.log(`Valid coordinates for asset ${asset.id}: [${lng}, ${lat}]`);
          new maplibregl.Marker()
            .setLngLat([lng, lat])
            .setPopup(new maplibregl.Popup().setHTML(`
              <h3>ID: ${asset.id}</h3>
              <p>Name: ${asset.name}</p>
              <p>Coordinates: [${lng}, ${lat}]</p>
            `))
            .addTo(mapRef.current as maplibregl.Map);
        } else {
          console.error(`Invalid coordinates for asset ${asset.id}: [${lat}, ${lng}]`);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; // Clean up map reference
      }
    };
  }, [assets]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />;
};

export default AssetMap;
