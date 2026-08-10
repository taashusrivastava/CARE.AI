import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Clock3, Phone, Map, Pill, Activity, Crosshair } from "lucide-react";

const nearbyLocations = [
  {
    id: "hospital",
    type: "Hospital",
    name: "CityCare Hospital",
    services: ["Emergency", "24/7 Pharmacy", "Radiology", "ICU"],
    hours: "Open 24 hours",
    phone: "+91 98765 43210",
    latOffset: 0.009,
    lngOffset: -0.007,
    position: { top: "18%", left: "30%" },
    icon: MapPin,
  },
  {
    id: "pharmacy",
    type: "Pharmacy",
    name: "HealthPlus Pharmacy",
    services: ["Medicine refills", "OTC supplies", "Consultation"],
    hours: "8:00 AM - 10:00 PM",
    phone: "+91 91234 56789",
    latOffset: -0.006,
    lngOffset: 0.005,
    position: { top: "55%", left: "18%" },
    icon: Pill,
  },
  {
    id: "lab",
    type: "Lab",
    name: "Wellness Lab",
    services: ["Blood tests", "Imaging", "Health screening"],
    hours: "7:00 AM - 8:00 PM",
    phone: "+91 99876 54321",
    latOffset: 0.003,
    lngOffset: 0.01,
    position: { top: "35%", left: "70%" },
    icon: Activity,
  },
  {
    id: "clinic",
    type: "Clinic",
    name: "Sunrise Clinic",
    services: ["Family medicine", "Specialist care", "Teleconsult"],
    hours: "9:00 AM - 9:00 PM",
    phone: "+91 90123 45678",
    latOffset: -0.01,
    lngOffset: 0.01,
    position: { top: "70%", left: "80%" },
    icon: Crosshair,
  },
];

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Nearby() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState("hospital");

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

  const locations = useMemo(() => {
    if (!coords) return nearbyLocations;
    return nearbyLocations.map((location) => ({
      ...location,
      distance: distanceKm(coords.lat, coords.lng, coords.lat + location.latOffset, coords.lng + location.lngOffset),
      lat: coords.lat + location.latOffset,
      lng: coords.lng + location.lngOffset,
    }));
  }, [coords]);

  const activeLocation = locations.find((location) => location.id === activeId) || locations[0];

  const directionsLink = coords && activeLocation.lat && activeLocation.lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${activeLocation.lat},${activeLocation.lng}&travelmode=driving`
    : "https://www.google.com/maps/search/healthcare+near+me";

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10" data-testid="nearby-page">
      <div className="glass-strong rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-3xl bg-emerald-100 grid place-items-center">
          <MapPin className="w-6 h-6 text-emerald-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Interactive Healthcare Map</h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore nearby hospitals, pharmacies, labs, and clinics. Tap a marker to view details and get directions.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="glass rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
          <div className="relative bg-slate-950 text-white" style={{ minHeight: 520 }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.2),_transparent_30%)]" />
            <div className="absolute inset-0 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-4">Map view</div>
              <div className="absolute rounded-full border border-white/20 bg-white/10 backdrop-blur-xl w-28 h-28 grid place-items-center text-slate-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="text-center">
                  <Crosshair className="mx-auto mb-1 w-6 h-6" />
                  <span className="text-[0.65rem] uppercase tracking-[0.25em]">You</span>
                </div>
              </div>
              <div className="absolute top-5 right-5 rounded-3xl bg-slate-900/80 border border-white/10 px-4 py-3 text-slate-200 shadow-lg">
                <div className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">Current location</div>
                <div className="mt-2 text-sm">
                  {coords ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}` : "Location unavailable"}
                </div>
              </div>
              {locations.map((location) => {
                const Icon = location.icon;
                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setActiveId(location.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 shadow-2xl transition ${
                      activeLocation.id === location.id ? "border-emerald-400 bg-white text-slate-950" : "border-white/30 bg-white/90 text-slate-950 hover:scale-105"
                    }`}
                    style={location.position}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Selected place</div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeLocation.name}</h2>
                <div className="mt-1 text-sm text-slate-600">{activeLocation.type}</div>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {coords ? `${activeLocation.distance.toFixed(1)} km away` : "Distance unavailable"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm uppercase tracking-[0.24em] mb-3">
                  <Clock3 className="w-4 h-4" /> Hours
                </div>
                <div className="text-slate-900 font-semibold">{activeLocation.hours}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm uppercase tracking-[0.24em] mb-3">
                  <Phone className="w-4 h-4" /> Contact
                </div>
                <div className="text-slate-900 font-semibold">{activeLocation.phone}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">Services</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {activeLocation.services.map((service) => (
                  <div key={service} className="rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
              >
                <Map className="w-4 h-4" /> Get Directions
              </a>
              <div className="text-sm text-slate-500">
                Tap a marker to view details for each location type.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Nearby category</p>
                <h3 className="text-xl font-semibold text-slate-900">Medicine & pharmacy</h3>
              </div>
            </div>
            <p className="mt-4 text-slate-600 text-sm">
              Find medicine, lab testing, clinics, and hospital care in one place.
            </p>
          </div>

          <div className="glass rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Your current location</p>
                <h3 className="text-xl font-semibold text-slate-900">{coords ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}` : "Not available"}</h3>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-amber-700 text-sm">{error}</p>
            )}
          </div>

          <div className="glass rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Quick actions</p>
                <h3 className="text-xl font-semibold text-slate-900">Explore health locations</h3>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setActiveId(location.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    activeLocation.id === location.id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{location.name}</div>
                      <div className="text-xs text-slate-500">{location.type}</div>
                    </div>
                    <div className="text-sm text-slate-700">{coords ? `${location.distance.toFixed(1)} km` : "--"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-3xl p-5 text-xs text-slate-500">
        <strong>Note:</strong> This is an interactive dashboard with mock nearby locations. Directions open Google Maps and use your current geolocation when available.
      </div>
    </div>
  );
}
