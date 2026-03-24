import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout }    from '../hooks/useWorkout.js';
import { useRestTimer }  from '../hooks/useRestTimer.js';
import { useExercises }  from '../hooks/useExercises.js';
import ExerciseCard          from '../components/workout/ExerciseCard.jsx';
import { AddExerciseModal }  from '../components/workout/AddExerciseModal.jsx';
import { RestTimerBar }      from '../components/workout/RestTimerBar.jsx';
import { Button }            from '../components/ui/Button.jsx';
import { TopBar }            from '../components/layout/TopBar.jsx';
import useRoutineStore       from '../stores/routineStore.js';

function formatDuration(startedAt) {
  const ms = Date.now() - new Date(startedAt).getTime();
  const s  = Math.floor(ms / 1000);
  const m  = Math.floor(s / 60);
  const h  = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s % 60}s`;
}

export default function WorkoutPage() {
  const navigate     = useNavigate();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRPE,         setShowRPE]         = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [finishing,       setFinishing]       = useState(false);
  const [sessionName,     setSessionName]     = useState('');
  const [showNameInput,   setShowNameInput]   = useState(false);
  const nameInputRef = useRef(null);

  const {
    activeSession,
    isSyncing,
    startSession,
    discardSession,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    toggleSetComplete,
    removeSet,
    finishSession,
    getTotalVolume,
    getCompletedSetsCount,
  } = useWorkout();

  const timer = useRestTimer(90);
  const { exercises: allExercises } = useExercises();
  const routines = useRoutineStore((s) => s.routines);

  // ── Stable callbacks (prevent ExerciseCard re-renders) ───────────────────
  const handleAddSet        = useCallback(addSet,           [addSet]);
  const handleUpdateSet     = useCallback(updateSet,        [updateSet]);
  const handleToggleComplete= useCallback(toggleSetComplete,[toggleSetComplete]);
  const handleRemoveSet     = useCallback(removeSet,        [removeSet]);
  const handleRemoveExercise= useCallback(removeExercise,   [removeExercise]);
  const handleTimerStart    = useCallback(() => timer.start(), [timer.start]);

  // ── No active session ─────────────────────────────────────────────────────
  if (!activeSession) {
    return (
      <div className="min-h-[80dvh] flex flex-col">
        <TopBar title="Start Workout" />

        <div className="flex-1 px-4 py-6 flex flex-col gap-4">
          {/* Quick start */}
          <Button
            onClick={() => startSession('Quick Workout')}
            className="w-full"
            size="lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
            </svg>
            Quick Start
          </Button>

          {/* Start from routine */}
          {routines.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                From Routine
              </p>
              <div className="space-y-2">
                {routines.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => startSession(r.name, r.id)}
                    className="w-full card px-4 py-3 flex items-center justify-between text-left hover:bg-surface-800 transition-colors active:scale-[0.99]"
                  >
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      {r.notes && (
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{r.notes}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────
  const excludeIds = activeSession.exercises.map((e) => e.exerciseId);
  const volume     = getTotalVolume();
  const completed  = getCompletedSetsCount();

  const handleFinish = async () => {
    if (!showFinishConfirm) {
      setShowFinishConfirm(true);
      return;
    }
    setFinishing(true);
    try {
      await finishSession();
      navigate('/history');
    } catch (err) {
      console.error(err);
    } finally {
      setFinishing(false);
      setShowFinishConfirm(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Discard this workout? All data will be lost.')) {
      discardSession();
    }
  };

  return (
    <div className="min-h-dvh flex flex-col pb-48">
      {/* Top bar */}
      <TopBar
        title={activeSession.name}
        left={
          <button
            onClick={handleDiscard}
            className="tap-target text-surface-500 hover:text-red-400 rounded-lg"
            aria-label="Discard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
        right={
          <button
            onClick={() => setShowRPE((v) => !v)}
            className={`tap-target text-xs font-semibold rounded-lg px-2 py-1 ${showRPE ? 'text-primary-400 bg-primary-400/10' : 'text-surface-500 hover:text-white'}`}
          >
            RPE
          </button>
        }
      />

      {/* Stats bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface-900 border-b border-surface-800">
        <div className="text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Volume</p>
          <p className="text-sm font-bold text-white">{volume.toFixed(0)}kg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Sets</p>
          <p className="text-sm font-bold text-white">{completed}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Duration</p>
          <p className="text-sm font-bold text-white">
            {formatDuration(activeSession.startedAt)}
          </p>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="px-4 pt-4">
        {activeSession.exercises.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-surface-500 text-sm">No exercises yet.</p>
            <p className="text-surface-600 text-xs mt-1">Tap below to add your first exercise.</p>
          </div>
        ) : (
          activeSession.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
              sessionId={activeSession.id}
              showRPE={showRPE}
              onAddSet={handleAddSet}
              onUpdateSet={handleUpdateSet}
              onToggleComplete={handleToggleComplete}
              onRemoveSet={handleRemoveSet}
              onRemoveExercise={handleRemoveExercise}
              onTimerStart={handleTimerStart}
            />
          ))
        )}
      </div>

      {/* Add exercise button */}
      <div className="px-4 mt-2">
        <Button
          variant="ghost"
          onClick={() => setShowAddExercise(true)}
          className="w-full border border-dashed border-surface-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Exercise
        </Button>
      </div>

      {/* Finish button */}
      <div className="fixed bottom-16 inset-x-0 z-10 px-4 pb-3 pt-2 bg-gradient-to-t from-surface-950 to-transparent">
        {showFinishConfirm && (
          <p className="text-center text-xs text-amber-400 mb-2">Tap again to confirm finish</p>
        )}
        <Button
          onClick={handleFinish}
          loading={finishing || isSyncing}
          className={`w-full ${showFinishConfirm ? 'bg-green-600 hover:bg-green-500' : ''}`}
          size="lg"
        >
          {showFinishConfirm ? 'Confirm Finish' : 'Finish Workout'}
        </Button>
      </div>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onSelect={addExercise}
        excludeIds={excludeIds}
      />

      {/* Rest Timer */}
      <RestTimerBar
        isActive={timer.isActive}
        remaining={timer.remaining}
        duration={timer.duration}
        progress={timer.progress}
        onStop={timer.stop}
        onAdd={timer.addTime}
        onStart={timer.start}
      />
    </div>
  );
}
