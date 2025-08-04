// Charts Manager for Tugboat Statistics Dashboard

class ChartsManager {
    constructor() {
        this.chartOptions = this.getBaseChartOptions();
    }

    getBaseChartOptions() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    cornerRadius: 8,
                    titleFont: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 11
                        }
                    },
                    grid: {
                        color: gridColor,
                        lineWidth: 1
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 11
                        }
                    },
                    grid: {
                        color: gridColor,
                        lineWidth: 1
                    }
                }
            }
        };
    }

    createPerformanceChart(tugboats) {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return null;

        const data = this.getPerformanceData(tugboats, 'efficiency');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        return chart;
    }

    createMonthlyHoursChart(tugboats) {
        const ctx = document.getElementById('monthly-hours-chart');
        if (!ctx) return null;

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                       'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        const datasets = tugboats.slice(0, 5).map((tugboat, index) => ({
            label: tugboat.name,
            data: tugboat.monthly_hours,
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
        }));

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: datasets
            },
            options: {
                ...this.chartOptions,
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                },
                plugins: {
                    ...this.chartOptions.plugins,
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}h`;
                            }
                        }
                    }
                }
            }
        });

        return chart;
    }

    getPerformanceData(tugboats, metric) {
        const labels = tugboats.map(t => t.name);
        let data, label, backgroundColor;

        switch (metric) {
            case 'efficiency':
                data = tugboats.map(t => t.efficiency);
                label = 'Efficacité (%)';
                backgroundColor = tugboats.map((_, index) => this.getChartColor(index, 0.8));
                break;
            case 'missions':
                data = tugboats.map(t => t.missions_completed);
                label = 'Missions accomplies';
                backgroundColor = tugboats.map((_, index) => this.getChartColor(index, 0.8));
                break;
            case 'hours':
                data = tugboats.map(t => t.operation_hours);
                label = 'Heures d\'opération';
                backgroundColor = tugboats.map((_, index) => this.getChartColor(index, 0.8));
                break;
            default:
                data = tugboats.map(t => t.efficiency);
                label = 'Efficacité (%)';
                backgroundColor = tugboats.map((_, index) => this.getChartColor(index, 0.8));
        }

        return {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false
            }]
        };
    }

    updatePerformanceChart(chart, tugboats, metric) {
        if (!chart) return;

        const newData = this.getPerformanceData(tugboats, metric);
        chart.data = newData;

        // Update scale based on metric
        if (metric === 'efficiency') {
            chart.options.scales.y.max = 100;
            chart.options.scales.y.ticks.callback = function(value) {
                return value + '%';
            };
        } else {
            chart.options.scales.y.max = undefined;
            chart.options.scales.y.ticks.callback = function(value) {
                return metric === 'hours' ? value + 'h' : value;
            };
        }

        chart.update('active');
    }

    updateMonthlyHoursChart(chart, tugboats) {
        if (!chart) return;

        const datasets = tugboats.slice(0, 5).map((tugboat, index) => ({
            label: tugboat.name,
            data: tugboat.monthly_hours,
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
        }));

        chart.data.datasets = datasets;
        chart.update('active');
    }

    getChartColor(index, alpha = 1) {
        const colors = [
            `rgba(59, 130, 246, ${alpha})`,   // Blue
            `rgba(16, 185, 129, ${alpha})`,   // Green
            `rgba(251, 191, 36, ${alpha})`,   // Yellow
            `rgba(239, 68, 68, ${alpha})`,    // Red
            `rgba(139, 92, 246, ${alpha})`,   // Purple
            `rgba(6, 182, 212, ${alpha})`,    // Cyan
            `rgba(245, 158, 11, ${alpha})`,   // Orange
            `rgba(236, 72, 153, ${alpha})`    // Pink
        ];
        return colors[index % colors.length];
    }

    createFuelConsumptionChart(tugboats) {
        const ctx = document.getElementById('fuel-consumption-chart');
        if (!ctx) return null;

        const data = {
            labels: tugboats.map(t => t.name),
            datasets: [{
                label: 'Consommation (L/h)',
                data: tugboats.map(t => t.fuel_consumption),
                backgroundColor: tugboats.map((_, index) => this.getChartColor(index, 0.8)),
                borderColor: tugboats.map((_, index) => this.getChartColor(index)),
                borderWidth: 2
            }]
        };

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed * 100) / total).toFixed(1);
                                return `${context.label}: ${context.parsed}L/h (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        return chart;
    }

    createUtilizationChart(tugboats) {
        const ctx = document.getElementById('utilization-chart');
        if (!ctx) return null;

        // Calculate utilization rate for each tugboat (assuming 24/7 operation as 100%)
        const hoursInYear = 8760; // 24 * 365
        const data = {
            labels: tugboats.map(t => t.name),
            datasets: [{
                label: 'Taux d\'utilisation (%)',
                data: tugboats.map(t => ((t.operation_hours / hoursInYear) * 100).toFixed(1)),
                backgroundColor: tugboats.map((_, index) => this.getChartColor(index, 0.8)),
                borderColor: tugboats.map((_, index) => this.getChartColor(index)),
                borderWidth: 2,
                borderRadius: 4
            }]
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...this.chartOptions,
                indexAxis: 'y',
                plugins: {
                    ...this.chartOptions.plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            ...this.chartOptions.scales.x.ticks,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        return chart;
    }

    createComparisonChart(tugboats) {
        const ctx = document.getElementById('comparison-chart');
        if (!ctx) return null;

        const labels = tugboats.map(t => t.name);
        
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Efficacité', 'Missions', 'Heures Op.', 'Puissance', 'Équipage'],
                datasets: tugboats.slice(0, 3).map((tugboat, index) => {
                    // Normalize data to 0-100 scale for radar chart
                    const maxMissions = Math.max(...tugboats.map(t => t.missions_completed));
                    const maxHours = Math.max(...tugboats.map(t => t.operation_hours));
                    const maxPower = Math.max(...tugboats.map(t => t.power_hp));
                    const maxCrew = Math.max(...tugboats.map(t => t.crew_size));

                    return {
                        label: tugboat.name,
                        data: [
                            tugboat.efficiency,
                            (tugboat.missions_completed / maxMissions) * 100,
                            (tugboat.operation_hours / maxHours) * 100,
                            (tugboat.power_hp / maxPower) * 100,
                            (tugboat.crew_size / maxCrew) * 100
                        ],
                        backgroundColor: this.getChartColor(index, 0.2),
                        borderColor: this.getChartColor(index),
                        borderWidth: 2,
                        pointBackgroundColor: this.getChartColor(index),
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: this.getChartColor(index)
                    };
                })
            },
            options: {
                ...this.chartOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: this.chartOptions.scales.y.ticks.color,
                            font: this.chartOptions.scales.y.ticks.font
                        },
                        grid: {
                            color: this.chartOptions.scales.y.grid.color
                        },
                        angleLines: {
                            color: this.chartOptions.scales.y.grid.color
                        }
                    }
                }
            }
        });

        return chart;
    }

    createMaintenanceChart(tugboats) {
        const ctx = document.getElementById('maintenance-chart');
        if (!ctx) return null;

        // Calculate days since last maintenance
        const today = new Date();
        const maintenanceData = tugboats.map(tugboat => {
            const lastMaintenance = new Date(tugboat.last_maintenance);
            const daysSince = Math.floor((today - lastMaintenance) / (1000 * 60 * 60 * 24));
            return {
                name: tugboat.name,
                daysSince: daysSince,
                status: tugboat.status
            };
        });

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: maintenanceData.map(d => d.name),
                datasets: [{
                    label: 'Jours depuis maintenance',
                    data: maintenanceData.map(d => d.daysSince),
                    backgroundColor: maintenanceData.map(d => 
                        d.status === 'maintenance' ? 'rgba(239, 68, 68, 0.8)' : 
                        d.daysSince > 30 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(16, 185, 129, 0.8)'
                    ),
                    borderColor: maintenanceData.map(d => 
                        d.status === 'maintenance' ? 'rgba(239, 68, 68, 1)' : 
                        d.daysSince > 30 ? 'rgba(251, 191, 36, 1)' : 'rgba(16, 185, 129, 1)'
                    ),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    legend: {
                        display: false
                    },
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const status = maintenanceData[context.dataIndex].status;
                                return `${context.parsed.y} jours (${status === 'maintenance' ? 'En maintenance' : 'Opérationnel'})`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: function(value) {
                                return value + ' jours';
                            }
                        }
                    }
                }
            }
        });

        return chart;
    }

    // Animation helpers
    animateChart(chart, animationType = 'scale') {
        chart.options.animation = {
            duration: 1000,
            easing: 'easeOutQuart'
        };
        
        if (animationType === 'scale') {
            chart.options.animation.onProgress = function(animation) {
                const progress = animation.currentStep / animation.numSteps;
                chart.canvas.style.transform = `scale(${progress})`;
            };
            chart.options.animation.onComplete = function() {
                chart.canvas.style.transform = 'scale(1)';
            };
        }
        
        chart.update();
    }

    // Export chart as image
    exportChart(chart, filename = 'chart.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();
    }

    // Refresh all charts with theme
    refreshChartsTheme() {
        this.chartOptions = this.getBaseChartOptions();
    }
}

// Initialize Charts Manager
window.ChartsManager = new ChartsManager();

// Update chart themes when theme changes
document.addEventListener('themeChanged', () => {
    window.ChartsManager.refreshChartsTheme();
});

// Add resize handler for responsive charts
window.addEventListener('resize', debounce(() => {
    Chart.instances.forEach(chart => {
        chart.resize();
    });
}, 300));

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}