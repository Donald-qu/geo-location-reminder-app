import { useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";

function LocationTracker({ reminders, onReminderTriggered }) {
  const remindersRef = useRef(reminders);
  const triggeredIdsRef = useRef(new Set());

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    // ✅ Function reused by both getCurrentPosition & watchPosition
    const checkReminders = (userLat, userLng) => {
      remindersRef.current.forEach((reminder) => {
        const alreadyTriggered =
          reminder.triggered || triggeredIdsRef.current.has(reminder.id);

        if (!alreadyTriggered) {
          const distance = getDistance(userLat, userLng, reminder.lat, reminder.lng);
          const radius = Number(reminder.radius);

          if (distance <= radius) {
            triggeredIdsRef.current.add(reminder.id);
            onReminderTriggered(reminder.id);
          }
        }
      });
    };

    // ✅ Immediate position check (runs once right away)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        checkReminders(latitude, longitude);
      },
      (err) => console.error("Initial geolocation error:", err),
      { enableHighAccuracy: true }
    );

    // ✅ Continuous tracking (fires as you move)
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        checkReminders(latitude, longitude);
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      if (navigator.geolocation && watcher) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [onReminderTriggered]);

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return <Toaster />;
}

export default LocationTracker;

