import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { interpolate } from "d3-interpolate";

const geoUrl =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

const colorScale = scaleLinear()
  .domain([0, 50, 100])
  .range(["#ff4d4d", "#ffd700", "#4caf50"])
  .interpolate(interpolate);

// --- Small reusable component for smooth count-up animation ---
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16); // assuming ~60fps
    const step = () => {
      start += increment;
      if (start < value) {
        setDisplayValue(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    step();
  }, [value, duration]);

  return <>{displayValue}</>;
};

const IndiaMap = () => {
  const [stateData, setStateData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const response = await fetch("http://localhost:8000/state_counts");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setStateData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStateData();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[500px] text-gray-600 text-lg">
        Loading map data...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[500px] text-red-600 font-semibold">
        Error loading map: {error}
      </div>
    );
  
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Map Section */}
      <div className="flex-shrink-0 w-full md:w-[550px] h-[500px] bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [78.9629, 22.5937] }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.NAME_1;
                const value = stateData[stateName];
                const isHovered = hoveredState === stateName;
                const fillColor = isHovered
                  ? "#f59e0b"
                  : value
                  ? colorScale(value)
                  : "#e5e7eb";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#fff"
                    strokeWidth={0.7}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* State Cards Section */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 overflow-y-auto max-h-[500px] p-2 pr-3 custom-scroll">
        {Object.keys(stateData).length === 0 ? (
          <p className="text-gray-500 text-center w-full">
            No state data available
          </p>
        ) : (
          Object.entries(stateData).map(([stateName, count]) => {
            const isHovered = hoveredState === stateName;
            return (
              <div
                key={stateName}
                className={`transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-lg shadow-md p-4 bg-white border border-gray-100 flex flex-col items-center justify-center hover:shadow-xl ${
                  isHovered ? "bg-yellow-50 border-yellow-400" : ""
                }`}
                onMouseEnter={() => setHoveredState(stateName)}
                onMouseLeave={() => setHoveredState(null)}
              >
                <span className="font-medium text-gray-800 text-center text-sm tracking-wide">
                  {stateName}
                </span>
                <span className="mt-2 text-indigo-600 font-bold text-xl">
                  <AnimatedNumber value={count} />
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IndiaMap;
