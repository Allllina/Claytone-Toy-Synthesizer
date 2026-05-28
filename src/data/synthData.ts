import { NoteItem, Preset } from '../types';

export const SYNTH_PRESETS: Preset[] = [
  {
    name: 'Cozy Polymer',
    description: 'Soft, dry envelope with generous lowpass filtering for a powdery clay pluck.',
    settings: {
      waveform: 'triangle',
      filterCutoff: 1200,
      filterResonance: 3,
      attack: 0.05,
      release: 0.4,
      detune: 0,
      delayTime: 0.35,
      delayFeedback: 0.45,
      octave: 4,
      volume: 0.75
    }
  },
  {
    name: 'Terracotta Bass',
    description: 'Growly, deep analog square wave with dynamic filter envelope response.',
    settings: {
      waveform: 'sawtooth',
      filterCutoff: 650,
      filterResonance: 8,
      attack: 0.08,
      release: 0.5,
      detune: -15,
      delayTime: 0.15,
      delayFeedback: 0.2,
      octave: 3,
      volume: 0.7
    }
  },
  {
    name: 'Indigo Echoes',
    description: 'Ethereal, ringing resonance perfect for creating ambient, space-toy textures.',
    settings: {
      waveform: 'sine',
      filterCutoff: 2500,
      filterResonance: 12,
      attack: 0.3,
      release: 1.5,
      detune: 10,
      delayTime: 0.6,
      delayFeedback: 0.65,
      octave: 5,
      volume: 0.65
    }
  },
  {
    name: 'Peg Doll Beeps',
    description: 'Playful, clean retro sound resembling a simple wooden physical toy synthesizer.',
    settings: {
      waveform: 'square',
      filterCutoff: 1800,
      filterResonance: 4,
      attack: 0.02,
      release: 0.2,
      detune: 0,
      delayTime: 0.2,
      delayFeedback: 0.1,
      octave: 4,
      volume: 0.6
    }
  }
];

export const SYNTH_NOTES: NoteItem[] = [
  { id: 'C4', name: 'C', freq: 261.63, label: 'Do', colorClass: 'bg-[#E07A5F]', hex: '#E07A5F', octaveOffset: 0 },       // Terracotta
  { id: 'D4', name: 'D', freq: 293.66, label: 'Re', colorClass: 'bg-[#B5838D]', hex: '#B5838D', octaveOffset: 0 },       // Dusty Lilac
  { id: 'E4', name: 'E', freq: 329.63, label: 'Mi', colorClass: 'bg-[#3D5A80]', hex: '#3D5A80', octaveOffset: 0 },       // Indigo / Slate Blue
  { id: 'F4', name: 'F', freq: 349.23, label: 'Fa', colorClass: 'bg-[#E07A5F]', hex: '#E07A5F', octaveOffset: 0 },       // Terracotta accent
  { id: 'G4', name: 'G', freq: 392.00, label: 'Sol', colorClass: 'bg-[#F4F1DE]', hex: '#F4F1DE', octaveOffset: 0 },      // Soft Cream/Sand
  { id: 'A4', name: 'A', freq: 440.00, label: 'La', colorClass: 'bg-[#B5838D]', hex: '#B5838D', octaveOffset: 0 },       // Dusty Lilac accent
  { id: 'B4', name: 'B', freq: 493.88, label: 'Ti', colorClass: 'bg-[#3D5A80]', hex: '#3D5A80', octaveOffset: 0 },       // Indigo Accent
  { id: 'C5', name: 'C#', freq: 523.25, label: 'Do+', colorClass: 'bg-[#C58071]', hex: '#C58071', octaveOffset: 1 }      // Muted Red-Brown
];

// High-fidelity sequencer default lines
export const DEFAULT_SEQUENCER_TEMPO = 115;
export const SELECTION_MODES = [
  { id: 'triangle', label: '▲ Tri', desc: 'Warm' },
  { id: 'sine', label: '● Sine', desc: 'Soft' },
  { id: 'square', label: '■ Squ', desc: 'Chippy' },
  { id: 'sawtooth', label: '▼ Saw', desc: 'Bright' }
];
