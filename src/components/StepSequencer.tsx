import React from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, HelpCircle } from 'lucide-react';
import { NoteItem, SequencerStep, SynthSettings } from '../types';
import { triggerSingleShortNote } from '../utils/audio';

interface StepSequencerProps {
  notes: NoteItem[];
  settings: SynthSettings;
  sequencerGrid: Record<string, boolean[]>; // map of noteId -> array of 8 boolean steps
  setSequencerGrid: React.Dispatch<React.SetStateAction<Record<string, boolean[]>>>;
  currentStep: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
}

export default function StepSequencer({
  notes,
  settings,
  sequencerGrid,
  setSequencerGrid,
  currentStep,
  isPlaying,
  setIsPlaying,
  bpm,
  setBpm,
}: StepSequencerProps) {
  
  const stepsCount = 8;

  const toggleStep = (noteId: string, index: number) => {
    setSequencerGrid(prev => {
      const currentSteps = prev[noteId] ? [...prev[noteId]] : Array(stepsCount).fill(false);
      currentSteps[index] = !currentSteps[index];
      return {
        ...prev,
        [noteId]: currentSteps
      };
    });

    // Play a preview of the note if toggled ON
    if (!sequencerGrid[noteId]?.[index]) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        triggerSingleShortNote(note.freq, settings, 0.05, 0.2);
      }
    }
  };

  const clearGrid = () => {
    setSequencerGrid(() => {
      const cleared: Record<string, boolean[]> = {};
      notes.forEach(note => {
        cleared[note.id] = Array(stepsCount).fill(false);
      });
      return cleared;
    });
  };

  const loadHappyLoop = () => {
    setSequencerGrid(() => {
      const loop: Record<string, boolean[]> = {};
      notes.forEach(note => {
        loop[note.id] = Array(stepsCount).fill(false);
      });
      
      // Let's program a nice little terracotta/indigo folk melody
      // Index 0 to 7:
      // Note indices: 0: C4, 1: D4, 2: E4, 3: F4, 4: G4, 5: A4, 6: B4, 7: C5
      if (loop['C4']) loop['C4'][0] = true;
      if (loop['E4']) loop['E4'][2] = true;
      if (loop['G4']) loop['G4'][4] = true;
      if (loop['C5']) {
        loop['C5'][6] = true;
        loop['C5'][7] = true;
      }
      if (loop['A4']) loop['A4'][5] = true;
      if (loop['D4']) loop['D4'][1] = true;
      if (loop['F4']) loop['F4'][3] = true;
      
      return loop;
    });
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl p-6 border-2 border-[#E9DFCF] shadow-[0_8px_16px_-4px_rgba(139,115,85,0.06),_inset_0_2px_4px_rgba(255,255,255,0.9)] mt-6" id="sequencer-container">
      {/* Sequencer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b-2 border-[#F0E6D5] pb-4">
        <div>
          <h3 className="text-sm font-display font-bold text-[#4E4537] uppercase tracking-wider flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B5838D]" />
            Stop-Motion Sequence Grid
          </h3>
          <p className="text-[11px] font-sans text-[#8C8375] mt-1">
            Tap clay dots below to program a loop. The ball hands will dance along with active notes!
          </p>
        </div>

        {/* Sequencer Controls */}
        <div className="flex items-center gap-2.5">
          {/* Play Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`cursor-pointer px-4 py-2 rounded-2xl font-display font-medium text-xs flex items-center gap-1.5 transition-all outline-none border active:scale-95 ${
              isPlaying
                ? 'bg-[#B5838D] text-white border-[#9E6E77] shadow-[0_3px_0_#93636D,0_4px_6px_rgba(0,0,0,0.1)]'
                : 'bg-[#F4F1DE] text-[#5C5346] border-[#DCD3C1] shadow-[0_3px_0_#D3C9B5,0_4px_6px_rgba(0,0,0,0.05)] hover:bg-[#ECE6D8]'
            }`}
            id="sequencer-play-btn"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#5C5346]" fill="#5C5346" />
                <span>Play Loop</span>
              </>
            )}
          </button>

          {/* Load Preset Loop */}
          <button
            onClick={loadHappyLoop}
            className="cursor-pointer px-3 py-2 rounded-xl text-xs font-display font-medium bg-[#3D5A80] text-white border border-[#324C6D] shadow-[0_3px_0_#2B3F5B,0_4px_6px_rgba(0,0,0,0.1)] hover:bg-[#354F70] active:scale-95 flex items-center gap-1.5 outline-none"
            title="Load cozy clay melody"
            id="sequencer-melody-btn"
          >
            <Plus className="w-3 h-3" />
            <span>Load Mel</span>
          </button>

          {/* Reset Grid */}
          <button
            onClick={clearGrid}
            className="cursor-pointer p-2 rounded-xl bg-white text-[#8C8375] border border-[#DCD3C1] hover:bg-[#FAF8F5] active:scale-95 flex items-center justify-center outline-none"
            title="Clear Sequence"
            id="sequencer-clear-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* BPM Input */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#DCD3C1] bg-white px-2 py-1" id="sequencer-tempo-box">
            <span className="text-[9px] font-mono font-bold text-[#A69F90] uppercase">BPM</span>
            <input
              type="number"
              min="60"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Math.max(60, Math.min(240, Number(e.target.value) || 120)))}
              className="w-10 font-mono font-bold text-xs text-[#5C5346] text-center bg-transparent border-none outline-none p-0 focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto" id="sequencer-table-wrapper">
        <div className="min-w-[480px]">
          {/* Columns Header (Step lights) */}
          <div className="flex mb-1 ml-16">
            {Array(stepsCount).fill(0).map((_, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex justify-center py-1"
                id={`step-col-indicator-${idx}`}
              >
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-100 ${
                    currentStep === idx 
                      ? 'bg-[#E15A3E] shadow-[0_0_8px_#E15A3E] scale-125' 
                      : 'bg-[#DCD3C1]'
                  }`} 
                />
              </div>
            ))}
          </div>

          {/* Sequence Rows */}
          <div className="flex flex-col gap-2">
            {notes.map((note) => {
              const steps = sequencerGrid[note.id] || Array(stepsCount).fill(false);
              return (
                <div key={note.id} className="flex items-center gap-3" id={`seq-row-${note.id}`}>
                  {/* Note Label */}
                  <div className="w-14 shrink-0 flex items-center justify-between bg-white border border-[#ECE6D8] rounded-lg px-2 py-1 text-[11px] font-display font-semibold text-[#5C5346]">
                    <span>{note.name}</span>
                    <span className="text-[9px] text-[#A69F90]">{note.label}</span>
                  </div>

                  {/* 8 trigger slots */}
                  <div className="flex-1 flex gap-2">
                    {steps.map((active, stepIdx) => {
                      // Construct dynamic clay color based on note
                      let activeBg = 'bg-[#E07A5F] shadow-[0_3px_0_#CD6E54]'; // terracotta default
                      if (note.colorClass.includes('B5838D')) {
                        activeBg = 'bg-[#B5838D] shadow-[0_3px_0_#9E6E77]'; // lilac
                      } else if (note.colorClass.includes('3D5A80')) {
                        activeBg = 'bg-[#3D5A80] shadow-[0_3px_0_#2F4869]'; // indigo
                      } else if (note.colorClass.includes('F4F1DE')) {
                        activeBg = 'bg-[#EBE3B8] shadow-[0_3px_0_#D5CC9A]'; // cream
                      }

                      return (
                        <button
                          key={stepIdx}
                          onClick={() => toggleStep(note.id, stepIdx)}
                          className={`cursor-pointer flex-1 h-10 rounded-xl transition-all border outline-none active:scale-95 ${
                            active
                              ? `${activeBg} border-transparent text-white`
                              : currentStep === stepIdx
                                ? 'bg-[#ECE6D8]/50 border-[#D2C8B5] hover:bg-[#E2D9C5]'
                                : 'bg-white border-[#E2D9C5] hover:bg-[#FAF8F5]'
                          }`}
                          id={`btn-step-${note.id}-${stepIdx}`}
                        >
                          <div 
                            className={`mx-auto w-3 h-3 rounded-full transition-all ${
                              active 
                                ? 'bg-white/80 scale-110 shadow-inner' 
                                : currentStep === stepIdx
                                  ? 'bg-[#E15A3E]/30 scale-75'
                                  : 'bg-[#E6DEC9]'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Footer - micro keyboard hints */}
      <div className="flex items-center justify-center mt-3 text-[10px] text-[#A69F90] px-1 font-mono">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 inline" /> Hover keys to position clay ball-hands
        </span>
      </div>
    </div>
  );
}
