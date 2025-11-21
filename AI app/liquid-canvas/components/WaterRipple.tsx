import React, { useEffect, useRef, useCallback } from 'react';

const WaterRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation parameters
  // Damping: Controls how fast waves die out. (val - (val >> 5)) is approx 0.968 damping
  // Ripple Radius: Size of the initial splash
  const RIPPLE_RADIUS = 4; 
  const RIPPLE_STRENGTH = 400; 
  // Downsampling factor helps create "larger" feeling waves and improves performance
  const RESOLUTION_SCALE = 0.5;

  // Refs to hold mutable simulation data
  const simulationState = useRef({
    width: 0,
    height: 0,
    buffer1: new Int16Array(0),
    buffer2: new Int16Array(0),
    backgroundData: new Uint8ClampedArray(0),
    imageData: null as ImageData | null,
    rafId: 0,
    isDragging: false
  });

  const generateBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Deep water gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#020617'); // Slate 950
    gradient.addColorStop(0.5, '#1e3a8a'); // Blue 900
    gradient.addColorStop(1, '#0e7490'); // Cyan 700
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add a grid pattern to make refraction highly visible
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    const gridSize = 40;
    
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Add some random glowing particles/stones
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 15 + 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Large subtle text helps orient the eye to distortions
    ctx.font = `bold ${Math.floor(width / 6)}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("FLUID", width / 2, height / 2);
  };

  const disturb = (x: number, y: number) => {
    const { width, height, buffer1 } = simulationState.current;
    
    if (x < RIPPLE_RADIUS || x >= width - RIPPLE_RADIUS || 
        y < RIPPLE_RADIUS || y >= height - RIPPLE_RADIUS) {
      return;
    }

    // Create a circular disturbance
    const rSq = RIPPLE_RADIUS * RIPPLE_RADIUS;
    for (let j = y - RIPPLE_RADIUS; j < y + RIPPLE_RADIUS; j++) {
      for (let i = x - RIPPLE_RADIUS; i < x + RIPPLE_RADIUS; i++) {
        const dx = x - i;
        const dy = y - j;
        if (dx * dx + dy * dy < rSq) {
          const index = (j * width) + i;
          buffer1[index] += RIPPLE_STRENGTH;
        }
      }
    }
  };

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      // Scale canvas resolution down for performance and "larger" water look
      canvas.width = Math.floor(parent.clientWidth * RESOLUTION_SCALE);
      canvas.height = Math.floor(parent.clientHeight * RESOLUTION_SCALE);
    }
    
    const width = canvas.width;
    const height = canvas.height;
    const size = width * height;
    const state = simulationState.current;

    state.width = width;
    state.height = height;
    state.buffer1 = new Int16Array(size);
    state.buffer2 = new Int16Array(size);
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    generateBackground(ctx, width, height);
    
    const bgImage = ctx.getImageData(0, 0, width, height);
    state.backgroundData = bgImage.data;
    state.imageData = ctx.createImageData(width, height);
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const state = simulationState.current;
    const { width, height, buffer1, buffer2, backgroundData, imageData } = state;

    if (!imageData || width === 0) return;

    const outputData = imageData.data;
    
    // 1. Physics Pass
    for (let y = 1; y < height - 1; y++) {
      const currentLine = y * width;
      const prevLine = (y - 1) * width;
      const nextLine = (y + 1) * width;

      for (let x = 1; x < width - 1; x++) {
        const i = currentLine + x;
        
        // Wave equation
        let val = (
          buffer1[i - 1] + 
          buffer1[i + 1] + 
          buffer1[prevLine + x] + 
          buffer1[nextLine + x]
        ) >> 1;
        
        val -= buffer2[i];
        val -= (val >> 5); // Damping
        
        buffer2[i] = val;
      }
    }

    // 2. Render Pass
    for (let y = 0; y < height; y++) {
      const currentLine = y * width;
      // Clamp y for offset lookup
      const yPrev = y > 0 ? y - 1 : 0;
      const yNext = y < height - 1 ? y + 1 : height - 1;

      for (let x = 0; x < width; x++) {
        const i = currentLine + x;
        
        // Clamp x
        const xPrev = x > 0 ? x - 1 : 0;
        const xNext = x < width - 1 ? x + 1 : width - 1;

        // Calculate slope
        const xOffset = buffer2[currentLine + xPrev] - buffer2[currentLine + xNext];
        const yOffset = buffer2[(yPrev * width) + x] - buffer2[(yNext * width) + x];
        
        // Shading (specular highlight/shadow based on slope)
        // Positive slope adds light, negative removes it.
        const shading = xOffset >> 4;

        // Refraction
        // We shift the lookup coordinate based on the slope
        let srcX = x + (xOffset >> 3); 
        let srcY = y + (yOffset >> 3);

        // Bounds check for source pixel
        if (srcX < 0) srcX = 0;
        else if (srcX >= width) srcX = width - 1;
        if (srcY < 0) srcY = 0;
        else if (srcY >= height) srcY = height - 1;

        const srcIdx = (srcY * width + srcX) * 4;
        const destIdx = i * 4;

        // Apply pixel with shading
        outputData[destIdx] = backgroundData[srcIdx] + shading;
        outputData[destIdx + 1] = backgroundData[srcIdx + 1] + shading;
        outputData[destIdx + 2] = backgroundData[srcIdx + 2] + shading;
        outputData[destIdx + 3] = 255;
      }
    }

    // Swap buffers
    const temp = buffer1;
    state.buffer1 = buffer2;
    state.buffer2 = temp;

    ctx.putImageData(imageData, 0, 0);
    state.rafId = requestAnimationFrame(tick);
  }, []);

  // Setup
  useEffect(() => {
    // Initial resize
    handleResize();
    
    // Debounced resize handler could be better, but native is fine for this demo
    window.addEventListener('resize', handleResize);
    
    simulationState.current.rafId = requestAnimationFrame(tick);

    // Auto-splash
    const timer = setTimeout(() => {
        if(simulationState.current.width > 0) {
            const cx = simulationState.current.width >> 1;
            const cy = simulationState.current.height >> 1;
            disturb(cx, cy);
        }
    }, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(simulationState.current.rafId);
      clearTimeout(timer);
    };
  }, [handleResize, tick]);

  // Input Handling
  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    
    disturb(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={(e) => {
        simulationState.current.isDragging = true;
        handleInteraction(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        if (simulationState.current.isDragging) {
           handleInteraction(e.clientX, e.clientY);
        }
      }}
      onMouseUp={() => simulationState.current.isDragging = false}
      onMouseLeave={() => simulationState.current.isDragging = false}
      onTouchStart={(e) => {
        const t = e.touches[0];
        handleInteraction(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleInteraction(t.clientX, t.clientY);
      }}
      className="block w-full h-full touch-none cursor-crosshair"
      style={{ 
        // Smooth scaling makes the low-res simulation look like viscous fluid
        imageRendering: 'auto' 
      }} 
    />
  );
};

export default WaterRipple;