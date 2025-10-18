import React, { useEffect, useState } from "react";

// Utility to format ISO date to readable format
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function GeoClusters() {
  const [clusters, setClusters] = useState({});
  const [selectedGeo, setSelectedGeo] = useState("");
  const [sortedEntries, setSortedEntries] = useState([]);
  const [summarizedTexts, setSummarizedTexts] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const [doneSummaries, setDoneSummaries] = useState({});

  // Fetch clusters from backend
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await fetch("http://localhost:8000/geolocation_clusters");
        const data = await res.json();
        setClusters(data);
        const firstGeo = Object.keys(data)[0] || "";
        setSelectedGeo(firstGeo);
      } catch (err) {
        console.error("Error fetching clusters:", err);
      }
    };
    fetchClusters();
  }, []);

  // Update sorted entries when selectedGeo or clusters change
  useEffect(() => {
    if (selectedGeo && clusters[selectedGeo]) {
      const entries = [...clusters[selectedGeo]];
      entries.sort((a, b) => new Date(b.time_date) - new Date(a.time_date));
      setSortedEntries(entries);
    }
  }, [selectedGeo, clusters]);

  // Summarize function
  const handleSummarize = async (idx, entry) => {
    try {
      setLoadingSummaries((prev) => ({ ...prev, [idx]: true }));

      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: entry.text }),
      });

      const data = await response.json();
      setSummarizedTexts((prev) => ({ ...prev, [idx]: data.summary }));
      setDoneSummaries((prev) => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error("Error summarizing text:", err);
    } finally {
      setLoadingSummaries((prev) => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header row: location & dropdown on right */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
          📍
          <span>{selectedGeo || "Select a Geolocation"}</span>
        </h1>

        {/* Dropdown aligned right */}
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-400 
                     focus:border-green-400 transition-all text-gray-700 bg-white"
          value={selectedGeo}
          onChange={(e) => setSelectedGeo(e.target.value)}
        >
          {Object.keys(clusters).map((geo) => (
            <option key={geo} value={geo}>
              {geo}
            </option>
          ))}
        </select>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEntries.map((entry, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-5 rounded-xl 
                       shadow-md hover:shadow-xl transition transform 
                       hover:-translate-y-1 duration-200 flex flex-col justify-between"
          >
            <div>
              <p className="mb-3 text-gray-700 text-base break-words leading-relaxed">
                {loadingSummaries[idx]
                  ? "⏳ Summarizing..."
                  : summarizedTexts[idx] || entry.text}
              </p>
              <p className="text-sm text-gray-400 mb-3">
                🕓 Posted On: {formatDate(entry.time_date)}
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleSummarize(idx, entry)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    doneSummaries[idx]
                      ? "bg-green-200 text-green-700 cursor-not-allowed"
                      : loadingSummaries[idx]
                      ? "bg-green-400 text-white animate-pulse cursor-wait"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                disabled={loadingSummaries[idx] || doneSummaries[idx]}
              >
                {loadingSummaries[idx]
                  ? "Summarizing..."
                  : doneSummaries[idx]
                  ? "Summarized"
                  : "Summarize"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
