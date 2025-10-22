import { useState, useRef } from "react";
import ReminderForm from "./components/ReminderForm";
import MapView from "./components/MapView";
import Dashboard from "./pages/Dashboard";
import LocationTracker from "./components/LocationTracker";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const defaultLocation = [5.5905, -0.1657];
  const [reminders, setReminders] = useState([]);
  const [view, setView] = useState("map");
  const [mapCenter, setMapCenter] = useState(defaultLocation);
  const [searchMarker, setSearchMarker] = useState(defaultLocation);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Sound reference
  const audioRef = useRef(new Audio("/sounds/mixkit-melodical-flute-music-notification-2310.wav"));

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === "user" && password === "Qwerty") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

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
    } catch (err) {
      console.error("Error sending SMS:", err);
    }
  };

  // ✅ Play and stop sound with toast
  const handleReminderTriggered = (id) => {
    setReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, triggered: true } : r
      );
      const rem = updated.find((r) => r.id === id);
      if (rem) {
        const sound = audioRef.current;
        sound.currentTime = 0;
        sound.play();

        const toastId = toast.success(`🎯 Reminder triggered: ${rem.title}`, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#00bfff",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });

        // Stop sound after toast duration
        setTimeout(() => {
          sound.pause();
          sound.currentTime = 0;
        }, 4000);

        sendSmsNotification(rem);
      }
      return updated;
    });
  };

  const addReminder = (reminder) => {
    setReminders([...reminders, { ...reminder, triggered: false }]);
  };

  const deleteReminder = (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      setReminders(reminders.filter((r) => r.id !== id));
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

  if (!loggedIn) {
    return (
      <div className="login-screen">
        <div className="glass-card">
          <h1>🔐 Location Reminder Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Toaster />
      <div className="map-title-bar">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <h1>📍 Location Reminder App</h1>
        <div className="view-switch">
          <button
            onClick={() => setView("map")}
            className={view === "map" ? "active" : ""}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setView("dashboard")}
            className={view === "dashboard" ? "active" : ""}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      <div className="content">
        <div className={`sidebar glass-panel ${sidebarOpen ? "open" : ""}`}>
          <h2>Reminders</h2>
          <ReminderForm addReminder={handleReminderAdded} onLocationFound={handleLocationFound} />
        </div>

        <div className="map-area">
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
