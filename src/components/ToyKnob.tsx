import React, { useRef, useState, useEffect } from 'react';

interface ToyKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  colorHex?: string; // custom highlight color (terracotta, lilac, indigo)
  onChange: (val: number) => void;
}

export default function ToyKnob({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  colorHex = '#E07A5F', // terracotta default
  onChange,
}: ToyKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);

  // Map value to degrees (-135 to 135 deg)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + percentage * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartValue.current = value;
    knobRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = dragStartY.current - e.clientY; // drag up increases
    const range = max - min;
    const pixelsPerFullRange = 150; // drag 150px to go from min to max
    const deltaValue = (deltaY / pixelsPerFullRange) * range;
    
    let newValue = dragStartValue.current + deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Round to step
    const steps = Math.round(newValue / step);
    const steppedValue = Number((steps * step).toFixed(2));
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    knobRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    let newValue = value + direction * step * 3;
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(Number(newValue.toFixed(2)));
  };

  return (
    <div className="flex flex-col items-center justify-center select-none" id={`knob-container-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Outer Ceramic Ring */}
      <div 
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-16 h-16 rounded-full bg-[#EAE5D9] flex items-center justify-center cursor-ns-resize shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(139,115,85,0.15)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.08),_0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-100"
        style={{ touchAction: 'none' }}
      >
        {/* Physical Inner Dial with Clay Matte shading */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-75"
          style={{ 
            backgroundColor: '#F4F1DE',
            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05), inset 0 -4px 6px rgba(255,255,255,0.8), 0 2px 3px rgba(0,0,0,0.1)',
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {/* Flat non-reflective physical indicator dot / notch */}
          <div 
            className="w-1.5 h-3 rounded-full absolute top-1 flex items-center justify-center"
            style={{ 
              backgroundColor: colorHex,
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.2)'
            }}
          />
          {/* Subtle wooden/chalky radial texture ring */}
          <div className="absolute inset-1 rounded-full border border-[rgba(139,115,85,0.08)] pointer-events-none" />
        </div>

        {/* Ambient indicator LED ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent pointer-events-none" />
      </div>

      {/* Description Label & Real-time Value */}
      <span className="text-xs font-display font-medium text-[#5C5346] mt-2.5 tracking-tight uppercase" id={`label-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {label}
      </span>
      <span className="font-mono text-[10px] font-bold text-[#8C8375] px-1.5 py-0.5 mt-0.5 rounded bg-[#F0EBE0] border border-[#E6DEC9] min-w-10 text-center" id={`value-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {value}
        <span className="text-[8px] font-normal text-[#B5AFA4] ml-0.5">{unit}</span>
      </span>
    </div>
  );
}
