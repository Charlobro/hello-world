// Simple canvas-based charts for Tugboat Statistics Dashboard
// Self-contained without external dependencies

// Global variables
let chartsInitialized = false;

// Color schemes
const colors = {
    primary: '#0066cc',
    secondary: '#6c757d',
    success: '#28a745',
    info: '#17a2b8',
    warning: '#ffc107',
    danger: '#dc3545'
};

const chartColors = [
    '#0066cc', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6610f2'
];

// Initialize all charts
function initializeCharts() {
    const data = getTugboatData();
    if (!data) {
        console.log('No data available for charts yet');
        return;
    }
    
    try {
        createMonthlyTowsChart(data.monthlyTows);
        createTowTypesChart(data.towTypes);
        createWeeklyTrendsChart(data.weeklyTrends);
        createPerformanceChart(data.overview);
        
        chartsInitialized = true;
        console.log('All charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Monthly Tows Bar Chart
function createMonthlyTowsChart(monthlyData) {
    const canvas = document.getElementById('monthlyTowsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const barWidth = chartWidth / monthlyData.length;
    
    // Find max value for scaling
    const maxValue = Math.max(...monthlyData.map(item => item.tows));
    const scale = chartHeight / maxValue;
    
    // Draw bars
    monthlyData.forEach((item, index) => {
        const barHeight = item.tows * scale;
        const x = padding + index * barWidth + barWidth * 0.1;
        const y = height - padding - barHeight;
        const barActualWidth = barWidth * 0.8;
        
        // Draw bar
        ctx.fillStyle = colors.primary;
        ctx.fillRect(x, y, barActualWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#343a40';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.month, x + barActualWidth / 2, height - padding + 15);
        
        // Draw value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(item.tows, x + barActualWidth / 2, y - 5);
    });
    
    // Draw y-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * i);
        const y = height - padding - (chartHeight / 5) * i;
        ctx.fillText(value, padding - 10, y + 3);
    }
    
    // Draw title
    ctx.fillStyle = '#343a40';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Remorquages par Mois', width / 2, 20);
}

// Tow Types Pie Chart
function createTowTypesChart(typesData) {
    const canvas = document.getElementById('towTypesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height - 80) / 3;
    
    // Calculate total and angles
    const total = typesData.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = -Math.PI / 2; // Start at top
    
    // Draw pie slices
    typesData.forEach((item, index) => {
        const sliceAngle = (item.count / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Draw legend
    const legendY = height - 60;
    let legendX = 20;
    
    typesData.forEach((item, index) => {
        if (legendX + 100 > width) {
            legendX = 20;
            legendY += 20;
        }
        
        // Legend color box
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fillRect(legendX, legendY, 12, 12);
        
        // Legend text
        ctx.fillStyle = '#343a40';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.type} (${item.percentage}%)`, legendX + 16, legendY + 9);
        
        legendX += Math.max(100, ctx.measureText(`${item.type} (${item.percentage}%)`).width + 30);
    });
    
    // Draw title
    ctx.fillStyle = '#343a40';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Répartition par Type', width / 2, 20);
}

// Weekly Trends Line Chart
function createWeeklyTrendsChart(weeklyData) {
    const canvas = document.getElementById('weeklyTrendsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Prepare data
    const towsData = weeklyData.map(item => item.tows);
    const distanceData = weeklyData.map(item => item.distance);
    const maxTows = Math.max(...towsData);
    const maxDistance = Math.max(...distanceData);
    
    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw tows line
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    weeklyData.forEach((item, index) => {
        const x = padding + (chartWidth / (weeklyData.length - 1)) * index;
        const y = height - padding - (item.tows / maxTows) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.stroke();
    
    // Draw distance line
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 3;
    ctx.beginPath();
    weeklyData.forEach((item, index) => {
        const x = padding + (chartWidth / (weeklyData.length - 1)) * index;
        const y = height - padding - (item.distance / maxDistance) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = colors.success;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.stroke();
    
    // Draw x-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    weeklyData.forEach((item, index) => {
        const x = padding + (chartWidth / (weeklyData.length - 1)) * index;
        ctx.fillText(item.week, x, height - padding + 15);
    });
    
    // Draw y-axis labels (left for tows)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxTows / 5) * i);
        const y = height - padding - (chartHeight / 5) * i;
        ctx.fillText(value, padding - 10, y + 3);
    }
    
    // Draw y-axis labels (right for distance)
    ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxDistance / 5) * i);
        const y = height - padding - (chartHeight / 5) * i;
        ctx.fillText(value + 'km', width - padding + 10, y + 3);
    }
    
    // Draw legend
    ctx.font = '12px sans-serif';
    ctx.fillStyle = colors.primary;
    ctx.fillRect(20, 30, 15, 3);
    ctx.fillStyle = '#343a40';
    ctx.textAlign = 'left';
    ctx.fillText('Remorquages', 40, 35);
    
    ctx.fillStyle = colors.success;
    ctx.fillRect(150, 30, 15, 3);
    ctx.fillStyle = '#343a40';
    ctx.fillText('Distance (km)', 170, 35);
    
    // Draw title
    ctx.fillStyle = '#343a40';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tendances Hebdomadaires', width / 2, 20);
}

// Performance Radar Chart (simplified as bar chart)
function createPerformanceChart(overviewData) {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Prepare performance data (normalized to 0-100)
    const performanceData = [
        { label: 'Efficacité', value: overviewData.energyEfficiency },
        { label: 'Activité', value: overviewData.uptime },
        { label: 'Rapidité', value: Math.min((1000 / overviewData.averageTowTime) * 10, 100) },
        { label: 'Volume', value: Math.min((overviewData.totalTows / 15), 100) }
    ];
    
    // Chart settings
    const padding = 30;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 40;
    const barHeight = chartHeight / performanceData.length;
    
    // Draw bars
    performanceData.forEach((item, index) => {
        const barWidth = (item.value / 100) * chartWidth;
        const y = padding + index * barHeight + barHeight * 0.2;
        const actualBarHeight = barHeight * 0.6;
        
        // Draw background
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(padding, y, chartWidth, actualBarHeight);
        
        // Draw bar
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fillRect(padding, y, barWidth, actualBarHeight);
        
        // Draw label
        ctx.fillStyle = '#343a40';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, padding, y - 5);
        
        // Draw value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        if (barWidth > 30) {
            ctx.fillText(item.value.toFixed(1), padding + barWidth / 2, y + actualBarHeight / 2 + 3);
        }
    });
    
    // Draw title
    ctx.fillStyle = '#343a40';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Performance', width / 2, 20);
}

// Handle chart resize (simplified)
function handleChartResize() {
    if (chartsInitialized && typeof getTugboatData === 'function') {
        setTimeout(() => {
            initializeCharts();
        }, 100);
    }
}

// Update charts with new data
function updateCharts(newData) {
    if (!newData) return;
    
    try {
        initializeCharts();
        console.log('Charts updated successfully');
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Export chart as image
function exportChart(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        console.error('Chart not found:', chartId);
        return;
    }
    
    const link = document.createElement('a');
    link.download = filename || `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add some helper functions for animations (simplified)
function animateChart(canvas, drawFunction) {
    // Simple fade-in animation
    canvas.style.opacity = '0';
    drawFunction();
    
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.1;
        canvas.style.opacity = opacity;
        if (opacity >= 1) {
            clearInterval(fadeIn);
        }
    }, 50);
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Charts will be initialized by main.js after data is loaded
});

// Export functions for global access
window.chartFunctions = {
    initializeCharts,
    updateCharts,
    exportChart,
    handleChartResize
};