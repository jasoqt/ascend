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
      default:
        return error.message
    }
  }
  return 'An unexpected error occurred. Please try again.'
}