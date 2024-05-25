import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibWtldmluMTQ5MSIsImEiOiJjbHdsd2l2MmEwNzAyMmlwczdnbXdpZjdyIn0.zxStZQKdpsmOT7kMG2M_MA';

interface Asset {
  id: number;
  name: string;
  criticality: string;
  coordinates: [number, number];
}

interface AssetMapProps {
  assets: Asset[];
}

const AssetMap: React.FC<AssetMapProps> = ({ assets }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 20],
        zoom: 2,
      });

      const bounds = new mapboxgl.LngLatBounds();

      assets.forEach((asset) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `${asset.name}\nCriticality: ${asset.criticality}`
        );

        const marker = new mapboxgl.Marker()
          .setLngLat(asset.coordinates)
          .setPopup(popup)
          .addTo(map);

        bounds.extend(asset.coordinates);
      });

      if (assets.length > 0) {
        map.fitBounds(bounds, {
          padding: 20,
        });
      }

      return () => map.remove();
    }
  }, [assets]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} className='story-map'/>;
};

export default AssetMap;
