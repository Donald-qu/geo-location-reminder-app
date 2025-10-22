import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

const { BaseLayer } = LayersControl;

// Default map icons
const defaultIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
});

// Component to fly map to a new position
function UpdateMapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

// Routing between user and last reminder
function RoutingMachine({ userPosition, reminderPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !reminderPosition) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(reminderPosition[0], reminderPosition[1]),
      ],
      lineOptions: {
        styles: [{ color: "#0077b6", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: true,           // This shows instructions and popups
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [userPosition, reminderPosition, map]);

  return null;
}

function MapView({ reminders, mapCenter }) {
  const [center, setCenter] = useState(mapCenter || [5.5905, -0.1657]);
  const [userPosition, setUserPosition] = useState(null);
  const [defaultMarkerPosition, setDefaultMarkerPosition] = useState(center);
  const [locationError, setLocationError] = useState(null);

  // Track user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null);
        },
        (err) => {
          console.warn("⚠️ Location access denied or failed:", err);
          setLocationError(
            "⚠️ Location access denied. Enable GPS or allow location in your browser settings."
          );
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationError("❌ Your browser does not support geolocation.");
    }
  }, []);

  // Update default marker when mapCenter changes
  useEffect(() => {
    if (mapCenter && Array.isArray(mapCenter)) {
      setDefaultMarkerPosition(mapCenter);
      setCenter(mapCenter);
    }
  }, [mapCenter]);

  // Fly to last reminder if available
  useEffect(() => {
    if (reminders.length > 0) {
      const lastReminder = reminders[reminders.length - 1];
      setDefaultMarkerPosition([lastReminder.lat, lastReminder.lng]);
    }
  }, [reminders]);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: "100%", height: "100%", position: "relative" }}
      className="map-container"
      whenCreated={(map) => {
        // Add click listener to map to move default marker
        map.on("click", function (e) {
          const { lat, lng } = e.latlng;
          setDefaultMarkerPosition([lat, lng]);
        });
      }}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="Street Map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        </BaseLayer>
        <BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye"
          />
        </BaseLayer>
        <BaseLayer name="Terrain">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenTopoMap contributors"
          />
        </BaseLayer>
        <BaseLayer name="Hybrid">
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution="&copy; Google Maps"
          />
        </BaseLayer>
      </LayersControl>

      <UpdateMapCenter position={defaultMarkerPosition || userPosition || center} />

      {/* Current user location */}
      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>🧍‍♂️ You are here</Popup>
        </Marker>
      )}

      {/* Default/movable marker */}
      <Marker position={defaultMarkerPosition} icon={defaultIcon}>
        <Popup>
          {defaultMarkerPosition[0].toFixed(4)}, {defaultMarkerPosition[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Circles for reminders */}
      {reminders.map((rem, i) => (
        <Circle
          key={i}
          center={[rem.lat, rem.lng]}
          radius={rem.radius}
          pathOptions={{ color: "red", fillColor: "pink", fillOpacity: 0.25 }}
        />
      ))}

      <RoutingMachine
        userPosition={userPosition}
        reminderPosition={
          reminders.length > 0
            ? [reminders[reminders.length - 1].lat, reminders[reminders.length - 1].lng]
            : null
        }
      />
    </MapContainer>
  );
}

export default MapView;
