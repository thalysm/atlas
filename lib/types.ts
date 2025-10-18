export interface User {
  id: string
  email: string
  username: string
  name: string
  height?: number
  weight?: number
  gender?: string
  birth_date?: string
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  description?: string
  category: string
  type: "strength" | "cardio"
  muscle_groups: string[]
  equipment?: string
}

export interface ExerciseInPackage {
  exercise_id: string
  order: number
  notes?: string
}

export interface WorkoutPackage {
  id: string
  user_id: string
  name: string
  description?: string
  exercises: ExerciseInPackage[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface StrengthSet {
  set_number: number
  weight: number
  reps: number
  completed: boolean
}

export interface CardioSet {
  duration_minutes: number
  distance?: number
  incline?: number
  speed?: number
  completed: boolean
}

export interface ExerciseLog {
  exercise_id: string
  exercise_name: string
  type: "strength" | "cardio"
  sets: (StrengthSet | CardioSet)[]
  notes?: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  package_id: string
  package_name: string
  exercises: ExerciseLog[]
  start_time: string
  end_time?: string
  duration_minutes?: number
  is_completed: boolean
  created_at: string
}

export interface GroupMember {
  user_id: string
  username: string
  joined_at: string
  workout_count: number
}

export interface CompetitionGroup {
  id: string
  name: string
  description?: string
  owner_id: string
  members: GroupMember[]
  invite_code: string
  created_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  time: string
  frequency: 'daily' | 'weekly' | 'monthly'
  frequency_details?: number[] | number | null // Array for weekly, number for monthly
  completed?: boolean // Only relevant for /today endpoint
  created_at: string
}