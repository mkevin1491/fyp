import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Asset {
  id: string;
  functional_location: string;
  substation_name: string;
  coordinates: [number, number];
  tev_us_in_db: number | null;
  hotspot_delta_t_in_c: number | null;
  status: string; // Add status to the Asset interface
}

interface AssetMapProps {
  assets: Asset[];
}

const AssetMap: React.FC<AssetMapProps> = ({ assets = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const getMarkerColor = (status: string): string => {
    switch (status) {
      case "Critical":
        return "red";
      case "Major":
        return "orange";
      case "Minor":
        return "green";
      default:
        return "blue";
    }
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [101.9758, 4.2105],
        zoom: 6,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

      mapRef.current.on("load", () => {
        mapRef.current?.addSource("states", {
          type: "geojson",
          data: "/geoBoundaries-MYS-ADM1_simplified.geojson",
        });

        mapRef.current?.addLayer({
          id: "state-boundaries",
          type: "line",
          source: "states",
          paint: {
            "line-color": "#FF0000",
            "line-width": 2,
          },
        });

        mapRef.current?.addSource("districts", {
          type: "geojson",
          data: "/geoBoundaries-MYS-ADM1_simplified.geojson",
        });

        mapRef.current?.addLayer({
          id: "district-boundaries",
          type: "line",
          source: "districts",
          paint: {
            "line-color": "#0000FF",
            "line-width": 1,
          },
        });
      });
    }

    if (mapRef.current && assets.length > 0) {
      const markers = document.querySelectorAll(".mapboxgl-marker");
      markers.forEach((marker) => marker.remove());

      assets.forEach((asset) => {
        const [lat, lng] = asset.coordinates;
        const color = getMarkerColor(asset.status);

        console.log(
          `Adding marker for asset: ${asset.functional_location} with status: ${asset.status} and color: ${color}`
        );

        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          new maplibregl.Marker({ color })
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(`
                <h3>Functional Location: ${asset.functional_location}</h3>
                <p>Substation Name: ${asset.substation_name}</p>
                <p>Status: ${asset.status}</p>
                <p>Coordinates: [${lng}, ${lat}]</p>
              `)
            )
            .addTo(mapRef.current as maplibregl.Map);
        } else {
          console.error(
            `Invalid coordinates for asset ${asset.functional_location}: [${lat}, ${lng}]`
          );
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [assets]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "500px" }} />;
};

export default AssetMap;
