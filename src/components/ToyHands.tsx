import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteItem } from '../types';

interface ToyHandsProps {
  activeNotes: string[]; // Active note IDs currently triggered
  allNotes: NoteItem[];
  hoveredKeyId: string | null;
  sequencerStepIndex: number;
  isSequencerPlaying: boolean;
}

export default function ToyHands({
  activeNotes,
  allNotes,
  hoveredKeyId,
  sequencerStepIndex,
  isSequencerPlaying,
}: ToyHandsProps) {
  // Determine coordinate layout mapping for notes
  // To place hands above the keys appropriately:
  // We can position them relative to note keys, or assign predefined coordinates
  // Left hand handles lower notes (first 4), Right hand handles higher notes (last 4)
  
  const getNoteIndex = (noteId: string): number => {
    return allNotes.findIndex(n => n.id === noteId);
  };

  // Find target coordinates based on active state or hover
  let leftHandTargetIndex = 1; // Default hover position over 'D'
  let rightHandTargetIndex = 5; // Default hover position over 'A'

  const activeIndices = activeNotes.map(id => getNoteIndex(id)).filter(i => i !== -1);

  if (activeIndices.length > 0) {
    // Distribute playing notes between left and right hands
    const lowerNotes = activeIndices.filter(i => i <= 3);
    const upperNotes = activeIndices.filter(i => i > 3);

    if (lowerNotes.length > 0) {
      leftHandTargetIndex = Math.min(...lowerNotes);
    }
    if (upperNotes.length > 0) {
      rightHandTargetIndex = Math.max(...upperNotes);
    } else if (activeIndices.length > 1 && lowerNotes.length > 1) {
      // If two lower notes are active, split them
      leftHandTargetIndex = Math.min(...lowerNotes);
      rightHandTargetIndex = Math.max(...lowerNotes);
    }
  } else if (hoveredKeyId) {
    const hoverIdx = getNoteIndex(hoveredKeyId);
    if (hoverIdx !== -1) {
      if (hoverIdx <= 3) {
        leftHandTargetIndex = hoverIdx;
      } else {
        rightHandTargetIndex = hoverIdx;
      }
    }
  } else if (isSequencerPlaying) {
    // Make them dance in rhythm during step sequences!
    // Left hand bounces, right hand hops
    leftHandTargetIndex = sequencerStepIndex % 4;
    rightHandTargetIndex = 4 + (sequencerStepIndex % 4);
  }

  // Each key width is roughly 12.5% of the total keyboard width.
  // We can map note index to horizontal percentage position.
  const getHandXPercent = (index: number) => {
    return `${(index * 12.5) + 6.25}%`;
  };

  const isLeftHandActive = activeIndices.some(i => i <= 3) || (hoveredKeyId && getNoteIndex(hoveredKeyId) <= 3);
  const isRightHandActive = activeIndices.some(i => i > 3) || (hoveredKeyId && getNoteIndex(hoveredKeyId) > 3);

  return (
    <div className="absolute inset-x-4 -top-12 bottom-0 pointer-events-none z-30" id="toy-hands-overlay">
      {/* Container tracking space */}
      <div className="relative w-full h-full">
        {/* Left Toy Hand (White Sphere) */}
        <motion.div
          className="absolute w-12 h-12 rounded-full shadow-[0_12px_24px_-4px_rgba(30,25,20,0.25),_inset_0_-4px_8px_rgba(0,0,0,0.1),_inset_4px_4px_8px_rgba(255,255,255,0.9)] flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FAFAFA 40%, #E8E5DF 85%, #D3CDC1 100%)',
            left: getHandXPercent(leftHandTargetIndex),
            transform: 'translateX(-50%)',
          }}
          animate={{
            x: 0,
            y: isLeftHandActive ? 22 : 0, // Depress down into the key when active!
            scale: isLeftHandActive ? 0.94 : 1.0,
            rotate: isLeftHandActive ? -10 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 140,
            damping: 14,
            mass: 0.9,
          }}
          id="left-toy-hand"
        >
          {/* Subtle wood-joint arm shadow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-2 h-8 bg-gradient-to-b from-transparent to-[#D2C8B5]/30 rounded-t-full pointer-events-none" />
        </motion.div>

        {/* Right Toy Hand (White Sphere) */}
        <motion.div
          className="absolute w-12 h-12 rounded-full shadow-[0_12px_24px_-4px_rgba(30,25,20,0.25),_inset_0_-4px_8px_rgba(0,0,0,0.1),_inset_4px_4px_8px_rgba(255,255,255,0.9)] flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FAFAFA 40%, #E8E5DF 85%, #D3CDC1 100%)',
            left: getHandXPercent(rightHandTargetIndex),
            transform: 'translateX(-50%)',
          }}
          animate={{
            x: 0,
            y: isRightHandActive ? 22 : 2, // Depress down into the key when active!
            scale: isRightHandActive ? 0.94 : 1.0,
            rotate: isRightHandActive ? 10 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 140,
            damping: 14,
            mass: 0.9,
          }}
          id="right-toy-hand"
        >
          {/* Subtle wood-joint arm shadow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-2 h-8 bg-gradient-to-b from-transparent to-[#D2C8B5]/30 rounded-t-full pointer-events-none opacity-80" />
        </motion.div>
      </div>
    </div>
  );
}
