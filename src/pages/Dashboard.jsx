import React from "react";
import { Trash2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

function Dashboard({ reminders, deleteReminder }) {
  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      <h2>📊 Dashboard Page</h2>

      {reminders.length === 0 ? (
        <p>No reminders added yet.</p>
      ) : (
        <table className="reminder-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Radius (m)</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {reminders.map((rem) => {
              const lat = rem.location?.lat ?? rem.lat;
              const lng = rem.location?.lng ?? rem.lng;

              return (
                <tr key={rem.id}>
                  <td>{rem.title}</td>
                  <td>{lat?.toFixed(5)}</td>
                  <td>{lng?.toFixed(5)}</td>
                  <td>{rem.radius}</td>
                  <td
                    style={{
                      color: rem.triggered ? "green" : "orange",
                      fontWeight: "bold",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {rem.triggered ? "✅ Triggered" : "🕓 Pending"}
                  </td>

                  <td>
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#e74c3c",
                      }}
                      title="Delete reminder"
                    >
                      <Trash2 size={25} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
