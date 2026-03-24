/**
 * SetRow — renders a single set with reps, weight, RPE inputs.
 *
 * Performance:
 * - Uses LOCAL state for inputs (not Zustand) to avoid store-triggered re-renders on every keystroke.
 * - Flushes to Zustand store only on blur (field exit).
 * - Wrapped in React.memo with a custom equality check.
 */
import React, { useState, useCallback, memo } from 'react';
import { SetInput } from '../ui/Input.jsx';
import { PRBadge } from '../ui/Badge.jsx';
import { hapticLight, hapticMedium } from '../../lib/haptics.js';

const SetRow = memo(function SetRow({
  set,
  index,
  exerciseId,
  showRPE,
  onUpdate,
  onComplete,
  onRemove,
  onTimerStart,
}) {
  // Local controlled state — only pushes to store on blur
  const [weight, setWeight] = useState(set.weight ?? '');
  const [reps,   setReps]   = useState(set.reps   ?? '');
  const [rpe,    setRpe]    = useState(set.rpe     ?? '');

  const flush = useCallback(() => {
    onUpdate(exerciseId, set.id, 'weight', weight === '' ? null : Number(weight));
    onUpdate(exerciseId, set.id, 'reps',   reps   === '' ? null : Number(reps));
    onUpdate(exerciseId, set.id, 'rpe',    rpe    === '' ? null : Number(rpe));
  }, [weight, reps, rpe, exerciseId, set.id, onUpdate]);

  const handleComplete = useCallback(() => {
    flush();
    hapticLight();
    onComplete(exerciseId, set.id);
    // Start rest timer automatically
    onTimerStart?.();
  }, [flush, exerciseId, set.id, onComplete, onTimerStart]);

  const handleRemove = useCallback(() => {
    hapticMedium();
    onRemove(exerciseId, set.id);
  }, [exerciseId, set.id, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-150
        ${set.completed ? 'bg-primary-500/10' : 'bg-transparent'}
      `}
    >
      {/* Set number */}
      <span className="w-6 text-center text-xs font-bold text-surface-500 shrink-0">
        {index + 1}
      </span>

      {/* PR badge (if applicable) */}
      {set.isPR && <PRBadge />}

      {/* Weight */}
      <SetInput
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={flush}
        disabled={set.completed}
        className="flex-1"
      />

      {/* × separator */}
      <span className="text-surface-600 text-xs shrink-0">×</span>

      {/* Reps */}
      <SetInput
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={flush}
        disabled={set.completed}
        className="flex-1"
      />

      {/* RPE (optional column) */}
      {showRPE && (
        <SetInput
          placeholder="RPE"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          onBlur={flush}
          disabled={set.completed}
          className="flex-1"
          min="1"
          max="10"
          step="0.5"
        />
      )}

      {/* Complete checkbox */}
      <button
        onClick={handleComplete}
        className={`
          tap-target w-9 h-9 rounded-lg shrink-0 flex items-center justify-center transition-all
          ${set.completed
            ? 'bg-primary-600 text-white'
            : 'bg-surface-800 text-surface-500 hover:bg-surface-700'
          }
        `}
        aria-label={set.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </button>

      {/* Remove set */}
      <button
        onClick={handleRemove}
        className="tap-target w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        aria-label="Remove set"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}, (prev, next) => {
  // Custom memo: only re-render if the set data or handlers changed
  return (
    prev.set.id        === next.set.id        &&
    prev.set.completed === next.set.completed &&
    prev.set.isPR      === next.set.isPR      &&
    prev.showRPE       === next.showRPE       &&
    prev.onUpdate      === next.onUpdate      &&
    prev.onComplete    === next.onComplete    &&
    prev.onRemove      === next.onRemove
  );
});

export default SetRow;
