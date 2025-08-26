import { createClient } from '@supabase/supabase-js'

// WARNING: This is for testing only. Use environment variables in production.
const supabaseUrl = 'https://bkfwfzumoxehsancjubh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZndmenVtb3hlaHNhbmNqdWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzAxMDYsImV4cCI6MjA3MTYwNjEwNn0.gAPIjEf742-lC0TsAlQ-Ihbd5jSXrwg6dYkuJBztXBs'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to handle Supabase errors
export const getSupabaseErrorMessage = (error) => {
  if (error?.message) {
    // Common Supabase auth error messages
    switch (error.message) {
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Invalid email':
        return 'Please enter a valid email address'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      case 'Signup is disabled':
        return 'Account creation is currently disabled'
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'Email not confirmed':
        return 'Please check your email and click the verification link before signing in.'
      case 'Too many requests':
        return 'Too many login attempts. Please wait a moment before trying again.'
      case 'User not found':
        return 'No account found with this email address.'
      case 'Invalid password':
        return 'Incorrect password. Please try again.'
      default:
        return error.message
    }
  }
  return 'An unexpected error occurred. Please try again.'
}

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}