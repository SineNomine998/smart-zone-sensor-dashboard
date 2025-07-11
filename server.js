const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

// Endpoint for getting data about total number of parking activities
app.get('/api/total', async (req, res) => {
    try {
        const result = await pool.query(`
      WITH transitions AS (
        SELECT 
          status, 
          timestamp, 
          sensor_id, 
          LAG(status) OVER (PARTITION BY sensor_id ORDER BY timestamp) AS previous_status 
        FROM sensor_data
      )
      SELECT COUNT(*) AS count
      FROM transitions 
      WHERE status = 1 AND (previous_status = 0 OR previous_status IS NULL)
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint for getting data about average parking duration
app.get('/api/average', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH parking_events AS (
                SELECT
                    sd1.sensor_id,
                    sd1.timestamp AS start_time,
                    (
                        SELECT sd2.timestamp
                        FROM sensor_data sd2
                        WHERE sd2.sensor_id = sd1.sensor_id
                          AND sd2.timestamp > sd1.timestamp
                          AND sd2.status = 0
                        ORDER BY sd2.timestamp ASC
                        LIMIT 1
                    ) AS end_time
                FROM sensor_data sd1
                WHERE sd1.status = 1
            )
            SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0) AS avg_parking_duration_minutes
            FROM parking_events
            WHERE end_time IS NOT NULL;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for getting data about occupancy rate over a defined time period
app.get('/api/occupancy', async (req, res) => {
    const { sensor, starthour, endhour } = req.query;

    if (starthour === undefined || endhour === undefined || !sensor) {
        return res.status(400).json({ error: 'starthour, endhour and sensor query parameters are required' });
    }

    try {
        const result = await pool.query(`
            WITH occupancy AS (
                SELECT
                    sensor_id,
                    EXTRACT(HOUR FROM timestamp) AS hour,
                    timestamp AS change_time,
                    status,
                    LEAD(timestamp) OVER (PARTITION BY sensor_id ORDER BY timestamp) AS next_change_time
                FROM sensor_data
                WHERE sensor_id = $3
                  AND EXTRACT(HOUR FROM timestamp) >= $1
                  AND EXTRACT(HOUR FROM timestamp) < $2
            )
            SELECT
                hour,
                ROUND(
                    SUM(CASE WHEN status = 1 THEN EXTRACT(EPOCH FROM (next_change_time - change_time)) ELSE 0 END) /
                    SUM(EXTRACT(EPOCH FROM (next_change_time - change_time)))::numeric * 100, 2
                ) AS occupancy_rate_percentage
            FROM occupancy
            WHERE next_change_time IS NOT NULL
            GROUP BY hour
            ORDER BY hour;
        `, [starthour, endhour, sensor]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(8081, () => {
    console.log('Server running on port 8081');
});
