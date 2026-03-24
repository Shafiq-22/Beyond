import React, { useState, useCallback, memo } from 'react';
import SetRow from './SetRow.jsx';
import { PreviousPerformance } from './PreviousPerformance.jsx';
import { Button } from '../ui/Button.jsx';
import { hapticMedium } from '../../lib/haptics.js';

const ExerciseCard = memo(function ExerciseCard({
  exercise,       // { exerciseId, exerciseName, muscleGroup, sets }
  sessionId,
  showRPE,
  onAddSet,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
  onRemoveExercise,
  onTimerStart,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddSet = useCallback(() => {
    hapticMedium();
    // Prefill from last set if it exists
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const prefill = lastSet
      ? { weight: lastSet.weight, reps: lastSet.reps }
      : {};
    onAddSet(exercise.exerciseId, prefill);
  }, [exercise, onAddSet]);

  const handleRemoveExercise = useCallback(() => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2500);
      return;
    }
    onRemoveExercise(exercise.exerciseId);
  }, [showConfirm, exercise.exerciseId, onRemoveExercise]);

  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const totalCount     = exercise.sets.length;

  return (
    <div className="card mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 gap-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-1 flex items-center gap-3 text-left tap-target"
        >
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">{exercise.exerciseName}</p>
            <p className="text-xs text-surface-500 capitalize mt-0.5">
              {exercise.muscleGroup?.replace('_', ' ')}
              {totalCount > 0 && (
                <span className="ml-2 text-primary-400">
                  {completedCount}/{totalCount} sets
                </span>
              )}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-surface-500 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Remove exercise */}
        <button
          onClick={handleRemoveExercise}
          className={`
            tap-target w-8 h-8 flex items-center justify-center rounded-lg transition-colors
            ${showConfirm
              ? 'bg-red-500/20 text-red-400'
              : 'text-surface-600 hover:text-red-400 hover:bg-red-400/10'
            }
          `}
          aria-label="Remove exercise"
        >
          {showConfirm ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Previous performance */}
          <PreviousPerformance
            exerciseId={exercise.exerciseId}
            sessionId={sessionId}
          />

          {/* Column headers */}
          {exercise.sets.length > 0 && (
            <div className={`
              flex items-center gap-2 px-4 pb-1
              text-[10px] font-semibold text-surface-600 uppercase tracking-wider
            `}>
              <span className="w-6 text-center">#</span>
              <span className="flex-1 text-center">kg</span>
              <span className="w-3" />
              <span className="flex-1 text-center">reps</span>
              {showRPE && <span className="flex-1 text-center">rpe</span>}
              <span className="w-9" />
              <span className="w-8" />
            </div>
          )}

          {/* Sets */}
          {exercise.sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              index={i}
              exerciseId={exercise.exerciseId}
              showRPE={showRPE}
              onUpdate={onUpdateSet}
              onComplete={onToggleComplete}
              onRemove={onRemoveSet}
              onTimerStart={onTimerStart}
            />
          ))}

          {/* Add set button */}
          <div className="px-4 pt-2 pb-4">
            <button
              onClick={handleAddSet}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-surface-700 text-surface-500 hover:text-primary-400 hover:border-primary-500/40 transition-colors text-sm font-medium active:scale-[0.99]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Set
            </button>
          </div>
        </>
      )}
    </div>
  );
}, (prev, next) => {
  // Re-render only when the exercise's own data changes
  return (
    prev.exercise        === next.exercise        &&
    prev.showRPE         === next.showRPE         &&
    prev.onAddSet        === next.onAddSet        &&
    prev.onUpdateSet     === next.onUpdateSet     &&
    prev.onToggleComplete=== next.onToggleComplete&&
    prev.onRemoveSet     === next.onRemoveSet     &&
    prev.onRemoveExercise=== next.onRemoveExercise
  );
});

export default ExerciseCard;
