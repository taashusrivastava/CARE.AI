import React, { useEffect, useMemo, useState } from "react";
import { Search, FlaskConical, ArrowRight, MapPin, Navigation, Info, AlertCircle } from "lucide-react";

const TEST_DB = [
  {
    name: "CBC (Complete Blood Count)",
    category: "Blood",
    purpose: "Measures the cells that make up your blood — red blood cells, white blood cells, and platelets. It's commonly used to check for anemia, infection, inflammation, and certain blood disorders.",
    preparation: "No special preparation is usually needed. You don't need to fast. Drink water normally and inform your doctor about any medications you take.",
    centers: ["City Diagnostics", "HealthPath Labs", "MedPlus Diagnostics", "LifeCell Pathology"],
  },
  {
    name: "Blood Glucose / Blood Sugar",
    category: "Metabolic",
    purpose: "Measures the amount of sugar (glucose) in your blood. It helps assess how well your body manages sugar and is used in screening and monitoring for conditions like diabetes.",
    preparation: "For a fasting glucose test, avoid eating or drinking anything except water for 8–12 hours beforehand. For a random or post-meal test, follow the instructions given by your healthcare provider.",
    centers: ["Metro Diagnostics", "CarePlus Labs", "MedPlus Diagnostics", "HealthPath Labs"],
  },
  {
    name: "Lipid Profile",
    category: "Metabolic",
    purpose: "Measures cholesterol and triglycerides in your blood, including HDL ('good') and LDL ('bad') cholesterol. It helps assess your risk of heart disease and guides lifestyle and dietary choices.",
    preparation: "You usually need to fast for 9–12 hours before the test. Only water is allowed during this time. Avoid heavy meals and alcohol the night before.",
    centers: ["City Diagnostics", "LifeCell Pathology", "Metro Diagnostics", "CarePlus Labs"],
  },
  {
    name: "Thyroid Function Tests (T3, T4, TSH)",
    category: "Hormone",
    purpose: "Checks how well your thyroid gland is working by measuring thyroid hormones in your blood. It helps evaluate conditions related to an overactive or underactive thyroid.",
    preparation: "No fasting is generally required. If you take thyroid medication, follow your doctor's advice about timing. Some supplements may affect results, so mention them.",
    centers: ["HealthPath Labs", "MedPlus Diagnostics", "City Diagnostics", "LifeCell Pathology"],
  },
  {
    name: "Liver Function Test (LFT)",
    category: "Organ",
    purpose: "Measures enzymes and proteins produced by the liver. It helps assess liver health and screening for liver conditions or damage from various causes.",
    preparation: "Fasting for 8–12 hours is often recommended. Inform your doctor about medications and alcohol use, as these can affect liver enzyme levels.",
    centers: ["Metro Diagnostics", "City Diagnostics", "LifeCell Pathology", "CarePlus Labs"],
  },
  {
    name: "Kidney Function Test (KFT)",
    category: "Organ",
    purpose: "Measures waste products and electrolytes filtered by your kidneys, such as creatinine, urea, and potassium. It helps assess how well your kidneys are working.",
    preparation: "You may be asked to fast for about 8 hours. Drink water normally. Avoid strenuous exercise before the test as it can affect creatinine levels.",
    centers: ["CarePlus Labs", "Metro Diagnostics", "HealthPath Labs", "MedPlus Diagnostics"],
  },
  {
    name: "HbA1c (Glycated Hemoglobin)",
    category: "Metabolic",
    purpose: "Provides an estimate of your average blood sugar level over the past 2–3 months. It is often used to monitor long-term blood sugar control in people with diabetes.",
    preparation: "No fasting is required. This test reflects average glucose over time, so it can be done at any time of day.",
    centers: ["LifeCell Pathology", "HealthPath Labs", "City Diagnostics", "Metro Diagnostics"],
  },
  {
    name: "Vitamin D Test",
    category: "Vitamin",
    purpose: "Measures the level of vitamin D in your blood, which is important for bone health, immunity, and overall wellbeing. It helps evaluate deficiency or excess.",
    preparation: "No special preparation is needed. Fasting is not required. Let your doctor know about any vitamin supplements you take.",
    centers: ["MedPlus Diagnostics", "City Diagnostics", "CarePlus Labs", "HealthPath Labs"],
  },
  {
    name: "Vitamin B12 Test",
    category: "Vitamin",
    purpose: "Measures the amount of vitamin B12 in your blood, which is important for nerve function and red blood cell formation. It helps evaluate deficiency and related symptoms.",
    preparation: "Fasting for 6–8 hours is sometimes recommended. Inform your doctor about B12 supplements or injections, as they can affect results.",
    centers: ["HealthPath Labs", "LifeCell Pathology", "Metro Diagnostics", "City Diagnostics"],
  },
  {
    name: "Iron Studies",
    category: "Blood",
    purpose: "Measurse iron levels and related markers in your blood, such as serum iron, ferritin, and TIBC. It helps evaluate iron deficiency, overload, and anemia.",
    preparation: "Fasting for 8–12 hours is typically recommended. Morning samples are preferred. Avoid iron supplements for 24 hours before the test if advised.",
    centers: ["City Diagnostics", "CarePlus Labs", "LifeCell Pathology", "Metro Diagnostics"],
  },
  {
    name: "Urine Routine & Microscopy",
    category: "Urine",
    purpose: "Examines the physical, chemical, and microscopic properties of urine. It helps screen for urinary tract infections, kidney issues, and other conditions.",
    preparation: "Collect a clean mid-stream sample in the container provided. Avoid strenuous exercise before the test, as it can affect results.",
    centers: ["Metro Diagnostics", "HealthPath Labs", "MedPlus Diagnostics", "City Diagnostics"],
  },
  {
    name: "C-Reactive Protein (CRP)",
    category: "Blood",
    purpose: "Measures the level of C-reactive protein, a marker of inflammation in the body. It helps identify or monitor inflammatory conditions and infections.",
    preparation: "No special preparation is needed. Fasting is not typically required. Inform your doctor about any medications or recent infections.",
    centers: ["LifeCell Pathology", "CarePlus Labs", "City Diagnostics", "HealthPath Labs"],
  },
  {
    name: "ESR (Erythrocyte Sedimentation Rate)",
    category: "Blood",
    purpose: "Measures how quickly red blood cells settle at the bottom of a tube. It is a general marker of inflammation used to help detect and monitor inflammatory conditions.",
    preparation: "No special preparation is needed. However, some medications can affect results, so inform your healthcare provider about what you take.",
    centers: ["MedPlus Diagnostics", "Metro Diagnostics", "LifeCell Pathology", "CarePlus Labs"],
  },
  {
    name: "ECG / EKG (Electrocardiogram)",
    category: "Heart",
    purpose: "Records the electrical activity of your heart. It helps assess heart rhythm, detect abnormal beats, and screen for certain heart conditions.",
    preparation: "Avoid caffeine and heavy meals for a few hours beforehand. Wear comfortable clothing. Inform the technician if you have a pacemaker.",
    centers: ["City Heart Center", "Metro Diagnostics", "CarePlus Labs", "HealthPath Labs"],
  },
  {
    name: "Dengue Serology (NS1, IgM, IgG)",
    category: "Infection",
    purpose: "Detects the presence of the dengue virus or antibodies against it in your blood. It is used to help diagnose or confirm a dengue infection.",
    preparation: "No special preparation is needed. Inform your doctor about your symptoms and when they started, as timing affects which test is most useful.",
    centers: ["LifeCell Pathology", "City Diagnostics", "HealthPath Labs", "MedPlus Diagnostics"],
  },
  {
    name: "Malaria Antigen Test",
    category: "Infection",
    purpose: "Detects malaria parasites or antigens in your blood. It is used to help diagnose malaria infection, especially in people with fever and travel history.",
    preparation: "No special preparation is needed. Inform your healthcare provider about your symptoms and any recent travel.",
    centers: ["Metro Diagnostics", "CarePlus Labs", "City Diagnostics", "LifeCell Pathology"],
  },
  {
    name: "HbA1c - Fasting Insulin",
    category: "Metabolic",
    purpose: "Measures fasting insulin along with glucose to assess insulin resistance and how well your body is responding to sugar. Often used in metabolic evaluations.",
    preparation: "Fasting for 8–12 hours is required. Only water is allowed. Avoid alcohol and vigorous exercise the day before the test.",
    centers: ["HealthPath Labs", "MedPlus Diagnostics", "Metro Diagnostics", "City Diagnostics"],
  },
  {
    name: "Prolactin Test",
    category: "Hormone",
    purpose: "Measures the level of prolactin, a hormone involved in many functions including lactation and reproduction. It helps evaluate certain hormonal conditions.",
    preparation: "Usually done in the morning. Stress and exercise can raise prolactin, so rest for about 30 minutes before the sample is taken.",
    centers: ["CarePlus Labs", "LifeCell Pathology", "HealthPath Labs", "Metro Diagnostics"],
  },
  {
    name: "Calcium & Electrolytes",
    category: "Metabolic",
    purpose: "Measures key minerals like calcium, sodium, potassium, and chloride in your blood. These are essential for muscle, nerve, and heart function.",
    preparation: "Fasting for 8–12 hours is often recommended. Avoid taking calcium or mineral supplements before the test unless advised otherwise.",
    centers: ["City Diagnostics", "Metro Diagnostics", "CarePlus Labs", "HealthPath Labs"],
  },
];

export default function LabTests() {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Could not get your location, but you can still use the search."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const selected = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return TEST_DB.filter((t) => t.name.toLowerCase().includes(q))[0] || null;
  }, [query]);

  const mapsUrl = coords
    ? "https://www.google.com/maps/search/diagnostic+centers+near+me/@" + coords.lat + "," + coords.lng + ",14z"
    : "https://www.google.com/maps/search/diagnostic+centers+near+me";

  return (
    <div className="max-w-6xl mx-auto" data-testid="lab-tests-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-100 grid place-items-center">
          <FlaskConical className="w-5 h-5 text-blue-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Lab Test Center</h1>
          <p className="text-sm text-slate-500">Find a test, understand its purpose, and locate nearby diagnostic centers.</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 glass rounded-3xl p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Find a Test</label>
        <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-blue-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. CBC, blood glucose, lipid profile, thyroid..."
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Quick chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {["CBC", "Blood Glucose", "Lipid Profile", "Thyroid", "HbA1c", "Vitamin D", "LFT", "KFT"].map((c) => (
            <button
              key={c}
              onClick={() => setQuery(c)}
              className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Result / empty state */}
      <div className="mt-6">
        {!query.trim() ? (
          <div className="glass rounded-3xl p-10 text-center">
            <div className="text-4xl mb-3">🔬</div>
            <div className="font-display text-xl text-slate-700">Search for a lab test</div>
            <p className="text-sm text-slate-500 mt-1">
              Type a test name above or tap a quick suggestion to see its purpose, preparation, and nearby centers.
            </p>
          </div>
        ) : selected ? (
          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl">{selected.name}</h2>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {selected.category}
                </span>
              </div>
              <button
                onClick={() => setQuery("")}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear search
              </button>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/70 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <Info className="w-4 h-4" /> Purpose
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{selected.purpose}</p>
              </div>
              <div className="rounded-2xl bg-white/70 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                  <ArrowRight className="w-4 h-4" /> Preparation
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{selected.preparation}</p>
              </div>
            </div>

            {/* Nearby centers */}
            <div className="mt-5 rounded-2xl bg-white/70 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
                <MapPin className="w-4 h-4 text-rose-600" /> Nearby Diagnostic Centers
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {selected.centers.map((c) => (
                  <a
                    key={c}
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition"
                  >
                    <FlaskConical className="w-4 h-4 text-blue-500" />
                    {c}
                    <Navigation className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </a>
                ))}
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400 text-white text-sm font-semibold hover:scale-[1.02] transition"
              >
                <MapPin className="w-4 h-4" /> Open diagnostic centers near me on Google Maps
              </a>
              {geoError && <div className="mt-2 text-xs text-amber-700">{geoError}</div>}
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-10 text-center">
            <div className="text-4xl mb-3">🤔</div>
            <div className="font-display text-xl text-slate-700">No test found</div>
            <p className="text-sm text-slate-500 mt-1">
              We couldn't find "{query}". Try a different name or a quick suggestion above.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 glass rounded-3xl p-5 text-xs text-slate-500 flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
        <span>
          <strong>Educational information only.</strong> Test descriptions and preparation tips are general guidance and are not
          personalized medical instructions. Always follow the specific advice of your doctor, nurse, or the diagnostic center.
          In a medical emergency, call local emergency services immediately.
        </span>
      </div>
    </div>
  );
}
