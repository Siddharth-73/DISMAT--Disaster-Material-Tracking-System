const legendItems = [
  { label: "Low", color: "#66bb6a" },
  { label: "Medium", color: "#ffb74d" },
  { label: "High", color: "#ef5350" },
  { label: "Critical", color: "#b71c1c" },
];

export default function MapLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        backgroundColor: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      <strong>Severity</strong>
      {legendItems.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", marginTop: "6px" }}>
          <span
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: item.color,
              borderRadius: "50%",
              marginRight: "8px",
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
