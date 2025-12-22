import { MapContainer, TileLayer, Polygon, Circle, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../api/axios";
import MapLegend from "./MapLegend";

const severityStyles = {
  low: {
    color: "#2e7d32",
    fillColor: "#66bb6a",
    fillOpacity: 0.35,
    weight: 2,
  },
  medium: {
    color: "#ef6c00",
    fillColor: "#ffb74d",
    fillOpacity: 0.4,
    weight: 2,
  },
  high: {
    color: "#c62828",
    fillColor: "#ef5350",
    fillOpacity: 0.45,
    weight: 3,
  },
  critical: {
    color: "#4a0000",
    fillColor: "#b71c1c",
    fillOpacity: 0.55,
    weight: 3,
  },
};

export default function LiveDisasterMap() {
  const [zones, setZones] = useState([]);
  const [showZones, setShowZones] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get("/disaster-zones/public");
        setZones(res.data);
      } catch (err) {
        console.error("Failed to fetch disaster zones");
      }
    };
    fetchZones();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      
      {/* ✅ EMPTY STATE OVERLAY */}
      {zones.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          No active disaster zones currently
        </div>
      )}
      {/* Layer toggle (can expand later) */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={showZones}
            onChange={() => setShowZones(!showZones)}
            style={{ marginRight: "6px" }}
          />
          Show Disaster Zones
        </label>
      </div>

      <div style={{ height: "500px", width: "100%" }}>
        <MapContainer
          center={[22.9734, 78.6569]} // India
          zoom={5}
          minZoom={4}
          maxZoom={8}
          scrollWheelZoom={false}
          maxBounds={[
            [5.0, 65.0], // South West
            [38.0, 100.0] // North East
          ]}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%", borderRadius: "16px" }}
          whenReady={(map) => {
            // 🔥 Fix for hidden/partial render issues
            setTimeout(() => {
              map.target.invalidateSize();
            }, 200);
          }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapLegend />

          {/* DISASTER ZONES LAYER */}
          {showZones &&
            zones.map((zone) => {
              // POLYGON ZONE
              if (zone.geometryType === "polygon" && zone.polygon) {
                return (
                  <Polygon
                    key={zone._id}
                    positions={zone.polygon.coordinates[0].map(([lng, lat]) => [
                      lat,
                      lng,
                    ])}
                    pathOptions={
                      severityStyles[zone.severity] || severityStyles.medium
                    }
                    eventHandlers={{
                      mouseover: (e) => {
                        e.target.setStyle({
                          weight: 4,
                          fillOpacity: 0.7,
                        });
                      },
                      mouseout: (e) => {
                        e.target.setStyle(
                          severityStyles[zone.severity] || severityStyles.medium
                        );
                      },
                    }}
                  >
                    <Popup>
                      <b>{zone.name}</b>
                      <br />
                      {zone.category?.name}
                      <br />
                      Severity: {zone.severity}
                    </Popup>
                  </Polygon>
                );
              }

              // CIRCLE ZONE
              if (zone.geometryType === "circle" && zone.center) {
                return (
                  <Circle
                    key={zone._id}
                    center={[zone.center.lat, zone.center.lng]}
                    radius={zone.radiusKm * 1000}
                    pathOptions={
                      severityStyles[zone.severity] || severityStyles.medium
                    }
                    eventHandlers={{
                      mouseover: (e) => {
                        e.target.setStyle({
                          weight: 4,
                          fillOpacity: 0.7,
                        });
                      },
                      mouseout: (e) => {
                        e.target.setStyle(
                          severityStyles[zone.severity] || severityStyles.medium
                        );
                      },
                    }}
                  >
                    <Popup>
                      <b>{zone.name}</b>
                      <br />
                      {zone.category?.name}
                      <br />
                      Severity: {zone.severity}
                    </Popup>
                  </Circle>
                );
              }

              return null;
            })}
        </MapContainer>
      </div>
    </div>
  );
}
