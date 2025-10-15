App.jsx
import { useState } from "react";
import ReminderForm from "./components/ReminderForm";
import MapView from "./components/MapView";
import Dashboard from "./pages/Dashboard";
import LocationTracker from "./components/LocationTracker";
import { Toaster, toast } from "react-hot-toast"; // ✅ toast import

function App() {
  const defaultLocation = [5.5905, -0.1657]; // Default: Burma Camp
  const [reminders, setReminders] = useState([]);
  const [view, setView] = useState("map");
  const [mapCenter, setMapCenter] = useState(defaultLocation);
  const [searchMarker, setSearchMarker] = useState(defaultLocation);

  // --- LOGIN STATE ---
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    const defaultUser = "user";
    const defaultPass = "Qwerty";

    if (username.toLowerCase() === defaultUser.toLowerCase() && password === defaultPass) {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  // --- Function to send SMS via backend ---
  const sendSmsNotification = async (reminder) => {
    try {
      await fetch("http://localhost:5000/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "+2330595492789",
          body: `Reminder: ${reminder.title} at (${reminder.lat}, ${reminder.lng})`,
        }),
      });
      console.log("SMS sent successfully!");
    } catch (err) {
      console.error("Error sending SMS:", err);
    }
  };

  // --- ✅ Handle reminder triggered instantly ---
  const handleReminderTriggered = (id) => {
    setReminders((prevReminders) => {
      const updatedReminders = prevReminders.map((r) =>
        r.id === id ? { ...r, triggered: true } : r
      );

      const triggeredReminder = updatedReminders.find((r) => r.id === id);
      if (triggeredReminder) {
        toast.success(`🎯 Reminder triggered: ${triggeredReminder.title}`, {
          duration: 4000,
          position: "top-center", // ✅ centered popup
          style: {
            background: "#00bfff",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });

        sendSmsNotification(triggeredReminder);
      }

      return updatedReminders;
    });
  };

  const addReminder = (reminder) => {
    setReminders([...reminders, { ...reminder, triggered: false }]);
  };

  const deleteReminder = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reminder?");
    if (confirmDelete) {
      setReminders(reminders.filter((rem) => rem.id !== id));
    }
  };

  const handleLocationFound = (lat, lng) => {
    const newCenter = [parseFloat(lat), parseFloat(lng)];
    setMapCenter(newCenter);
    setSearchMarker(newCenter);
  };

  const handleReminderAdded = (reminder) => {
    addReminder(reminder);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(userLoc);
          setSearchMarker(userLoc);
        },
        () => {
          setMapCenter(defaultLocation);
          setSearchMarker(defaultLocation);
        }
      );
    } else {
      setMapCenter(defaultLocation);
      setSearchMarker(defaultLocation);
    }
  };

  // --- LOGIN SCREEN ---
  if (!loggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          background: "#f0f0f0",
        }}
      >
        <h1 style={{ color: "#00aaff", marginBottom: "20px" }}>
          Welcome to the Location Reminder App
        </h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "12px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "12px" }}
          />
          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#00aaff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: "10px",
            background: "#00bfff",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
          },
        }}
      />

      <div
        className="map-title-bar"
        style={{
          width: "100%",
          padding: "10px 20px",
          color: "white",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0, textAlign: "center" }}>📍 Location Reminder App</h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setView("map")}
            style={{
              padding: "8px 15px",
              borderRadius: "6px",
              border: "none",
              background: view === "map" ? "#00aaff" : "#444",
              color: "white",
              cursor: "pointer",
            }}
          >
            🗺️ Map View
          </button>

          <button
            onClick={() => setView("dashboard")}
            style={{
              padding: "8px 15px",
              borderRadius: "6px",
              border: "none",
              background: view === "dashboard" ? "#00aaff" : "#444",
              color: "white",
              cursor: "pointer",
            }}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexGrow: 1, flexWrap: "wrap" }}>
        <div
          className="sidebar"
          style={{
            width: "300px",
            minWidth: "250px",
            background: "hsl(196, 94%, 67%)",
            padding: "15px",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <h2>Reminders</h2>
          <ReminderForm addReminder={handleReminderAdded} onLocationFound={handleLocationFound} />
        </div>

        <div className="map-area" style={{ flexGrow: 1, minWidth: "300px", height: "100%" }}>
          {view === "map" ? (
            <MapView reminders={reminders} mapCenter={mapCenter} searchMarker={searchMarker} />
          ) : (
            <Dashboard reminders={reminders} deleteReminder={deleteReminder} />
          )}
        </div>
      </div>

      <LocationTracker reminders={reminders} onReminderTriggered={handleReminderTriggered} />
    </div>
  );
}

export default App;

