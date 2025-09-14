import { useRef, useEffect, useState } from "react";

export default function TabsNesplora({ activeIndex, setActiveIndex }) {
  const tabs = ["Resumen", "Planificación", "Memoria de trabajo", "Flexibilidad cognitiva"];
  const [sliderStyle, setSliderStyle] = useState({});
  const tabRefs = useRef([]);

  useEffect(() => {
  const tabEl = tabRefs.current[activeIndex];
    if (tabEl) {
      const { offsetLeft, offsetWidth } = tabEl;
      setSliderStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);


  return (
    <div className="relative flex justify-end rounded-full py-0.5 space-x-2">
      <div
        className="absolute top-0 left-0 h-full rounded-full glass-secondary-bg transition-all duration-300 ease-in-out focus:outline-none"
        style={sliderStyle}
      />

      {tabs.map((tab, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={tab}
            ref={(el) => (tabRefs.current[index] = el)}
            onClick={() => setActiveIndex(index)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-200 relative z-10 cursor-pointer ${
              isActive ? "text-primary-text font-medium" : "text-secondary-text hover:text-primary-text"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
