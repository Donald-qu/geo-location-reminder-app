function ReminderList({ reminders, deleteReminder }) {
    return (
      <div>
        <h2>Reminders</h2>
        <ul>
          {reminders.map((rem) => (
            <li
              key={rem.id}
              style={{
                textDecoration: rem.triggered ? "line-through" : "none",
                color: rem.triggered ? "gray" : "black",
                marginBottom: "5px",
              }}
            >
              {rem.title} (
              Lat: {rem.location.lat}, Lng: {rem.location.lng}, Radius: {rem.radius}m
              )
              {deleteReminder && (
                <button
                  onClick={() => deleteReminder(rem.id)}
                  style={{ marginLeft: "10px" }}
                >
                  ❌
                </button>
              )}
              {rem.triggered && <span style={{ marginLeft: "5px" }}>✅ Triggered</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default ReminderList;
  