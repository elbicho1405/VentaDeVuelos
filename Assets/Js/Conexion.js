import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://boeptrcwpeiwynaoygut.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZXB0cmN3cGVpd3luYW95Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzM5MDYsImV4cCI6MjA0NTEwOTkwNn0.akrkuPSEa3hiTVxeLN9D-M7OYKUMoWkeYIOxttqv3bk'
const supabase = createClient(supabaseUrl, supabaseKey)
export {supabase}      

    