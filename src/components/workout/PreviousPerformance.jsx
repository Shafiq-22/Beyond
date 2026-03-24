import React, { useEffect, useState, memo } from 'react';
import { getPreviousSets } from '../../lib/db.js';

/**
 * Shows the previous session's sets for an exercise as subtle ghost text.
 * Loaded once on mount; does not re-render with the logger.
 */
export const PreviousPerformance = memo(function PreviousPerformance({
  exerciseId,
  sessionId,
}) {
  const [prevSets, setPrevSets] = useState([]);

  useEffect(() => {
    if (!exerciseId) return;
    getPreviousSets(exerciseId, sessionId).then((sets) => {
      const sorted = [...sets].sort((a, b) => a.set_number - b.set_number);
      setPrevSets(sorted);
    });
  }, [exerciseId, sessionId]);

  if (!prevSets.length) return null;

  return (
    <div className="px-4 pb-2">
      <p className="text-[11px] text-surface-500 mb-1.5 font-medium uppercase tracking-wide">
        Previous
      </p>
      <div className="flex flex-wrap gap-2">
        {prevSets.map((s, i) => (
          <span
            key={s.id ?? i}
            className="text-xs bg-surface-800 text-surface-400 rounded-lg px-2.5 py-1 border border-surface-700"
          >
            {s.set_number ? `Set ${s.set_number}: ` : ''}
            {s.weight != null ? `${s.weight}kg` : '—'}
            {s.reps   != null ? ` × ${s.reps}` : ''}
            {s.rpe    != null ? ` @ ${s.rpe}` : ''}
          </span>
        ))}
      </div>
    </div>
  );
});
