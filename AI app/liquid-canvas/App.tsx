import React from 'react';
import WaterRipple from './components/WaterRipple';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <WaterRipple />
      
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex flex-col items-start z-10 text-white mix-blend-overlay opacity-80">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">Liquid Surface</h1>
        <p className="text-sm md:text-lg font-light max-w-md">
          Click or drag anywhere to disturb the water. 
          A real-time 2D wave simulation running on HTML5 Canvas.
        </p>
      </div>
    </div>
  );
};

export default App;