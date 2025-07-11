This project was done for an internship application.

# Smart Zone Sensor Dashboard

## Overview

The Smart Zone Sensor Dashboard provides city officials with real-time and historical insights into parking activities within designated Smart Zones. By processing sensor data from multiple sensors deployed in a Smart Zone, the dashboard displays key metrics and visualizations, including:

- **Total Parking Activities:** The overall count of parking events recorded.
- **Average Parking Duration:** The average time (in minutes) that vehicles remain parked.
- **Hourly Occupancy Rate:** The percentage of time each sensor detects occupancy during each hour.
- **Peak Parking Time:** The time interval during which the highest parking activity is observed.
- **Interactive Visualization:** A bar chart (powered by Chart.js) that visualizes hourly occupancy data.

## How It Works

1. **Data Collection & Storage:**  
   Sensor data is collected in real time and stored in a PostgreSQL database. Each sensor records its status (occupied or vacant) along with a timestamp.

2. **Data Processing:**  
   SQL queries aggregate and calculate:
    - Transitions between parking states.
    - The duration of parking events.
    - Hourly occupancy rates for each sensor.

3. **API Endpoints:**  
   A Node.js/Express backend exposes API endpoints to fetch:
    - Total parking activities.
    - Average parking duration.
    - Occupancy rates for a given sensor and time range.

4. **Dashboard Visualization:**  
   A web frontend uses these API endpoints to dynamically update metrics and render interactive charts. Users can select a specific sensor to view detailed hourly occupancy data.

## Development Decisions

- **Database Choice:**  
  I used PostgreSQL because it was already installed on my laptop. SQL queries were designed to process sensor data and calculate occupancy metrics.
  > **Note:** One might create materialized views to cache complex query results for performance. To refresh a materialized view, execute:  
  > `REFRESH MATERIALIZED VIEW view_name`

- **Time Metrics:**  
  I decided to display both minutes (for average parking duration) and hours (for hourly occupancy) to give viewers a comprehensive and realistic idea of parking times.

- **Visualization:**  
  Chart.js was chosen for its simplicity and flexibility in rendering interactive bar charts that show parking activity and occupancy rates by hour.

- **Data Import:**  
  While working with the dataset, I encountered formatting issues:
    - I had to delete all semicolons (`;`) at the end of the lines and remove the first line to successfully import the data.
    - I also initially assumed the data was comma-separated; however, it turned out that the values were separated by semicolons.

## Limitations and Assumptions

- **Timestamp Accuracy:**  
  Calculations are based on the timestamps provided by the sensors. Any discrepancies or delays in reporting could affect the accuracy of the metrics.

- **Dataset Cleaning:**  
  Manual removal of semicolons and adjusting separators during the data import process may have introduced errors. Automated data cleaning would be a beneficial improvement.

- **Scope:**  
  The current dashboard is designed for a single Smart Zone with four sensors. Scaling to multiple zones or a larger number of sensors would require additional modifications to the data model and visualization logic.

## Usage Instructions

1. **Run the Backend:**
    - Ensure PostgreSQL is running and the sensor data is imported.
    - Start the Node.js/Express server:
      ```bash
      node app.js
      ```

2. **Access the Dashboard:**
    - Open `index.html` in your browser.
    - Use the sensor selection dropdown to view data for a specific sensor.
    - The dashboard will display updated metrics and a chart based on the selected sensor.

## Questions?

If you have any questions regarding this project, feel free to shoot me an email `sinenomine998@gmail.com`.
