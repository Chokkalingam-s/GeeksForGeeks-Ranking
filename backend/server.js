const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'hackerrank_db',
});

db.connect(err => {
    if (err) console.error('MySQL Connection Error:', err);
    else console.log('Connected to MySQL');
});

// Fetch all students sorted by problems solved
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students ORDER BY solved_count DESC', (err, results) => {
        if (err) return res.status(500).send('DB Error');
        res.json(results);
    });
});

// Add a new student and fetch their HackerRank score
app.post('/add-student', async (req, res) => {
    const { reg_no, name, department, year, hackerrank_url } = req.body;
    try {
        const solved_count = await getHackerRankScore(hackerrank_url);

        db.query(
            'INSERT INTO students (reg_no, name, department, year, hackerrank_url, solved_count) VALUES (?, ?, ?, ?, ?, ?)',
            [reg_no, name, department, year, hackerrank_url, solved_count],
            (err) => {
                if (err) {
                    console.error('Insert Error:', err);
                    return res.status(500).send('Error adding student');
                }
                res.status(200).send('Student added');
            }
        );
    } catch (err) {
        console.error('Scrape Error:', err);
        res.status(500).send('Unable to fetch HackerRank score');
    }
});

// Scrape HackerRank profile to get problem count


async function getHackerRankScore(profileUrl) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the "Problem Solved" element to be loaded
    await page.waitForSelector('.scoreCard_head_left--score__oSi_x');

    // Extract the problem solved count
    const problemSolved = await page.evaluate(() => {
        // Select the element where the "Problem Solved" score is displayed
        const problemSolvedElement = document.querySelectorAll('.scoreCard_head_left--score__oSi_x')[1];
        return problemSolvedElement ? problemSolvedElement.textContent.trim() : '0';
    });

    console.log(`Problem Solved: ${problemSolved}`);

    await browser.close();
    return problemSolved;  // Returning the count of problems solved
} catch (err) {
    console.error('Failed to fetch GFG data:', err);
    return '0'; // Return 0 if error occurs
}
}


// Cron job to update scores every 8 hours
cron.schedule('0 */8 * * *', async () => {
    console.log('Running score update every 8 hours...');

    db.query('SELECT id, hackerrank_url FROM students', async (err, students) => {
        if (err) return console.error('Fetch error:', err);

        for (const student of students) {
            const score = await getHackerRankScore(student.hackerrank_url);
            db.query(
                'UPDATE students SET solved_count = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?',
                [score, student.id]
            );
        }
        console.log('Scores updated successfully');
    });
});

// Auto year increment every July 1
cron.schedule('0 0 1 7 *', () => {
    console.log('Running auto year increment...');

    const yearMap = {
        "First Year": "Second Year",
        "Second Year": "Third Year",
        "Third Year": "Fourth Year",
        "Fourth Year": "Graduated",
    };

    Object.entries(yearMap).forEach(([oldYear, newYear]) => {
        db.query(
            'UPDATE students SET year = ? WHERE year = ?',
            [newYear, oldYear],
            (err) => {
                if (err) console.error(`Failed to update ${oldYear} → ${newYear}:`, err);
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
