import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://bbbrcahmofvatguyjnmz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYnJjYWhtb2Z2YXRndXlqbm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NTI2OTEsImV4cCI6MjA0NzAyODY5MX0.n544US-E6zY1nPh0SEgmDpftYz5lf4Ff7cKYPt4XaXE');

export default async function handler(req, res) {
    const { user } = req.query;
    const { day, period, homeValue } = req.body;

    if (req.method === 'POST') {
        try {
            // Update the timetable entry in Supabase
            const { data, error } = await supabase
                .from('timetables')
                .update({ home: homeValue })
                .eq('user', user)
                .eq('day', day)
                .eq('period', period);

            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error updating timetable' });
            } else {
                res.status(200).json({ message: 'Timetable updated successfully', data });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Unexpected error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}