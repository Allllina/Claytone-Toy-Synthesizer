import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Music, 
  Tv, 
  Info,
  Heart,
  Keyboard
} from 'lucide-react';
import { SynthSettings, NoteItem, SequencerStep } from './types';
import { startSynthNote, stopSynthNote, triggerSingleShortNote, getAudioContext } from './utils/audio';
import { SYNTH_PRESETS, SYNTH_NOTES, DEFAULT_SEQUENCER_TEMPO, SELECTION_MODES } from './data/synthData';
import ToyKnob from './components/ToyKnob';
import ToyHands from './components/ToyHands';
import StepSequencer from './components/StepSequencer';

// Keyboard key mapper
const KEY_MAP: Record<string, string> = {
  'a': 'C4', 'A': 'C4',
  's': 'D4', 'S': 'D4',
  'd': 'E4', 'D': 'E4',
  'f': 'F4', 'F': 'F4',
  'g': 'G4', 'G': 'G4',
  'h': 'A4', 'H': 'A4',
  'j': 'B4', 'J': 'B4',
  'k': 'C5', 'K': 'C5'
};

export default function App() {
  // Synth and visual states
  const [settings, setSettings] = useState<SynthSettings>({ ...SYNTH_PRESETS[0].settings });
  const [activePreset, setActivePreset] = useState<string>(SYNTH_PRESETS[0].name);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [hoveredKeyId, setHoveredKeyId] = useState<string | null>(null);
  
  // Custom Background Options (Studio Warm Wood vs. Chroma-Key Green Screen)
  const [isChromaGreen, setIsChromaGreen] = useState<boolean>(false);
  const [isAudioStarted, setIsAudioStarted] = useState<boolean>(false);

  // Sequencer Specific States
  const [sequencerGrid, setSequencerGrid] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    SYNTH_NOTES.forEach(note => {
      initial[note.id] = Array(8).fill(false);
    });
    // Pre-populate some quick notes to showcase playability immediately
    initial['C4'] = [true, false, false, false, true, false, false, false];
    initial['E4'] = [false, false, true, false, false, false, true, false];
    initial['G4'] = [false, false, false, true, false, false, false, true];
    return initial;
  });
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [bpm, setBpm] = useState<number>(DEFAULT_SEQUENCER_TEMPO);

  const sequencerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyStateRef = useRef<Record<string, boolean>>({});

  // Clean-up and Audio Initializer
  const handleUserInteraction = () => {
    if (!isAudioStarted) {
      try {
        getAudioContext();
        setIsAudioStarted(true);
      } catch (e) {
        console.error('Audio issue', e);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid text input interference
      if (e.target instanceof HTMLInputElement) return;
      
      const noteId = KEY_MAP[e.key];
      if (noteId && !keyStateRef.current[noteId]) {
        handleUserInteraction();
        keyStateRef.current[noteId] = true;
        
        const note = SYNTH_NOTES.find(n => n.id === noteId);
        if (note) {
          setActiveKeys(prev => [...prev, noteId]);
          startSynthNote(noteId, note.freq, settings);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const noteId = KEY_MAP[e.key];
      if (noteId) {
        keyStateRef.current[noteId] = false;
        setActiveKeys(prev => prev.filter(id => id !== noteId));
        stopSynthNote(noteId, settings);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings, isAudioStarted]);

  // Sequencer loop timer
  useEffect(() => {
    if (sequencerIntervalRef.current) {
      clearInterval(sequencerIntervalRef.current);
    }

    if (isSequencerPlaying) {
      // Calculate delay based on eighth notes at given BPM
      const intervalMs = (60 / bpm) * 1000 / 2; 
      
      sequencerIntervalRef.current = setInterval(() => {
        setCurrentStep(prevStep => {
          const nextStep = (prevStep + 1) % 8;
          
          // Play any active notes for the current column
          SYNTH_NOTES.forEach(note => {
            const hasNote = sequencerGrid[note.id]?.[nextStep];
            if (hasNote) {
              triggerSingleShortNote(note.freq, settings, settings.attack, settings.release);
            }
          });

          return nextStep;
        });
      }, intervalMs);
    } else {
      setCurrentStep(-1);
    }

    return () => {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
      }
    };
  }, [isSequencerPlaying, sequencerGrid, bpm, settings]);

  // Waveform updating
  const handleWaveformChange = (wave: OscillatorType) => {
    handleUserInteraction();
    setSettings(prev => ({ ...prev, waveform: wave }));
  };

  // Preset loader
  const loadPreset = (presetName: string) => {
    handleUserInteraction();
    const preset = SYNTH_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSettings({ ...preset.settings });
      setActivePreset(presetName);
    }
  };

  // Manual touch keys trigger
  const handleKeyStart = (note: NoteItem) => {
    handleUserInteraction();
    if (!activeKeys.includes(note.id)) {
      setActiveKeys(prev => [...prev, note.id]);
      startSynthNote(note.id, note.freq, settings);
    }
  };

  const handleKeyStop = (note: NoteItem) => {
    setActiveKeys(prev => prev.filter(id => id !== note.id));
    stopSynthNote(note.id, settings);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-500 font-sans ${
        isChromaGreen 
          ? 'bg-[#00FF00]' 
          : 'bg-gradient-to-br from-[#F4EFE6] via-[#EAE1D3] to-[#DFD6C6]'
      }`}
      id="app-root-container"
    >
      {/* Upper Utility bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6 z-10" id="utility-bar">
        {/* Branding Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E07A5F] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_2px_4px_rgba(0,0,0,0.1)]">
            <Music className="w-5 h-5 text-[#F4F1DE]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-[#4E4537] leading-none uppercase tracking-tight">
              Claytone
            </h1>
            <p className="text-[10px] font-mono font-bold text-[#8C8375] tracking-widest mt-0.5">
              3D STOP-MOTION TOY INSTRUMENT
            </p>
          </div>
        </div>

        {/* Ambient Settings controls */}
        <div className="flex items-center gap-2">
          {/* Audio State badge */}
          {!isAudioStarted && (
            <button 
              onClick={handleUserInteraction}
              className="cursor-pointer text-[10px] font-mono font-bold text-[#A75B4A] bg-[#EEDAD6] hover:bg-[#EBBBAB] border border-[#DEB0A5] px-2.5 py-1 rounded-full animate-pulse transition-all duration-300 shadow-sm"
              id="audio-activate-badge"
            >
              ⚠ TAP TO ACTIVATE SOUND
            </button>
          )}

          {/* Chroma Toggle */}
          <button
            onClick={() => setIsChromaGreen(!isChromaGreen)}
            className={`cursor-pointer text-[10px] sm:text-xs font-display font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all outline-none border ${
              isChromaGreen 
                ? 'bg-[#F4F1DE] text-[#4E4537] border-[#DCD3C1] shadow-md' 
                : 'bg-[#433B31]/10 text-[#433B31] border-[#D2C8B5] hover:bg-[#433B31]/20'
            }`}
            id="chroma-toggle-button"
            title="Toggle solid green-screen backdrop for design/video compositing"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chroma BG</span>
            <span className={`w-2 h-2 rounded-full ${isChromaGreen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* Main Studio Console Unit */}
      <div 
        className="w-full max-w-5xl bg-[#EDE7DB] rounded-[36px] p-6 md:p-8 border-4 border-[#DFD5C4] shadow-[0_24px_50px_-12px_rgba(40,30,20,0.22),_inset_0_4px_8px_rgba(255,255,255,0.7),_inset_0_-8px_16px_rgba(0,0,0,0.06)] relative overflow-hidden"
        id="main-clay-console"
      >
        {/* Realistic subtle wooden grain framing divider */}
        <div className="absolute inset-0 border-[12px] border-transparent pointer-events-none rounded-[36px] shadow-[inset_0_0_0_1px_rgba(139,115,85,0.1)]" />

        {/* Console grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10" id="console-grid">
          
          {/* ROW 1 LEFT: MATERIAL PRESETS */}
          <div className="lg:col-span-1" id="preset-column-wrapper">
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border-2 border-[#E9DFCF] shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9),_0_2px_4px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between" id="presets-box">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A69F90] uppercase tracking-wider block mb-3">
                  ● Material Presets
                </span>

                <div className="flex flex-col gap-2" id="presets-container">
                  {SYNTH_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.name;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => loadPreset(preset.name)}
                        className={`cursor-pointer w-full text-left px-3.5 py-2.5 rounded-2xl flex flex-col transition-all outline-none border active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#E07A5F] text-[#F4F1DE] border-transparent shadow-[0_4px_0_#C5674D,0_6px_10px_rgba(224,122,95,0.15)] font-medium'
                            : 'bg-[#F4F1DE] text-[#5C5346] border-[#E3DBC7] hover:bg-[#ECE6D8]'
                        }`}
                        id={`preset-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span className="text-xs font-display font-bold block">{preset.name}</span>
                        <span className={`text-[9px] mt-0.5 leading-snug line-clamp-2 ${
                          isSelected ? 'text-[#F9F6E9]/80' : 'text-[#8C8375]'
                        }`}>
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 1 RIGHT: TACTILE CONTROL KNOBS PANEL */}
          <div className="lg:col-span-3" id="knobs-column-wrapper">
            <div className="bg-[#FAF8F5] rounded-3xl p-6 border-2 border-[#E9DFCF] shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between" id="knobs-panel">
              {/* Dials layout - shifted slightly down with mt-4 */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-6 gap-x-3 items-center justify-items-center mt-4" id="knobs-grid">
                
                <ToyKnob
                  label="Cutoff"
                  value={settings.filterCutoff}
                  min={200}
                  max={6000}
                  step={50}
                  unit="Hz"
                  colorHex="#E07A5F"
                  onChange={(val) => setSettings(p => ({ ...p, filterCutoff: val }))}
                />

                <ToyKnob
                  label="Resonance"
                  value={settings.filterResonance}
                  min={1}
                  max={18}
                  step={0.5}
                  unit="Q"
                  colorHex="#3D5A80"
                  onChange={(val) => setSettings(p => ({ ...p, filterResonance: val }))}
                />

                <ToyKnob
                  label="Attack"
                  value={settings.attack}
                  min={0.01}
                  max={1.5}
                  step={0.05}
                  unit="s"
                  colorHex="#B5838D"
                  onChange={(val) => setSettings(p => ({ ...p, attack: val }))}
                />

                <ToyKnob
                  label="Release"
                  value={settings.release}
                  min={0.05}
                  max={2.5}
                  step={0.05}
                  unit="s"
                  colorHex="#B5838D"
                  onChange={(val) => setSettings(p => ({ ...p, release: val }))}
                />

                <ToyKnob
                  label="Echo Time"
                  value={settings.delayTime}
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  unit="s"
                  colorHex="#3D5A80"
                  onChange={(val) => setSettings(p => ({ ...p, delayTime: val }))}
                />

                <ToyKnob
                  label="Feedback"
                  value={settings.delayFeedback}
                  min={0.0}
                  max={0.8}
                  step={0.05}
                  unit="%"
                  colorHex="#E07A5F"
                  onChange={(val) => setSettings(p => ({ ...p, delayFeedback: val }))}
                />

              </div>

              {/* Pitch Octave and volume micro board - shifted slightly up with mb-4 */}
              <div className="flex flex-wrap items-center justify-between border-t-2 border-[#F0E6D5] mt-5 pt-4 gap-4 mb-4" id="micro-parameters">
                {/* Octave toy selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#8C8375] uppercase">Octave:</span>
                  <div className="inline-flex rounded-xl bg-[#EDE7DB] p-1 border border-[#DCD3C1]" id="octave-group">
                    {[3, 4, 5].map((o) => (
                      <button
                        key={o}
                        onClick={() => setSettings(p => ({ ...p, octave: o }))}
                        className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-display font-medium transition-all outline-none ${
                          settings.octave === o
                            ? 'bg-[#E07A5F] text-white shadow-sm'
                            : 'text-[#5C5346] hover:bg-[#FAF8F5]/80'
                        }`}
                        id={`octave-btn-${o}`}
                      >
                        {o === 3 ? 'Low' : o === 4 ? 'Mid' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Stop-Motion Status Light */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#8C8375] bg-[#EDE7DB] px-3 py-1.5 rounded-xl border border-[#DCD3C1]" id="stop-motion-status-badge">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse inline-block" />
                  <span>3D STOP-MOTION ACTIVE</span>
                </div>

                {/* Keyboard keys guide */}
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-[#8C8375] bg-[#EDE7DB] px-3 py-1 rounded-xl border border-[#DCD3C1]">
                  <Keyboard className="w-3.5 h-3.5 text-[#5C5346]" />
                  <span>PLAY TYPING KEYS:</span>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">A</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">S</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">D</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">F</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">G</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">H</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">J</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">K</kbd>
                </div>

                {/* Master Volume Slider */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#8C8375]" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={(e) => setSettings(p => ({ ...p, volume: Number(e.target.value) }))}
                    className="w-24 accent-[#E07A5F]"
                    id="volume-slider"
                  />
                  <span className="font-mono text-[9px] font-bold text-[#8C8375] w-6">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 LEFT: OSC WAVEFORM SELECTOR */}
          <div className="lg:col-span-1" id="waveform-column-wrapper">
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border-2 border-[#E9DFCF] shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between" id="osc-waveform-box">
              <span className="text-[10px] font-mono font-bold text-[#A69F90] uppercase tracking-wider block mb-2">
                ■ Osc Waveform
              </span>

              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 w-full" id="waveform-choices">
                  {SELECTION_MODES.map((mode) => {
                    const isActive = settings.waveform === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleWaveformChange(mode.id as OscillatorType)}
                        className={`cursor-pointer p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all outline-none active:scale-95 ${
                          isActive
                            ? 'bg-[#3D5A80] text-[#F4F1DE] border-transparent shadow-[0_3px_0_#2E4665]'
                            : 'bg-white text-[#5C5346] border-[#E2D9C5] hover:bg-[#FAF8F5]'
                        }`}
                        id={`wave-btn-${mode.id}`}
                      >
                        <span className="text-xs font-display font-medium">{mode.label}</span>
                        <span className={`text-[8px] mt-0.5 ${isActive ? 'text-white/60' : 'text-[#A69F90]'}`}>
                          {mode.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 RIGHT: KEYBOARD */}
          <div className="lg:col-span-3" id="keyboard-column-wrapper">
            <div className="relative bg-[#D2C8B5] rounded-3xl p-4 shadow-[inset_0_4px_8px_rgba(40,30,20,0.12),_0_2px_4px_rgba(255,255,255,0.7)] border-2 border-[#C0B4A2] h-full z-10" id="keyboard-wrapper">
              
              {/* Wooden keys cap guard */}
              <div className="absolute top-0 inset-x-8 h-3.5 bg-gradient-to-b from-[#A69986] to-[#C2B5A1] rounded-b-lg z-20 shadow-md" />

              {/* Floating hands element */}
              <ToyHands
                activeNotes={activeKeys}
                allNotes={SYNTH_NOTES}
                hoveredKeyId={hoveredKeyId}
                sequencerStepIndex={currentStep}
                isSequencerPlaying={isSequencerPlaying}
              />

              {/* Dynamic Keys Bed */}
              <div className="relative flex gap-1.5 h-44 cursor-pointer" id="keys-bed">
                {SYNTH_NOTES.map((note) => {
                  const isActive = activeKeys.includes(note.id);
                  
                  // Construct customized heavy wooden style bottom margins
                  // Shadow colors are slightly darker terracotta, lilac, or indigo
                  let shadeHex = '#B05943'; // terracotta shadow
                  if (note.colorClass.includes('B5838D')) shadeHex = '#8B5C65'; // lilac shadow
                  else if (note.colorClass.includes('3D5A80')) shadeHex = '#273C58'; // indigo shadow
                  else if (note.colorClass.includes('F4F1DE')) shadeHex = '#CDC8AB'; // cream shadow
                  else if (note.colorClass.includes('C58071')) shadeHex = '#92584A'; // brown shadow

                  return (
                    <button
                      key={note.id}
                      onPointerDown={() => handleKeyStart(note)}
                      onPointerUp={() => handleKeyStop(note)}
                      onPointerLeave={() => {
                        handleKeyStop(note);
                        setHoveredKeyId(null);
                      }}
                      onPointerEnter={() => setHoveredKeyId(note.id)}
                      className={`cursor-pointer flex-1 rounded-2xl relative select-none outline-none transition-all duration-75 ${note.colorClass}`}
                      style={{
                        touchAction: 'none',
                        transform: isActive ? 'translateY(6px)' : 'translateY(0px)',
                        boxShadow: isActive
                          ? `0 2px 0 ${shadeHex}, 0 2px 4px rgba(0,0,0,0.3)`
                          : `0 8px 0 ${shadeHex}, 0 10px 16px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)`
                      }}
                      id={`key-btn-${note.id}`}
                    >
                      {/* Top Matte Ceramic Shine overlay */}
                      <div className="absolute top-1.5 inset-x-2 h-4 bg-white/20 rounded-t-xl pointer-events-none" />

                      {/* Music Label at the bottom of the peg key */}
                      <div className="absolute bottom-3 inset-x-0 text-center flex flex-col items-center justify-end pointer-events-none">
                        <span className="text-xs font-display font-black tracking-tight text-[#423C34] leading-tight select-none">
                          {note.name}
                        </span>
                        <span className="text-[9px] font-medium text-[#423C34]/60 uppercase tracking-wider block select-none">
                          {note.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM: THE MELODIC SEQUENCER GRID INTEGRATION */}
        <StepSequencer
          notes={SYNTH_NOTES}
          settings={settings}
          sequencerGrid={sequencerGrid}
          setSequencerGrid={setSequencerGrid}
          currentStep={currentStep}
          isPlaying={isSequencerPlaying}
          setIsPlaying={setIsSequencerPlaying}
          bpm={bpm}
          setBpm={setBpm}
        />



      </div>

      {/* Outer Info Cards - Non-distracting */}
      <div className="w-full max-w-5xl mt-6 px-4 py-3 bg-white/45 backdrop-blur-sm border border-[#EBE3D3] rounded-2xl text-[11px] text-[#8C8375] leading-relaxed flex items-start gap-2.5" id="help-card">
        <Info className="w-4 h-4 text-[#B5838D] shrink-0 mt-0.5" />
        <div>
          <p>
            <strong>Aesthetic Heritage:</strong> Inspired by the tactile qualities of painted matte polymer clay dolls and traditional stop-motion sets. Hand movements simulate smooth perfect white peg stub-hands hovering over colorful instruments. Toggles including a solid <strong>Chroma Key Green Screen Backdrop</strong> serve designers wishing to screen-capture stop-motion play sequences. Play with touch, mouse clicks, or computer typing keys (Row <kbd className="px-1 bg-white border shadow-sm">A</kbd> through <kbd className="px-1 bg-white border shadow-sm">K</kbd>).
          </p>
        </div>
      </div>
    </div>
  );
}
