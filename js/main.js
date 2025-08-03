// Main JavaScript file for Tugboat Statistics Dashboard

// Global variables
let tugboatData = null;
let allTowsData = [];
let filteredTowsData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Load data
        await loadTugboatData();
        
        // Initialize UI components
        updateCurrentDate();
        updateLastUpdateTime();
        populateMetricCards();
        populateLocationFilter();
        populateDataTable();
        setupEventListeners();
        
        // Initialize charts
        if (typeof initializeCharts === 'function') {
            initializeCharts();
        }
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Erreur lors du chargement des données.');
    }
}

// Load tugboat data from JSON file
async function loadTugboatData() {
    try {
        const response = await fetch('data/tugboat-stats.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        tugboatData = await response.json();
        allTowsData = tugboatData.recentTows || [];
        filteredTowsData = [...allTowsData];
        return tugboatData;
    } catch (error) {
        console.error('Error loading tugboat data:', error);
        throw error;
    }
}

// Update current date in navigation
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('fr-FR', options);
}

// Update last update time in footer
function updateLastUpdateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('last-update').textContent = 
        now.toLocaleDateString('fr-FR', options);
}

// Populate metric cards with data
function populateMetricCards() {
    if (!tugboatData?.overview) return;
    
    const overview = tugboatData.overview;
    
    // Update metric values with animation
    animateCounter('total-tows', overview.totalTows);
    animateCounter('avg-time', overview.averageTowTime);
    animateCounter('total-distance', overview.totalDistance);
    animateCounter('efficiency', overview.energyEfficiency, 1);
    animateCounter('uptime', overview.uptime, 1);
    animateCounter('downtime', overview.downtime, 1);
}

// Animate counter for metric cards
function animateCounter(elementId, targetValue, decimals = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easeOutCubic;
        
        element.textContent = currentValue.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue.toFixed(decimals);
        }
    }
    
    updateCounter();
}

// Populate location filter dropdown
function populateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');
    if (!locationFilter || !tugboatData?.locations) return;
    
    // Clear existing options except "All locations"
    locationFilter.innerHTML = '<option value="">Toutes localisations</option>';
    
    tugboatData.locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.name;
        option.textContent = `${location.name} (${location.tows})`;
        locationFilter.appendChild(option);
    });
}

// Populate data table
function populateDataTable(data = filteredTowsData) {
    const tableBody = document.querySelector('#towsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.forEach(tow => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${tow.id}</code></td>
            <td>${formatDate(tow.date)}</td>
            <td><span class="badge bg-primary">${tow.type}</span></td>
            <td>${tow.vessel}</td>
            <td>${tow.location}</td>
            <td>${tow.duration}</td>
            <td>${tow.distance}</td>
            <td><span class="badge bg-success">${tow.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add fade-in animation
    tableBody.classList.add('fade-in');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

// Setup event listeners
function setupEventListeners() {
    // Filter toggle
    const filterBtn = document.getElementById('filterBtn');
    const filtersPanel = document.getElementById('filtersPanel');
    
    if (filterBtn && filtersPanel) {
        filterBtn.addEventListener('click', function() {
            const isHidden = filtersPanel.style.display === 'none';
            filtersPanel.style.display = isHidden ? 'block' : 'none';
            filterBtn.innerHTML = isHidden ? 
                '<i class="fas fa-filter me-1"></i>Masquer' : 
                '<i class="fas fa-filter me-1"></i>Filtres';
        });
    }
    
    // Apply filters
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Export data
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Apply filters to data
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    
    filteredTowsData = allTowsData.filter(tow => {
        let matches = true;
        
        // Date filter
        if (dateFilter) {
            const towDate = new Date(tow.date).toISOString().split('T')[0];
            matches = matches && towDate === dateFilter;
        }
        
        // Type filter
        if (typeFilter) {
            matches = matches && tow.type === typeFilter;
        }
        
        // Location filter
        if (locationFilter) {
            matches = matches && tow.location === locationFilter;
        }
        
        return matches;
    });
    
    populateDataTable(filteredTowsData);
    
    // Show results count
    showInfo(`${filteredTowsData.length} remorquage(s) trouvé(s)`);
}

// Export data to CSV
function exportData() {
    if (!filteredTowsData.length) {
        showWarning('Aucune donnée à exporter');
        return;
    }
    
    const headers = ['ID', 'Date', 'Type', 'Navire', 'Localisation', 'Durée (min)', 'Distance (km)', 'Statut'];
    const csvContent = [
        headers.join(','),
        ...filteredTowsData.map(tow => [
            tow.id,
            formatDate(tow.date),
            `"${tow.type}"`,
            `"${tow.vessel}"`,
            `"${tow.location}"`,
            tow.duration,
            tow.distance,
            tow.status
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `remorquages_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Données exportées avec succès');
}

// Utility functions for notifications
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'danger');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Get tugboat data for charts
function getTugboatData() {
    return tugboatData;
}

// Utility function to format numbers
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Window resize handler for charts
window.addEventListener('resize', function() {
    if (typeof handleChartResize === 'function') {
        handleChartResize();
    }
});

// Error handler for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Uncaught error:', e.error);
    showError('Une erreur inattendue s\'est produite.');
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('Erreur de chargement des données.');
});