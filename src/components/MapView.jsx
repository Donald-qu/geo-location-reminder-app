import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

function UpdateMapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

function MapView({ reminders, mapCenter, searchMarker }) {
  const [center, setCenter] = useState(mapCenter || [5.5905, -0.1657]);
  const [userPosition, setUserPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // 🔹 Track live user location (desktop + mobile friendly)
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null); // reset any previous error
        },
        (err) => {
          console.warn("⚠️ Location access denied or failed:", err);
          setLocationError("⚠️ Location access denied. Enable GPS or allow location in your browser settings.");
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationError("❌ Your browser does not support geolocation.");
    }
  }, []);

  useEffect(() => {
    if (mapCenter && Array.isArray(mapCenter)) {
      setCenter(mapCenter);
    }
  }, [mapCenter]);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: "100%", height: "100%", position: "relative" }}
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <UpdateMapCenter position={mapCenter || userPosition || center} />

      {/* 🧍 User Marker */}
      {userPosition ? (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>🧍‍♂️ You are here</Popup>
        </Marker>
      ) : (
        locationError && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,0,0,0.85)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              zIndex: 9999,
              fontSize: "0.9rem",
            }}
          >
            {locationError}
          </div>
        )
      )}

      {/* 📍 Search Marker */}
      {searchMarker && (
        <Marker position={searchMarker} icon={defaultIcon}>
          <Popup>
            {searchMarker[0].toFixed(4)}, {searchMarker[1].toFixed(4)}
          </Popup>
        </Marker>
      )}

      {/* 🔴 Reminder markers */}
      {reminders.map((rem, i) => (
        <Marker key={i} position={[rem.lat, rem.lng]} icon={defaultIcon}>
          <Popup>
            <strong>{rem.title}</strong>
            <br />
            Lat: {rem.lat?.toFixed(4)} | Lng: {rem.lng?.toFixed(4)} <br />
            Radius: {rem.radius}m
          </Popup>
          <Circle
            center={[rem.lat, rem.lng]}
            radius={rem.radius}
            pathOptions={{ color: "red", fillColor: "pink", fillOpacity: 0.25 }}
          />
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
