
// Initialize data from localStorage
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
let maintenances = JSON.parse(localStorage.getItem('maintenances')) || [];
let fuels = JSON.parse(localStorage.getItem('fuels')) || [];

// Save data to localStorage
function saveData() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('maintenances', JSON.stringify(maintenances));
    localStorage.setItem('fuels', JSON.stringify(fuels));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== TAB NAVIGATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Initialize the page
    loadVehicles();
    loadMaintenances();
    loadFuels();
    generateReports();
    
    // Set today's date as default for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('maintenanceDate').value = today;
    document.getElementById('fuelDate').value = today;
    
    // Calculate fuel total automatically
    document.getElementById('fuelQuantity').addEventListener('input', calculateFuelTotal);
    document.getElementById('fuelPrice').addEventListener('input', calculateFuelTotal);
});

// ==================== VEHICLES MANAGEMENT ====================

function showVehicleForm() {
    document.getElementById('vehicleFormContainer').classList.remove('hidden');
    document.getElementById('vehicleFormTitle').textContent = 'Adicionar Novo Veículo';
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
}

function hideVehicleForm() {
    document.getElementById('vehicleFormContainer').classList.add('hidden');
    document.getElementById('vehicleForm').reset();
}

document.getElementById('vehicleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('vehicleId').value;
    const vehicle = {
        id: id || generateId(),
        plate: document.getElementById('vehiclePlate').value.toUpperCase(),
        model: document.getElementById('vehicleModel').value,
        year: document.getElementById('vehicleYear').value,
        color: document.getElementById('vehicleColor').value,
        notes: document.getElementById('vehicleNotes').value
    };
    
    if (id) {
        // Update existing vehicle
        const index = vehicles.findIndex(v => v.id === id);
        vehicles[index] = vehicle;
    } else {
        // Add new vehicle
        vehicles.push(vehicle);
    }
    
    saveData();
    loadVehicles();
    updateVehicleSelects();
    hideVehicleForm();
    generateReports();
});

function loadVehicles() {
    const tbody = document.getElementById('vehiclesTableBody');
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">Nenhum veículo cadastrado. Clique em "Adicionar Veículo" para começar.</td></tr>';
        return;
    }
    
    tbody.innerHTML = vehicles.map(vehicle => `
        <tr>
            <td><strong>${vehicle.plate}</strong></td>
            <td>${vehicle.model}</td>
            <td>${vehicle.year || '-'}</td>
            <td>${vehicle.color || '-'}</td>
            <td>${vehicle.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editVehicle('${vehicle.id}')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteVehicle('${vehicle.id}')">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateVehicleSelects();
}

function editVehicle(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    document.getElementById('vehicleId').value = vehicle.id;
    document.getElementById('vehiclePlate').value = vehicle.plate;
    document.getElementById('vehicleModel').value = vehicle.model;
    document.getElementById('vehicleYear').value = vehicle.year;
    document.getElementById('vehicleColor').value = vehicle.color;
    document.getElementById('vehicleNotes').value = vehicle.notes;
    
    document.getElementById('vehicleFormTitle').textContent = 'Editar Veículo';
    document.getElementById('vehicleFormContainer').classList.remove('hidden');
}

function deleteVehicle(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo? Todas as manutenções e abastecimentos relacionados também serão excluídos.')) {
        return;
    }
    
    vehicles = vehicles.filter(v => v.id !== id);
    maintenances = maintenances.filter(m => m.vehicleId !== id);
    fuels = fuels.filter(f => f.vehicleId !== id);
    
    saveData();
    loadVehicles();
    loadMaintenances();
    loadFuels();
    generateReports();
}

function updateVehicleSelects() {
    const maintenanceSelect = document.getElementById('maintenanceVehicle');
    const fuelSelect = document.getElementById('fuelVehicle');
    
    const options = vehicles.map(v => 
        `<option value="${v.id}">${v.plate} - ${v.model}</option>`
    ).join('');
    
    maintenanceSelect.innerHTML = '<option value="">Selecione um veículo</option>' + options;
    fuelSelect.innerHTML = '<option value="">Selecione um veículo</option>' + options;
}

// ==================== MAINTENANCE MANAGEMENT ====================

function showMaintenanceForm() {
    if (vehicles.length === 0) {
        alert('Por favor, cadastre pelo menos um veículo antes de adicionar manutenções.');
        return;
    }
    
    document.getElementById('maintenanceFormContainer').classList.remove('hidden');
    document.getElementById('maintenanceFormTitle').textContent = 'Adicionar Nova Manutenção';
    document.getElementById('maintenanceForm').reset();
    document.getElementById('maintenanceId').value = '';
    document.getElementById('maintenanceDate').value = new Date().toISOString().split('T')[0];
}

function hideMaintenanceForm() {
    document.getElementById('maintenanceFormContainer').classList.add('hidden');
    document.getElementById('maintenanceForm').reset();
}

document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('maintenanceId').value;
    const maintenance = {
        id: id || generateId(),
        vehicleId: document.getElementById('maintenanceVehicle').value,
        date: document.getElementById('maintenanceDate').value,
        type: document.getElementById('maintenanceType').value,
        cost: parseFloat(document.getElementById('maintenanceCost').value),
        odometer: document.getElementById('maintenanceOdometer').value,
        provider: document.getElementById('maintenanceProvider').value,
        description: document.getElementById('maintenanceDescription').value
    };
    
    if (id) {
        // Update existing maintenance
        const index = maintenances.findIndex(m => m.id === id);
        maintenances[index] = maintenance;
    } else {
        // Add new maintenance
        maintenances.push(maintenance);
    }
    
    saveData();
    loadMaintenances();
    hideMaintenanceForm();
    generateReports();
});

function loadMaintenances() {
    const tbody = document.getElementById('maintenanceTableBody');
    
    if (maintenances.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">Nenhuma manutenção registrada. Clique em "Adicionar Manutenção" para começar.</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedMaintenances = [...maintenances].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedMaintenances.map(maintenance => {
        const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
        const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado';
        
        return `
            <tr>
                <td>${formatDate(maintenance.date)}</td>
                <td>${vehicleInfo}</td>
                <td>${maintenance.type}</td>
                <td>${formatCurrency(maintenance.cost)}</td>
                <td>${maintenance.odometer ? maintenance.odometer + ' km' : '-'}</td>
                <td>${maintenance.provider || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editMaintenance('${maintenance.id}')">Editar</button>
                        <button class="btn btn-danger" onclick="deleteMaintenance('${maintenance.id}')">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function editMaintenance(id) {
    const maintenance = maintenances.find(m => m.id === id);
    if (!maintenance) return;
    
    document.getElementById('maintenanceId').value = maintenance.id;
    document.getElementById('maintenanceVehicle').value = maintenance.vehicleId;
    document.getElementById('maintenanceDate').value = maintenance.date;
    document.getElementById('maintenanceType').value = maintenance.type;
    document.getElementById('maintenanceCost').value = maintenance.cost;
    document.getElementById('maintenanceOdometer').value = maintenance.odometer;
    document.getElementById('maintenanceProvider').value = maintenance.provider;
    document.getElementById('maintenanceDescription').value = maintenance.description;
    
    document.getElementById('maintenanceFormTitle').textContent = 'Editar Manutenção';
    document.getElementById('maintenanceFormContainer').classList.remove('hidden');
}

function deleteMaintenance(id) {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) {
        return;
    }
    
    maintenances = maintenances.filter(m => m.id !== id);
    saveData();
    loadMaintenances();
    generateReports();
}

// ==================== FUEL MANAGEMENT ====================

function showFuelForm() {
    if (vehicles.length === 0) {
        alert('Por favor, cadastre pelo menos um veículo antes de adicionar abastecimentos.');
        return;
    }
    
    document.getElementById('fuelFormContainer').classList.remove('hidden');
    document.getElementById('fuelFormTitle').textContent = 'Adicionar Novo Abastecimento';
    document.getElementById('fuelForm').reset();
    document.getElementById('fuelId').value = '';
    document.getElementById('fuelDate').value = new Date().toISOString().split('T')[0];
}

function hideFuelForm() {
    document.getElementById('fuelFormContainer').classList.add('hidden');
    document.getElementById('fuelForm').reset();
}

function calculateFuelTotal() {
    const quantity = parseFloat(document.getElementById('fuelQuantity').value) || 0;
    const price = parseFloat(document.getElementById('fuelPrice').value) || 0;
    const total = quantity * price;
    document.getElementById('fuelTotal').value = total.toFixed(2);
}

document.getElementById('fuelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('fuelId').value;
    const fuel = {
        id: id || generateId(),
        vehicleId: document.getElementById('fuelVehicle').value,
        date: document.getElementById('fuelDate').value,
        type: document.getElementById('fuelType').value,
        quantity: parseFloat(document.getElementById('fuelQuantity').value),
        price: parseFloat(document.getElementById('fuelPrice').value),
        total: parseFloat(document.getElementById('fuelTotal').value),
        odometer: parseInt(document.getElementById('fuelOdometer').value),
        station: document.getElementById('fuelStation').value,
        notes: document.getElementById('fuelNotes').value
    };
    
    if (id) {
        // Update existing fuel
        const index = fuels.findIndex(f => f.id === id);
        fuels[index] = fuel;
    } else {
        // Add new fuel
        fuels.push(fuel);
    }
    
    saveData();
    loadFuels();
    hideFuelForm();
    generateReports();
});

function loadFuels() {
    const tbody = document.getElementById('fuelTableBody');
    
    if (fuels.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhum abastecimento registrado. Clique em "Adicionar Abastecimento" para começar.</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedFuels = [...fuels].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedFuels.map(fuel => {
        const vehicle = vehicles.find(v => v.id === fuel.vehicleId);
        const vehicleInfo = vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado';
        
        return `
            <tr>
                <td>${formatDate(fuel.date)}</td>
                <td>${vehicleInfo}</td>
                <td>${fuel.type}</td>
                <td>${fuel.quantity.toFixed(2)} L</td>
                <td>${formatCurrency(fuel.price)}</td>
                <td>${formatCurrency(fuel.total)}</td>
                <td>${fuel.odometer} km</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editFuel('${fuel.id}')">Editar</button>
                        <button class="btn btn-danger" onclick="deleteFuel('${fuel.id}')">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function editFuel(id) {
    const fuel = fuels.find(f => f.id === id);
    if (!fuel) return;
    
    document.getElementById('fuelId').value = fuel.id;
    document.getElementById('fuelVehicle').value = fuel.vehicleId;
    document.getElementById('fuelDate').value = fuel.date;
    document.getElementById('fuelType').value = fuel.type;
    document.getElementById('fuelQuantity').value = fuel.quantity;
    document.getElementById('fuelPrice').value = fuel.price;
    document.getElementById('fuelTotal').value = fuel.total;
    document.getElementById('fuelOdometer').value = fuel.odometer;
    document.getElementById('fuelStation').value = fuel.station;
    document.getElementById('fuelNotes').value = fuel.notes;
    
    document.getElementById('fuelFormTitle').textContent = 'Editar Abastecimento';
    document.getElementById('fuelFormContainer').classList.remove('hidden');
}

function deleteFuel(id) {
    if (!confirm('Tem certeza que deseja excluir este abastecimento?')) {
        return;
    }
    
    fuels = fuels.filter(f => f.id !== id);
    saveData();
    loadFuels();
    generateReports();
}

// ==================== REPORTS ====================

function generateReports() {
    // General summary
    document.getElementById('totalVehicles').textContent = vehicles.length;
    document.getElementById('totalMaintenances').textContent = maintenances.length;
    document.getElementById('totalFuels').textContent = fuels.length;
    
    // Total costs
    const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
    const totalFuelCost = fuels.reduce((sum, f) => sum + f.total, 0);
    const totalCost = totalMaintenanceCost + totalFuelCost;
    
    document.getElementById('totalMaintenanceCost').textContent = formatCurrency(totalMaintenanceCost);
    document.getElementById('totalFuelCost').textContent = formatCurrency(totalFuelCost);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    
    // Vehicle reports
    const vehicleReportsContainer = document.getElementById('vehicleReports');
    
    if (vehicles.length === 0) {
        vehicleReportsContainer.innerHTML = '<p class="empty-message">Nenhum dado disponível para gerar relatórios.</p>';
        return;
    }
    
    vehicleReportsContainer.innerHTML = vehicles.map(vehicle => {
        const vehicleMaintenances = maintenances.filter(m => m.vehicleId === vehicle.id);
        const vehicleFuels = fuels.filter(f => f.vehicleId === vehicle.id);
        
        const maintenanceCost = vehicleMaintenances.reduce((sum, m) => sum + m.cost, 0);
        const fuelCost = vehicleFuels.reduce((sum, f) => sum + f.total, 0);
        const totalLiters = vehicleFuels.reduce((sum, f) => sum + f.quantity, 0);
        
        // Calculate average consumption
        let avgConsumption = '-';
        if (vehicleFuels.length >= 2) {
            const sortedFuels = [...vehicleFuels].sort((a, b) => a.odometer - b.odometer);
            const firstOdometer = sortedFuels[0].odometer;
            const lastOdometer = sortedFuels[sortedFuels.length - 1].odometer;
            const distance = lastOdometer - firstOdometer;
            
            if (distance > 0 && totalLiters > 0) {
                avgConsumption = (distance / totalLiters).toFixed(2) + ' km/L';
            }
        }
        
        return `
            <div class="vehicle-report-item">
                <h4>🚗 ${vehicle.plate} - ${vehicle.model}</h4>
                <div class="vehicle-report-stats">
                    <div class="stat-item">
                        <span class="stat-label">Manutenções:</span>
                        <span class="stat-value">${vehicleMaintenances.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Custo Manutenções:</span>
                        <span class="stat-value">${formatCurrency(maintenanceCost)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Abastecimentos:</span>
                        <span class="stat-value">${vehicleFuels.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Custo Combustível:</span>
                        <span class="stat-value">${formatCurrency(fuelCost)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Litros:</span>
                        <span class="stat-value">${totalLiters.toFixed(2)} L</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Consumo Médio:</span>
                        <span class="stat-value">${avgConsumption}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
