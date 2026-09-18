import "./App.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

import { useEffect, useState } from "react";
import {
  MapContainer,
TileLayer,
Marker,
Popup,
Circle,
CircleMarker,
useMap
} from "react-leaflet";

function MapResize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}
function LocationCenter({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 10);
    }
  }, [userLocation, map]);

  return null;
}
function getWindDirection(degrees) {
  const directions = [
    "N", "NE", "E", "SE",
    "S", "SW", "W", "NW"
  ];

  const index = Math.round(degrees / 45) % 8;

  return directions[index];
}
const shelters = [
  {
    name: "Community Relief Center",
    latitude: 16.52,
    longitude: 80.62
  },
  {
    name: "Emergency Safe Shelter",
    latitude: 16.55,
    longitude: 80.65
  }
];
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Detecting...");
  const [weather, setWeather] = useState(null);
  const [countdown, setCountdown] = useState("08:42:15");
  const [cyclone, setCyclone] = useState({
  name: "Demo Cyclone",
  latitude: 16.5,
  longitude: 80.6,
  status: "Monitoring"
});
useEffect(() => {
  fetch("http://localhost:5000/api/cyclone")
    .then((response) => response.json())
    .then((data) => {
      setCyclone(data);
    })
    .catch((error) => {
      console.log("Cyclone data could not be loaded:", error);
    });
}, []);
  useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((previous) => {
      const [hours, minutes, seconds] = previous.split(":").map(Number);

      let totalSeconds =
        hours * 3600 + minutes * 60 + seconds;

      if (totalSeconds <= 0) {
        clearInterval(timer);
        return "00:00:00";
      }

      totalSeconds--;

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);
  const getNearestShelter = () => {
  if (!userLocation) {
    return null;
  }
  

  let nearestShelter = shelters[0];
  let shortestDistance = calculateDistance(
    userLocation[0],
    userLocation[1],
    shelters[0].latitude,
    shelters[0].longitude
  );
  

  shelters.forEach((shelter) => {
    const distance = calculateDistance(
      userLocation[0],
      userLocation[1],
      shelter.latitude,
      shelter.longitude
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestShelter = shelter;
    }
  });
  

  return {
    ...nearestShelter,
    distance: shortestDistance
  };
};
const getSafeRoute = () => {
  const shelter = getNearestShelter();

  if (!userLocation || !shelter) {
    alert("Please detect your location first.");
    return;
  }

  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${shelter.latitude},${shelter.longitude}`;

  window.open(url, "_blank");
};
 const getThreatLevel = () => {
  if (!cyclone || !userLocation) return "UNKNOWN";

  const distance = calculateDistance(
    userLocation[0],
    userLocation[1],
    cyclone.latitude,
    cyclone.longitude
  );

  if (distance <= 50) {
    return "HIGH";
  } else if (distance <= 150) {
    return "MEDIUM";
  } else {
    return "LOW";
  }
};

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Not supported");
      return;
    }

    setLocationStatus("Getting location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation([latitude, longitude]);
        setLocationStatus("Location detected");
        fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`
)
  .then((response) => response.json())
  .then((data) => {
    setWeather(data.current);
  })
  .catch(() => {
    console.log("Weather data could not be loaded");
  });
      },
      () => {
        setLocationStatus("Permission denied");
      }
    );
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="logo">
          🌪️ Cyclone Tracker
        </div>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Live Map</a>
          <a href="#">Alerts</a>
          <a href="#">Safety</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">

        <section className="welcome">
          <h1>Cyclone Monitoring Dashboard</h1>
          <p>Real-time cyclone tracking and safety information</p>
        </section>

        {/* Status */}
        <section className="status-card">
          <div>
            <h2>🌀 Cyclone Status</h2>
            <h2>Active Cyclone: {cyclone.name}</h2>
            <p>Current Status: Monitoring</p>
          </div>

          <div className="threat">
  <span>Threat Level</span>

  <div className="threat-levels">
    <span className={getThreatLevel() === "LOW" ? "active" : ""}>
      LOW
    </span>

    <span className={getThreatLevel() === "MEDIUM" ? "active" : ""}>
      MEDIUM
    </span>

    <span className={getThreatLevel() === "HIGH" ? "active" : ""}>
      HIGH
    </span>
  </div>

  <strong>Current: {getThreatLevel()}</strong>
</div>
        </section>

        {/* Information Cards */}
        <section className="cards">

          <div className="card">
  <div className="icon">🌡️</div>
  <h3>Temperature</h3>

  <p className="value">
    {weather ? `${weather.temperature_2m}°C` : "--"}
  </p>

  <p>
    Humidity: {weather ? `${weather.relative_humidity_2m}%` : "--"}
  </p>
</div>

          <div className="card">
  <div className="icon">💨</div>
  <h3>Wind Speed</h3>

  <p className="value">
    {weather ? `${weather.wind_speed_10m} km/h` : "--"}
  </p>

  <p>
    Direction: {weather ? getWindDirection(weather.wind_direction_10m) : "--"}
  </p>
  <p>
  Cyclone Wind: {cyclone.windSpeed} km/h
</p>
</div>

          <div className="card">
            <div className="icon">⏱️</div>
            <h3>Landfall Countdown</h3>
            <p className="value">{countdown}</p>
            <p>Estimated time</p>
          </div>

          <div className="card">
  <div className="icon">📍</div>
  <h3>Your Location</h3>
  <p className="value">{locationStatus}</p>

  <button className="location-button" onClick={getUserLocation}>
    📍 Use My Location
  </button>
</div>

        </section>

        <section className="map-section">
  <h2>🗺️ Cyclone Live Map</h2>

  <MapContainer
    center={[cyclone.latitude, cyclone.longitude]}
    zoom={7}
    className="cyclone-map"
  >
    <LocationCenter userLocation={userLocation} />
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Marker position={[cyclone.latitude, cyclone.longitude]}>
  <Popup>
    🌀 {cyclone.name}
    <br />
    Status: {cyclone.status}
  </Popup>
</Marker>
    {userLocation && (
  <CircleMarker
    center={userLocation}
    radius={10}
    pathOptions={{
      color: "red",
      fillColor: "red",
      fillOpacity: 1
    }}
  >
    <Popup>
      📍 Your Device Location
    </Popup>
  </CircleMarker>
)}
{userLocation && getNearestShelter() && (
  <Marker
    position={[
      getNearestShelter().latitude,
      getNearestShelter().longitude
    ]}
  >
    <Popup>
      🏠 {getNearestShelter().name}
      <br />
      Safe Shelter
    </Popup>
  </Marker>
)}

    <Circle
  center={[cyclone.latitude, cyclone.longitude]}
  radius={50000}
  pathOptions={{
    fillOpacity: 0.2
  }}
/>
  </MapContainer>
</section>

        {/* Alerts */}
        <section className="alerts">
          <h2>🚨 Latest Alerts</h2>

          <div className="alert">
  ⚠️ Current Threat Level: {getThreatLevel()}
</div>

          <div className="alert">
            ⚠️ Monitor official weather updates
          </div>
        </section>
        {/* Evacuation & Relocation */}
<section className="relocation">
  <h2>🏠 Evacuation & Relocation</h2>

  <div className="relocation-card">
    <h3>Current Threat: {getThreatLevel()}</h3>

    {getThreatLevel() === "EXTREME" || getThreatLevel() === "HIGH" ? (
  <>
    <p>🚨 Evacuation may be required.</p>
    <p>🏠 Move to a designated safe shelter and follow official instructions.</p>
  </>
) : (
  <>
    <p>✅ No immediate evacuation indicated by this demo rule.</p>
    <p>📢 Continue monitoring official weather alerts.</p>
  </>
)}

<p>
  🏠 Nearest Safe Shelter:{" "}
  {getNearestShelter()
    ? `${getNearestShelter().name} (${getNearestShelter().distance.toFixed(2)} km)`
    : "Detecting..."}
</p>
<button className="route-button" onClick={getSafeRoute}>
  🛣️ Get Safe Route
</button>
  </div>
</section>

        {/* Safety */}
        <section className="safety">
          <h2>🛡️ Safety Precautions</h2>

          <div className="safety-grid">
            <div>
              <h3>Before Cyclone</h3>
              <p>• Keep emergency supplies ready.</p>
              <p>• Charge phones and power banks.</p>
              <p>• Follow official warnings.</p>
            </div>

            <div>
              <h3>During Cyclone</h3>
              <p>• Stay indoors and away from windows.</p>
              <p>• Avoid flooded roads.</p>
              <p>• Follow evacuation instructions.</p>
            </div>

            <div>
              <h3>After Cyclone</h3>
              <p>• Wait for official clearance.</p>
              <p>• Avoid damaged electrical wires.</p>
              <p>• Check on family and neighbors safely.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer>
        <p>🌪️ Cyclone Tracker | Cyclone Monitoring & Safety System</p>
      </footer>

    </div>
  );
}

export default App;