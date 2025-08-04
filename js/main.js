// Main JavaScript functionality for Tugboat Statistics Dashboard

class TugboatDashboard {
    constructor() {
        this.data = null;
        this.filteredData = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.charts = {};
        
        this.init();
    }

    async init() {
        this.showLoading();
        this.setupEventListeners();
        this.applyTheme();
        
        try {
            await this.loadData();
            this.populateDashboard();
            this.initializeCharts();
            this.populateTable();
            this.updateLastUpdated();
        } catch (error) {
            this.showNotification('Erreur lors du chargement des données', 'error');
            console.error('Error loading data:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadData() {
        try {
            const response = await fetch('data/tugboat-stats.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.filteredData = [...this.data.tugboats];
            return this.data;
        } catch (error) {
            console.error('Error loading tugboat data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterData(e.target.value, document.getElementById('status-filter').value);
        });

        // Status filter
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterData(document.getElementById('search-input').value, e.target.value);
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // Performance metric selector
        document.getElementById('performance-metric').addEventListener('change', (e) => {
            this.updatePerformanceChart(e.target.value);
        });

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header.dataset.sort);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        document.getElementById('tugboat-modal').addEventListener('click', (e) => {
            if (e.target.id === 'tugboat-modal') {
                this.closeModal();
            }
        });

        // Table view toggle
        document.getElementById('table-view-toggle').addEventListener('click', () => {
            this.toggleTableView();
        });
    }

    populateDashboard() {
        const { fleet_summary, performance_metrics } = this.data;
        
        // Update summary cards
        document.getElementById('total-tugboats').textContent = fleet_summary.total_tugboats;
        document.getElementById('operational-count').textContent = fleet_summary.operational;
        document.getElementById('total-missions').textContent = fleet_summary.total_missions.toLocaleString();
        document.getElementById('daily-avg').textContent = performance_metrics.daily_avg_missions;
        document.getElementById('total-hours').textContent = fleet_summary.total_operation_hours.toLocaleString();
        document.getElementById('utilization-rate').textContent = performance_metrics.utilization_rate;
        document.getElementById('avg-efficiency').textContent = `${fleet_summary.average_efficiency}%`;

        // Update additional metrics
        document.getElementById('fuel-cost').textContent = `€${performance_metrics.monthly_fuel_cost.toLocaleString()}`;
        document.getElementById('customer-satisfaction').textContent = `${performance_metrics.customer_satisfaction}%`;
        document.getElementById('safety-incidents').textContent = performance_metrics.safety_incidents;
        document.getElementById('maintenance-adherence').textContent = `${performance_metrics.maintenance_schedule_adherence}%`;
    }

    populateTable() {
        const tbody = document.getElementById('tugboat-table-body');
        tbody.innerHTML = '';

        this.filteredData.forEach(tugboat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${tugboat.name}</strong></td>
                <td>${tugboat.power_hp.toLocaleString()} HP</td>
                <td>${tugboat.missions_completed}</td>
                <td>${tugboat.operation_hours.toLocaleString()}h</td>
                <td>${tugboat.efficiency}%</td>
                <td>${tugboat.fuel_consumption}L/h</td>
                <td><span class="status-badge status-${tugboat.status}">${this.getStatusText(tugboat.status)}</span></td>
                <td>
                    <button class="btn btn-icon" onclick="dashboard.showTugboatDetails(${tugboat.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'operational': 'Opérationnel',
            'maintenance': 'Maintenance'
        };
        return statusMap[status] || status;
    }

    filterData(searchTerm, statusFilter) {
        let filtered = [...this.data.tugboats];

        if (searchTerm) {
            filtered = filtered.filter(tugboat =>
                tugboat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(tugboat => tugboat.status === statusFilter);
        }

        this.filteredData = filtered;
        this.populateTable();
        this.updatePerformanceChart(document.getElementById('performance-metric').value);
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.populateTable();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        document.querySelectorAll('[data-sort] i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        if (this.sortColumn) {
            const header = document.querySelector(`[data-sort="${this.sortColumn}"] i`);
            if (header) {
                header.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
            }
        }
    }

    showTugboatDetails(tugboatId) {
        const tugboat = this.data.tugboats.find(t => t.id === tugboatId);
        if (!tugboat) return;

        document.getElementById('modal-tugboat-name').textContent = tugboat.name;
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="tugboat-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <h4>Informations Générales</h4>
                        <p><strong>Puissance:</strong> ${tugboat.power_hp.toLocaleString()} HP</p>
                        <p><strong>Année de construction:</strong> ${tugboat.year_built}</p>
                        <p><strong>Équipage:</strong> ${tugboat.crew_size} personnes</p>
                        <p><strong>Force de traction max:</strong> ${tugboat.max_bollard_pull} tonnes</p>
                    </div>
                    
                    <div class="detail-item">
                        <h4>Performances</h4>
                        <p><strong>Heures d'opération:</strong> ${tugboat.operation_hours.toLocaleString()}h</p>
                        <p><strong>Missions accomplies:</strong> ${tugboat.missions_completed}</p>
                        <p><strong>Efficacité:</strong> ${tugboat.efficiency}%</p>
                        <p><strong>Consommation:</strong> ${tugboat.fuel_consumption}L/h</p>
                    </div>
                    
                    <div class="detail-item">
                        <h4>Statut et Maintenance</h4>
                        <p><strong>Statut actuel:</strong> 
                            <span class="status-badge status-${tugboat.status}">${this.getStatusText(tugboat.status)}</span>
                        </p>
                        <p><strong>Dernière maintenance:</strong> ${new Date(tugboat.last_maintenance).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                
                <div class="monthly-chart-container">
                    <h4>Heures d'opération mensuelles</h4>
                    <canvas id="tugboat-monthly-chart" width="400" height="200"></canvas>
                </div>
            </div>
        `;

        document.getElementById('tugboat-modal').classList.add('active');
        
        // Create mini chart for this tugboat
        setTimeout(() => {
            this.createTugboatMonthlyChart(tugboat);
        }, 100);
    }

    createTugboatMonthlyChart(tugboat) {
        const ctx = document.getElementById('tugboat-monthly-chart');
        if (!ctx) return;

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                       'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Heures d\'opération',
                    data: tugboat.monthly_hours,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    closeModal() {
        document.getElementById('tugboat-modal').classList.remove('active');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Update charts if they exist
        if (Object.keys(this.charts).length > 0) {
            setTimeout(() => {
                this.updateChartThemes();
            }, 100);
        }
    }

    updateChartThemes() {
        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        Object.values(this.charts).forEach(chart => {
            if (chart.options) {
                chart.options.plugins.legend.labels.color = textColor;
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                chart.update();
            }
        });
    }

    exportData() {
        const exportData = {
            fleet_summary: this.data.fleet_summary,
            tugboats: this.filteredData,
            export_date: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
                             { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tugboat-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Données exportées avec succès', 'success');
    }

    async refreshData() {
        this.showLoading();
        try {
            await this.loadData();
            this.populateDashboard();
            this.populateTable();
            this.updateCharts();
            this.updateLastUpdated();
            this.showNotification('Données actualisées', 'success');
        } catch (error) {
            this.showNotification('Erreur lors de l\'actualisation', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateLastUpdated() {
        const lastUpdated = new Date(this.data.fleet_summary.last_updated);
        document.getElementById('last-updated').textContent = 
            lastUpdated.toLocaleString('fr-FR');
    }

    toggleTableView() {
        const table = document.querySelector('.tugboat-table');
        const icon = document.querySelector('#table-view-toggle i');
        
        if (table.classList.contains('compact-view')) {
            table.classList.remove('compact-view');
            icon.className = 'fas fa-th';
        } else {
            table.classList.add('compact-view');
            icon.className = 'fas fa-list';
        }
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    initializeCharts() {
        this.createPerformanceChart();
        this.createMonthlyHoursChart();
    }

    createPerformanceChart() {
        // This will be implemented in charts.js
        if (window.ChartsManager) {
            this.charts.performance = window.ChartsManager.createPerformanceChart(this.filteredData);
        }
    }

    createMonthlyHoursChart() {
        // This will be implemented in charts.js
        if (window.ChartsManager) {
            this.charts.monthlyHours = window.ChartsManager.createMonthlyHoursChart(this.data.tugboats);
        }
    }

    updatePerformanceChart(metric) {
        if (window.ChartsManager && this.charts.performance) {
            window.ChartsManager.updatePerformanceChart(this.charts.performance, this.filteredData, metric);
        }
    }

    updateCharts() {
        this.updatePerformanceChart(document.getElementById('performance-metric').value);
        if (window.ChartsManager && this.charts.monthlyHours) {
            window.ChartsManager.updateMonthlyHoursChart(this.charts.monthlyHours, this.data.tugboats);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new TugboatDashboard();
});

// Add some CSS for the modal details
const detailStyles = document.createElement('style');
detailStyles.textContent = `
    .tugboat-details {
        color: var(--text-primary);
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .detail-item h4 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        font-size: 1rem;
        font-weight: 600;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 0.5rem;
    }
    
    .detail-item p {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
    }
    
    .monthly-chart-container {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }
    
    .monthly-chart-container h4 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        font-size: 1rem;
        font-weight: 600;
    }
    
    .notification {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .compact-view th:nth-child(n+5),
    .compact-view td:nth-child(n+5) {
        display: none;
    }
    
    @media (max-width: 768px) {
        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(detailStyles);