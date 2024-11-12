import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { user } = req.query;
    const filePath = path.join(process.cwd(), 'timetable', 'data', user, 'timetable.json');

    if (req.method === 'POST') {
        const { day, period, homeValue } = req.body;

        try {
            // Read the existing JSON file
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Check if the day and period exist in the timetable
            if (data[day] && data[day][period]) {
                // Update the 'home' key value
                data[day][period].home = homeValue;

                // Save the updated JSON file
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                res.status(200).json({ message: 'Timetable updated successfully' });
            } else {
                res.status(404).json({ error: 'Specified day or period not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error reading or updating timetable' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}