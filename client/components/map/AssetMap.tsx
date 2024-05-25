import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Asset {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface AssetMapProps {
  assets: Asset[];
}

const UpdateMapBounds: React.FC<{ assets: Asset[] }> = ({ assets }) => {
  const map = useMap();

  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(assets.map(asset => asset.coordinates));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [assets, map]);

  return null;
};

const AssetMap: React.FC<AssetMapProps> = ({ assets }) => {
  // Define the custom icon using an image URL
  const customIcon = L.icon({
    iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png', // Replace with your image URL
    iconSize: [25, 41], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41], // size of the shadow
  });

  return (
    <MapContainer center={[0, 20]} zoom={2} style={{ width: '100%', height: '500px' }} className='story-map'>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {assets.map(asset => (
        <Marker key={asset.id} position={asset.coordinates} icon={customIcon}>
          <Popup>
            ID: {asset.id}<br />
            Name: {asset.name}<br />
            Coordinates: [{asset.coordinates[0]}, {asset.coordinates[1]}]
          </Popup>
        </Marker>
      ))}
      <UpdateMapBounds assets={assets} />
    </MapContainer>
  );
};

export default AssetMap;
