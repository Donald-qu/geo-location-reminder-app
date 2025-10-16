import { useState } from "react";

function ReminderForm({ addReminder, onLocationFound }) {
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(false);

  const fetchCoordinates = async () => {
    if (!locationName.trim()) {
      alert("Please enter a location name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);

        if (isNaN(parsedLat) || isNaN(parsedLon)) {
          alert("❌ Invalid coordinates. Try another location.");
          return;
        }

        setLat(parsedLat);
        setLng(parsedLon);
        alert(`✅ Location found: ${display_name}`);

        if (onLocationFound) onLocationFound(parsedLat, parsedLon);
      } else {
        alert("❌ Location not found. Try again.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("⚠️ Error fetching location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a reminder title.");
      return;
    }
    if (!lat || !lng) {
      alert("Please search for a valid location first.");
      return;
    }

    addReminder({
      id: Date.now(),
      title,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius) || 100,
      triggered: false,
    });

    setTitle("");
    setLocationName("");
    setLat("");
    setLng("");
    setRadius(100);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Reminder title (e.g. Buy milk)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter location name (e.g. Accra Mall)"
        value={locationName}
        onChange={(e) => setLocationName(e.target.value)}
      />

      <button type="button" onClick={fetchCoordinates} disabled={loading}>
        {loading ? "Searching..." : "Find Location"}
      </button>

      <input
        type="number"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />

      <input
        type="number"
        placeholder="Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
      />

      <input
        type="number"
        placeholder="Radius (meters)"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
      />

      <button type="submit">Add Reminder</button>
    </form>
  );
}

export default ReminderForm;

