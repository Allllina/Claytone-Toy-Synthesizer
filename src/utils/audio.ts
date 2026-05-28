import { SynthSettings } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let delayNode: DelayNode | null = null;
let delayFeedback: GainNode | null = null;

// Keep track of active oscillators and their gain nodes for polyphony
const activeNotes: Map<string, { oscillator: OscillatorNode; gainNode: GainNode; startTime: number }> = new Map();

/**
 * Ensures the AudioContext is initialized and running.
 * Browsers require a user interaction to start the AudioContext.
 */
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Set up master routing
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.4, audioCtx.currentTime); // Safe volume defaults

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1500, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(3.0, audioCtx.currentTime);

    // Set up cozy feedback delay
    delayNode = audioCtx.createDelay(2.0);
    delayNode.delayTime.setValueAtTime(0.3, audioCtx.currentTime);

    delayFeedback = audioCtx.createGain();
    delayFeedback.gain.setValueAtTime(0.4, audioCtx.currentTime);

    // Delay routing: input -> delayNode -> delayFeedback -> back to delayNode
    // Also delayNode -> filterNode
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);

    // Connections
    // Oscillator (created per note) -> GainNode (per note) -> filterNode -> masterGain -> destination
    // Also filterNode -> delayNode -> masterGain (parallel delay mix)
    filterNode.connect(masterGain);
    filterNode.connect(delayNode);
    delayNode.connect(masterGain);

    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
}

/**
 * Starts playing a synth note poliphonically.
 */
export function startSynthNote(noteId: string, frequency: number, settings: SynthSettings) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // If already playing, stop the existing node
    stopSynthNote(noteId, settings);

    // Create oscillator and its envelope gain node
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = settings.waveform;
    osc.frequency.setValueAtTime(frequency * Math.pow(2, settings.octave - 4), now);
    osc.detune.setValueAtTime(settings.detune || 0, now);

    // Apply filter settings
    if (filterNode) {
      filterNode.frequency.exponentialRampToValueAtTime(
        Math.max(20, Math.min(22000, settings.filterCutoff)),
        now + 0.1
      );
      filterNode.Q.setValueAtTime(settings.filterResonance, now);
    }

    // Apply delay settings
    if (delayNode && delayFeedback) {
      delayNode.delayTime.linearRampToValueAtTime(settings.delayTime, now + 0.05);
      delayFeedback.gain.linearRampToValueAtTime(settings.delayFeedback, now + 0.05);
    }

    // Apply master volume
    if (masterGain) {
      masterGain.gain.setValueAtTime(settings.volume * 0.5, now);
    }

    // Amplitude ADSR: Attack phase
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(1.0, now + settings.attack);

    // Route individual note to active lowpass filter
    if (filterNode) {
      osc.connect(noteGain);
      noteGain.connect(filterNode);
    }

    osc.start(now);

    // Store references
    activeNotes.set(noteId, {
      oscillator: osc,
      gainNode: noteGain,
      startTime: now
    });
  } catch (error) {
    console.error('Failed to play note:', error);
  }
}

/**
 * Stops playing a synth note, initiating the Release envelope phase.
 */
export function stopSynthNote(noteId: string, settings: SynthSettings) {
  const noteObj = activeNotes.get(noteId);
  if (!noteObj) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const { oscillator, gainNode } = noteObj;

    // Soft release phase instead of abrupt cutoff
    gainNode.gain.cancelScheduledValues(now);
    // Current actual volume scaled down to 0
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + settings.release);

    // Stop and cleanup oscillator node after release duration completes
    oscillator.stop(now + settings.release);
    activeNotes.delete(noteId);
  } catch (error) {
    console.error('Failed to release note:', error);
  }
}

/**
 * Triggers a quick temporary note (e.g. for sequencer play) with direct release duration
 */
export function triggerSingleShortNote(frequency: number, settings: SynthSettings, attackTime = 0.05, releaseTime = 0.3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = settings.waveform;
    osc.frequency.setValueAtTime(frequency * Math.pow(2, settings.octave - 4), now);
    osc.detune.setValueAtTime(settings.detune || 0, now);

    if (filterNode) {
      filterNode.frequency.setValueAtTime(settings.filterCutoff, now);
      filterNode.Q.setValueAtTime(settings.filterResonance, now);
    }

    if (masterGain) {
      masterGain.gain.setValueAtTime(settings.volume * 0.5, now);
    }

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(1.0, now + attackTime);
    noteGain.gain.setValueAtTime(1.0, now + attackTime + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + 0.02 + releaseTime);

    if (filterNode) {
      osc.connect(noteGain);
      noteGain.connect(filterNode);
    }

    osc.start(now);
    osc.stop(now + attackTime + 0.02 + releaseTime + 0.1);
  } catch (err) {
    console.error('Failed short note:', err);
  }
}
