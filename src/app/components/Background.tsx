"use client";

import React, { useState } from "react";

const Background: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-neutral-900"
    >
      <video
        className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      >
        <source src="/videos/night-sky.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Background;
