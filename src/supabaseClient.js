import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfsvrdlaaaknguqoodnf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmc3ZyZGxhYWFrbmd1cW9vZG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjU4MzAsImV4cCI6MjA1NjA0MTgzMH0.QTNfBzCSWk9E4JTkqhE92i-878570NHTFG5ulSPH7kY'

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase