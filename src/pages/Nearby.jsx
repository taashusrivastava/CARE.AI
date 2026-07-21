import React, { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

export default function Nearby() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not get location. Please enable location services."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const bboxLngMin = coords ? coords.lng - 0.05 : 0;
  const bboxLatMin = coords ? coords.lat - 0.05 : 0;
  const bboxLngMax = coords ? coords.lng + 0.05 : 0;
  const bboxLatMax = coords ? coords.lat + 0.05 : 0;
  const osmUrl = coords
    ? "https://www.openstreetmap.org/export/embed.html?bbox=" +
      bboxLngMin + "%2C" + bboxLatMin + "%2C" + bboxLngMax + "%2C" + bboxLatMax +
      "&layer=mapnik&marker=" + coords.lat + "%2C" + coords.lng
    : null;

  const mapsUrl = coords
    ? "https://www.google.com/maps/search/hospitals+near+me/@" + coords.lat + "," + coords.lng + ",14z"
    : "https://www.google.com/maps/search/hospitals+near+me";

  return (
    <div className="max-w-6xl mx-auto" data-testid="nearby-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 grid place-items-center">
          <MapPin className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Nearby Hospitals</h1>
          <p className="text-sm text-slate-500">Find care around you.</p>
        </div>

      <div className="mt-6 glass rounded-3xl p-6">
        {error && (
          <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm mb-4">
            {error}
          </div>
        )}

        {coords ? (
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Navigation className="w-4 h-4 text-emerald-600" />
              Your location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
            <div className="rounded-3xl overflow-hidden border-4 border-white shadow-lg" style={{ height: "450px" }}>
              <iframe
                title="OpenStreetMap"
                src={osmUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400 text-white font-bold hover:scale-[1.02] transition"
              >
                <MapPin className="w-4 h-4" /> Search hospitals on Google Maps
              </a>
            </div>
        ) : !error ? (
          <div className="text-center text-slate-500 py-10">
            <div className="animate-pulse text-2xl mb-2">+</div>
            <div>Getting your location...</div>
        ) : null}
      </div>

      <div className="mt-4 glass rounded-3xl p-5 text-xs text-slate-500">
        <strong>Disclaimer:</strong> This map shows your current location. Hospital search is done via Google Maps in a new tab.
        For emergencies, please call local emergency services immediately.
      </div>
  );
}
