import React, { useState } from "react";
import IndiaMap from "./components/Map.jsx";
import GeoClusters from "./components/Problems.jsx";
import ChatBox from "./components/Chatbox.jsx";
import logo from "./assets/logo.png";

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="p-0 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-10">
    <img
      src={logo}
      alt="Empath Logo"
      className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
    /> 
    <h1
      className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-600 leading-tight tracking-tight max-w-lg text-balance"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      Crisis-Compass:{" "}
      <span className="font-light text-blue-400 block sm:inline">
        Navigating to track emergencies faster
      </span>
    </h1>
  </div>

      {/* Map and GeoClusters */}
      <IndiaMap />
      <GeoClusters />

  
      <div className="mt-16 mb-5  flex flex-col items-center text-center">
  {/* Circular Sahay logo with glow hover */}
  <div
    onClick={() => setChatOpen(true)}
    className="relative group w-28 h-28 rounded-full overflow-hidden shadow-md cursor-pointer 
               transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400"
  >
    <img
      src={logo}
      alt="Sahay Logo"
      className="w-full h-full object-cover rounded-full border-2 border-transparent 
                 group-hover:border-green-500 transition-all duration-300"
    />
    {/* soft glow ring */}
    <div className="absolute inset-0 rounded-full bg-green-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
  </div>

  {/* Text under logo */}
  <p
    className="mt-6 text-gray-700 font-medium text-base leading-relaxed max-w-xs"
    style={{ fontFamily: "Inter, sans-serif" }}
  >
    Have similar problems? <br />
    <span className="text-green-700 font-semibold">Talk to Sahay</span> — hopefully you’ll get some help!
  </p>

  {/* Optional soft pulse button look */}

  </div>


      {/* ChatBox */}
      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
