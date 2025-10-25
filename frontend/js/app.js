const API_CONFIG = {
    ORGANIZATION_SERVICE: '/organization',
    ORGDIRECTORY_SERVICE: '/orgdirectory'
};

let currentOrganizations = [];
let currentPage = 0;
let pageSize = 10;
let totalPages = 0;
let activeFilters = [];

document.addEventListener('DOMContentLoaded', function() {
    loadOrganizations();
    setupEventListeners();
    generateOrganizationForm('createForm');
    generateOrganizationForm('editForm');
});

function setupEventListeners() {
    document.getElementById('filterField').addEventListener('change', updateFilterOperatorOptions);
}

async function loadOrganizations(page = 0) {
    try {
        showLoading('organizationsTable');

        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: page,
                size: pageSize,
                filters: [],
                sort: [{ field: 'id', direction: 'asc' }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        currentOrganizations = data.organizations;
        currentPage = data.page;
        totalPages = data.totalPages;

        displayOrganizations(currentOrganizations);
        setupPagination(currentPage, totalPages);

    } catch (error) {
        showAlert(`Error loading organizations: ${error.message}`, 'danger');
        console.error('Error details:', error);
    }
}
function displayOrganizations(organizations) {
    const tbody = document.getElementById('organizationsTable');
    tbody.innerHTML = '';

    if (organizations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-2x mb-2"></i><br>
                    No organizations found
                </td>
            </tr>
        `;
        return;
    }

    organizations.forEach(org => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${org.id}</td>
            <td>${escapeHtml(org.name)}</td>
            <td>${escapeHtml(org.fullName)}</td>
            <td><span class="badge bg-secondary">${org.type || 'N/A'}</span></td>
            <td>${org.annualTurnover ? formatCurrency(org.annualTurnover) : 'N/A'}</td>
            <td>${escapeHtml(org.postalAddress.street)}</td>
            <td>(${org.coordinates.x}, ${org.coordinates.y})</td>
            <td>${formatDate(org.creationDate)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editOrganization(${org.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteOrganization(${org.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="loadOrganizations(${currentPage - 1})" tabindex="-1">
            <i class="fas fa-chevron-left"></i>
        </a>
    `;
    pagination.appendChild(prevLi);

    for (let i = 0; i < totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="loadOrganizations(${i})">${i + 1}</a>
        `;
        pagination.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="loadOrganizations(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
    pagination.appendChild(nextLi);
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts');
    const alertId = 'alert-' + Date.now();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertsContainer.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2">Loading...</div>
                </td>
            </tr>
        `;
    }
}

function generateOrganizationForm(formId) {
    const form = document.getElementById(formId);
    form.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" name="fullName" required>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Coordinate X *</label>
                    <input type="number" step="any" class="form-control" name="coordinates.x" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Coordinate Y *</label>
                    <input type="number" step="any" class="form-control" name="coordinates.y" required>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Annual Turnover</label>
                    <input type="number" class="form-control" name="annualTurnover" min="1">
                    <div class="form-text">Must be greater than 0</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Type</label>
                    <select class="form-select" name="type">
                        <option value="">Select type</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="GOVERNMENT">Government</option>
                        <option value="TRUST">Trust</option>
                        <option value="PRIVATE_LIMITED_COMPANY">Private Limited Company</option>
                        <option value="OPEN_JOINT_STOCK_COMPANY">Open Joint Stock Company</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Street Address *</label>
            <input type="text" class="form-control" name="postalAddress.street" required>
        </div>
    `;
}