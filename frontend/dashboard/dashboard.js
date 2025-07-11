let chartInstance = null; // Global variable to keep track of the chart instance

document.addEventListener('DOMContentLoaded', async function () {
    await updateDashboard();
});

async function updateDashboard() {
    const sensorId = document.getElementById('sensorSelect').value;

    try {
        // fetching total number of parking activities
        const totalResponse = await fetch(`http://localhost:8081/api/total`);
        const totalData = await totalResponse.json();
        document.getElementById('totalActivities').innerText = totalData[0]?.count || 0;

        // fetching average parking duration
        const avgResponse = await fetch(`http://localhost:8081/api/average`);
        const avgData = await avgResponse.json();
        document.getElementById('avgDuration').innerText = (num = Number(avgData[0]?.avg_parking_duration_minutes).toFixed(0)) + ' minutes ~' + (num/60).toFixed(0) + ' hours' || 0;

        await updateChart(sensorId);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function updateChart(sensor) {
    const ctx = document.getElementById('parkingChart').getContext('2d');
    const sensors = ['863213040198520', '863213040200508', '863213040206349', '863213040212347']
    const sensorId = sensors[sensor - 1];

    let occupancyData = [];

    try {
        // fetching for each hour of the day
        for (let i = 0; i < 24; i++) {
            try {
                const response = await fetch(`http://localhost:8081/api/occupancy?starthour=${i}&endhour=${i + 1}&sensor=${sensorId}`);
                const data = await response.json();

                occupancyData.push(data.length > 0 ? data[0].occupancy_rate_percentage : 0);
                console.log(`Occupancy data for hour ${i}:`, data); // for debugging purposes
            } catch (error) {
                console.error(`Error fetching data for hour ${i}:`, error);
                occupancyData.push(0); // default value
            }
        }

        console.log("Final occupancy data:", occupancyData); // for debugging purposes
        const max = Math.max(...occupancyData);
        console.log("Max occupancy rate:", max); // for debugging purposes
        const peakIndex = occupancyData.findIndex(value => Math.abs(value - max) < Number.EPSILON);
        console.log("Peak time:", peakIndex); // for debugging purposes
        document.getElementById('peakTime').innerText = `${peakIndex}:00 - ${peakIndex + 1}:00`;

        const chartData = {
            labels: [
                "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00",
                "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
                "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
                "21:00", "22:00", "23:00"
            ],
            datasets: [{
                label: 'Occupancy Rate (%)',
                data: occupancyData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        // destroy the previous one so it doesn't mess up anything
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    x: { title: { display: true, text: 'Hour of Day' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Occupancy Rate (%)' } }
                }
            }
        });

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

