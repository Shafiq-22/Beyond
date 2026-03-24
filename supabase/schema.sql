-- ============================================================
-- Beyond Fitness PWA — Database Schema
-- Run this in the Supabase SQL editor BEFORE seed.sql
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- EXERCISES
-- Shared (user_id IS NULL) + user-created custom exercises
-- ============================================================
create table if not exists exercises (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  muscle_group text not null check (muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'legs', 'glutes', 'core', 'cardio', 'full_body', 'other'
  )),
  equipment    text check (equipment in (
    'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight',
    'kettlebell', 'resistance_band', 'smith_machine', 'other'
  )),
  is_custom    boolean not null default false,
  user_id      uuid references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index if not exists exercises_muscle_group_idx on exercises(muscle_group);
create index if not exists exercises_user_id_idx      on exercises(user_id);
create index if not exists exercises_name_idx         on exercises using gin(to_tsvector('english', name));

-- ============================================================
-- ROUTINES
-- ============================================================
create table if not exists routines (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routines_user_id_idx on routines(user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger routines_updated_at
  before update on routines
  for each row execute function update_updated_at();

-- ============================================================
-- ROUTINE_EXERCISES
-- ============================================================
create table if not exists routine_exercises (
  id            uuid primary key default uuid_generate_v4(),
  routine_id    uuid references routines(id)  on delete cascade not null,
  exercise_id   uuid references exercises(id) on delete cascade not null,
  order_index   int  not null default 0,
  target_sets   int,
  target_reps   int,
  target_weight numeric(7,2)
);

create index if not exists routine_exercises_routine_id_idx  on routine_exercises(routine_id);
create index if not exists routine_exercises_exercise_id_idx on routine_exercises(exercise_id);

-- ============================================================
-- WORKOUT_SESSIONS
-- ============================================================
create table if not exists workout_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  routine_id       uuid references routines(id) on delete set null,
  name             text not null,
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  notes            text,
  total_volume     numeric(10,2),   -- total kg lifted (weight × reps summed)
  duration_seconds int
);

create index if not exists workout_sessions_user_id_idx    on workout_sessions(user_id);
create index if not exists workout_sessions_started_at_idx on workout_sessions(started_at desc);

-- ============================================================
-- SETS
-- ============================================================
create table if not exists sets (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid references workout_sessions(id) on delete cascade not null,
  exercise_id uuid references exercises(id)        on delete cascade not null,
  set_number  int  not null,
  reps        int  check (reps >= 0),
  weight      numeric(7,2) check (weight >= 0),   -- kg
  rpe         numeric(3,1) check (rpe >= 1 and rpe <= 10),
  is_pr       boolean not null default false,
  logged_at   timestamptz not null default now()
);

create index if not exists sets_session_id_idx  on sets(session_id);
create index if not exists sets_exercise_id_idx on sets(exercise_id);
create index if not exists sets_is_pr_idx       on sets(is_pr) where is_pr = true;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table exercises       enable row level security;
alter table routines        enable row level security;
alter table routine_exercises enable row level security;
alter table workout_sessions enable row level security;
alter table sets             enable row level security;

-- EXERCISES: anyone can read, users can CRUD their own custom ones
create policy "exercises_select"
  on exercises for select using (true);

create policy "exercises_insert"
  on exercises for insert
  with check (auth.uid() = user_id);

create policy "exercises_update"
  on exercises for update
  using (auth.uid() = user_id);

create policy "exercises_delete"
  on exercises for delete
  using (auth.uid() = user_id);

-- ROUTINES: users own their routines
create policy "routines_all"
  on routines using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ROUTINE_EXERCISES: accessible if the parent routine belongs to the user
create policy "routine_exercises_all"
  on routine_exercises
  using (
    exists (
      select 1 from routines r
      where r.id = routine_exercises.routine_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from routines r
      where r.id = routine_exercises.routine_id
        and r.user_id = auth.uid()
    )
  );

-- WORKOUT_SESSIONS: users own their sessions
create policy "workout_sessions_all"
  on workout_sessions using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SETS: accessible if parent session belongs to the user
create policy "sets_all"
  on sets
  using (
    exists (
      select 1 from workout_sessions ws
      where ws.id = sets.session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_sessions ws
      where ws.id = sets.session_id
        and ws.user_id = auth.uid()
    )
  );
