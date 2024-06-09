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
      // Initialize the map with a detailed MapLibre style
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Detailed MapLibre style URL
        center: [101.9758, 4.2105], // Centered on Malaysia [lng, lat]
        zoom: 6, // Initial zoom level
      });

      // Add navigation control (the +/- zoom buttons)
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Load additional map layers once the map is loaded
      mapRef.current.on('load', () => {
        // Add a GeoJSON source for Malaysia states
        mapRef.current?.addSource('states', {
          type: 'geojson',
          data: '/geoBoundaries-MYS-ADM1_simplified.geojson', // Local file path
        });

        // Add a layer to display the state boundaries
        mapRef.current?.addLayer({
          id: 'state-boundaries',
          type: 'line',
          source: 'states',
          paint: {
            'line-color': '#FF0000', // Red color for state boundaries
            'line-width': 2, // Line width for state boundaries
          },
        });

        // Add a GeoJSON source for Malaysia districts
        mapRef.current?.addSource('districts', {
          type: 'geojson',
          data: '/geoBoundaries-MYS-ADM1_simplified.geojson', // Local file path (use the same file for simplicity)
        });

        // Add a layer to display the district boundaries
        mapRef.current?.addLayer({
          id: 'district-boundaries',
          type: 'line',
          source: 'districts',
          paint: {
            'line-color': '#0000FF', // Blue color for district boundaries
            'line-width': 1, // Line width for district boundaries
          },
        });
      });
    }

    if (mapRef.current && assets.length > 0) {
      // Clear existing markers
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach(marker => marker.remove());

      // Add markers for each asset
      assets.forEach(asset => {
        const [lat, lng] = asset.coordinates; // Coordinates are in [lat, lng] format
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          new maplibregl.Marker({ color: 'red' })
            .setLngLat([lng, lat])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
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

    // Cleanup function to remove the map when the component unmounts
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
