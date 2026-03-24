import React, { useState, useMemo, useCallback } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import useExerciseStore from '../../stores/exerciseStore.js';
import { hapticMedium } from '../../lib/haptics.js';

const MUSCLE_GROUPS = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body',
];

export function AddExerciseModal({ isOpen, onClose, onSelect, excludeIds = [] }) {
  const { searchExercises } = useExerciseStore();
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('all');

  const results = useMemo(() => {
    const all = searchExercises(query, filter === 'all' ? '' : filter);
    return all.filter((e) => !excludeIds.includes(e.id));
  }, [query, filter, searchExercises, excludeIds]);

  const handleSelect = useCallback((exercise) => {
    hapticMedium();
    onSelect(exercise);
    onClose();
    setQuery('');
    setFilter('all');
  }, [onSelect, onClose]);

  const groupLabel = (g) => g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1).replace('_', ' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise">
      <div className="px-5 pb-4 flex flex-col gap-4">
        {/* Search */}
        <Input
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {/* Muscle group filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === g
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-white border border-surface-700'
                }
              `}
            >
              {groupLabel(g)}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-1">
          {results.length === 0 ? (
            <p className="text-center text-sm text-surface-500 py-8">
              No exercises found.
            </p>
          ) : (
            results.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="
                  w-full flex items-center justify-between
                  px-4 py-3 rounded-xl
                  bg-surface-800 hover:bg-surface-700
                  border border-surface-700/50
                  transition-colors active:scale-[0.99]
                  text-left
                "
              >
                <div>
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                  <p className="text-xs text-surface-500 capitalize mt-0.5">
                    {ex.muscle_group.replace('_', ' ')}
                    {ex.equipment ? ` · ${ex.equipment.replace('_', ' ')}` : ''}
                  </p>
                </div>
                <svg className="w-4 h-4 text-surface-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
