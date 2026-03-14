const fs = require('fs');
let code = fs.readFileSync('src/components/ui/Input.tsx', 'utf8');

const newButton = \export const GetLocationButton = ({ onLocation }: { onLocation: (loc: string) => void }) => {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(\\\https://nominatim.openstreetmap.org/reverse?lat=\\&lon=\\&format=json\\\);
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
              if (city) onLocation(city);
            } catch (err) {
              console.error(err);
              const loc = window.prompt("Could not fetch location. Please enter manually:");
              if (loc) onLocation(loc);
            }
            setLoading(false);
          },
          (err) => {
            console.error(err);
            setLoading(false);
            const loc = window.prompt("Location access denied/failed. Please enter manually:");
            if (loc) onLocation(loc);
          }
        );
      }}
      title="Use Current Location"
      style={{
        background: "transparent",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        color: loading ? "rgba(42, 157, 143, 0.5)" : "#2A9D8F",
        pointerEvents: "auto",
        transition: "color 0.2s"
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
        {loading ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        ) : (
          <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></>
        )}
      </svg>
    </button>
  );
};\;

code = code.replace(/export const GetLocationButton =[\\s\\S]*?export default Input;/m, newButton + '\\nexport default Input;');

fs.writeFileSync('src/components/ui/Input.tsx', code);
