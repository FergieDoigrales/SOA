const API_CONFIG = {
    ORGANIZATION_SERVICE: '/organization',
    ORGDIRECTORY_SERVICE: '/orgdirectory'
};

let currentOrganizations = [];
let currentPage = 0;
let pageSize = 10;
let totalPages = 0;
let activeFilters = [];
let currentSorts = [{ field: 'id', direction: 'asc', priority: 1 }];
let currentEditingId = null;

const FIELD_CONSTRAINTS = {
    name: {
        type: 'string',
        maxLength: 255,
        pattern: '[\\s\\S]{1,255}',
        allowedChars: 'any symbols',
        min: 1,
        max: 255
    },
    fullName: {
        type: 'string',
        maxLength: 255,
        pattern: '[\\s\\S]{1,255}',
        allowedChars: 'any symbols',
        min: 1,
        max: 255
    },
    street: {
        type: 'string',
        maxLength: 255,
        pattern: '[\\s\\S]{1,255}',
        allowedChars: 'any symbols',
        min: 1,
        max: 255
    },
    coordinatesX: {
        type: 'double',
        min: -1.7976931348623157e+308,
        max: 1.7976931348623157e+308,
        pattern: '[+-]?([0-9]*[.])?[0-9]+',
        allowedChars: 'numbers, point, +/-',
        step: 'any'
    },
    coordinatesY: {
        type: 'float',
        min: -3.4028235e+38,
        max: 3.4028235e+38,
        pattern: '[+-]?([0-9]*[.])?[0-9]+',
        allowedChars: 'numbers, point, +/-',
        step: 'any'
    },
    annualTurnover: {
        type: 'integer',
        min: 1,
        max: 2147483647,
        pattern: '[0-9]+',
        allowedChars: 'numbers only',
        step: 1
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadOrganizations();
    setupEventListeners();
    generateOrganizationForm('createForm');
    generateOrganizationForm('editForm');
    setupTableSorting();
    setupInputValidation();
});

function setupEventListeners() {
    document.getElementById('filterField').addEventListener('change', updateFilterOperatorOptions);
    document.getElementById('filterValue').addEventListener('input', validateFilterInput);
}

function setupInputValidation() {
    document.addEventListener('input', function(e) {
        const fieldName = e.target.name;

        if (fieldName === 'annualTurnover' || e.target.id === 'minTurnover' || e.target.id === 'maxTurnover') {
            validateIntegerInput(e.target);
        } else if (fieldName === 'coordinates.x') {
            validateDoubleInput(e.target);
        } else if (fieldName === 'coordinates.y') {
            validateFloatInput(e.target);
        } else if (fieldName === 'name' || fieldName === 'fullName' || fieldName === 'postalAddress.street') {
            validateStringInput(e.target, FIELD_CONSTRAINTS[fieldName === 'postalAddress.street' ? 'street' : fieldName]);
        }
    });
}

function validateFilterInput() {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOperator').value;
    const input = document.getElementById('filterValue');
    let value = input.value;

    input.classList.remove('is-invalid', 'is-valid');

    if (!value) return;

    switch (field) {
        case 'name':
        case 'fullName':
        case 'postalAddress.street':
            if (value.length > FIELD_CONSTRAINTS.name.maxLength) {
                input.value = value.substring(0, FIELD_CONSTRAINTS.name.maxLength);
                input.classList.add('is-invalid');
            } else if (value.length >= 1) {
                input.classList.add('is-valid');
            }
            break;

        case 'annualTurnover':
            let turnoverValue = value.replace(/[^\d]/g, '');

            if (turnoverValue.length > 1 && turnoverValue.startsWith('0')) {
                turnoverValue = turnoverValue.replace(/^0+/, '');
                if (turnoverValue === '') turnoverValue = '0';
            }

            const numValue = parseInt(turnoverValue || '0');
            if (turnoverValue && (numValue < FIELD_CONSTRAINTS.annualTurnover.min ||
                numValue > FIELD_CONSTRAINTS.annualTurnover.max)) {
                input.classList.add('is-invalid');
            } else if (turnoverValue) {
                input.classList.add('is-valid');
            }

            input.value = turnoverValue;
            break;

        case 'coordinates.x':
            let coordXValue = value.replace(/[^\d.-]/g, '');

            if (coordXValue.includes('-')) {
                if (coordXValue.indexOf('-') !== 0) {
                    coordXValue = coordXValue.replace(/-/g, '');
                } else if (coordXValue.lastIndexOf('-') > 0) {
                    coordXValue = '-' + coordXValue.replace(/-/g, '');
                }
            }

            if ((coordXValue.match(/\./g) || []).length > 1) {
                const parts = coordXValue.split('.');
                coordXValue = parts[0] + '.' + parts.slice(1).join('');
            }

            if (coordXValue.includes('.')) {
                const parts = coordXValue.split('.');
                if (parts[1].length > 7) {
                    parts[1] = parts[1].substring(0, 7);
                    coordXValue = parts[0] + '.' + parts[1];
                }
            }

            const numXValue = parseFloat(coordXValue || '0');
            if (coordXValue && !isNaN(numXValue) &&
                (numXValue < FIELD_CONSTRAINTS.coordinatesX.min ||
                 numXValue > FIELD_CONSTRAINTS.coordinatesX.max)) {
                input.classList.add('is-invalid');
            } else if (coordXValue) {
                input.classList.add('is-valid');
            }

            input.value = coordXValue;
            break;

        case 'coordinates.y':
            let coordYValue = value.replace(/[^\d.-]/g, '');

            if (coordYValue.includes('-')) {
                if (coordYValue.indexOf('-') !== 0) {
                    coordYValue = coordYValue.replace(/-/g, '');
                } else if (coordYValue.lastIndexOf('-') > 0) {
                    coordYValue = '-' + coordYValue.replace(/-/g, '');
                }
            }

            if ((coordYValue.match(/\./g) || []).length > 1) {
                const parts = coordYValue.split('.');
                coordYValue = parts[0] + '.' + parts.slice(1).join('');
            }

            if (coordYValue.includes('.')) {
                const parts = coordYValue.split('.');
                if (parts[1].length > 7) {
                    parts[1] = parts[1].substring(0, 7);
                    coordYValue = parts[0] + '.' + parts[1];
                }
            }

            const numYValue = parseFloat(coordYValue || '0');
            if (coordYValue && !isNaN(numYValue) &&
                (numYValue < FIELD_CONSTRAINTS.coordinatesY.min ||
                 numYValue > FIELD_CONSTRAINTS.coordinatesY.max)) {
                input.classList.add('is-invalid');
            } else if (coordYValue) {
                input.classList.add('is-valid');
            }

            input.value = coordYValue;
            break;

        case 'type':

            const validTypes = ['COMMERCIAL', 'GOVERNMENT', 'TRUST', 'PRIVATE_LIMITED_COMPANY', 'OPEN_JOINT_STOCK_COMPANY'];
            const upperValue = value.toUpperCase();

            if (validTypes.includes(upperValue)) {
                input.classList.add('is-valid');
            } else if (value.length > 0) {
                input.classList.add('is-invalid');
            }
            break;
    }
}

function validateIntegerInput(input) {
    let value = input.value;

    value = value.replace(/[^\d]/g, '');

    if (value.length > 1 && value.startsWith('0')) {
        value = value.replace(/^0+/, '');
        if (value === '') value = '0';
    }

    const numValue = parseInt(value || '0');
    if (value && (numValue < FIELD_CONSTRAINTS.annualTurnover.min || numValue > FIELD_CONSTRAINTS.annualTurnover.max)) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }

    input.value = value;
}

function validateDoubleInput(input) {
    let value = input.value;

    const cursorPosition = input.selectionStart;

    value = value.replace(/[^\d.-]/g, '');

    if (value.includes('-')) {
        if (value.indexOf('-') !== 0) {
            value = value.replace(/-/g, '');
        } else if (value.lastIndexOf('-') > 0) {
            value = '-' + value.replace(/-/g, '');
        }
    }

    if ((value.match(/\./g) || []).length > 1) {
        const parts = value.split('.');
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1].length > 7) {
            parts[1] = parts[1].substring(0, 7);
            value = parts[0] + '.' + parts[1];
        }
    }

    input.value = value;
    input.setSelectionRange(cursorPosition, cursorPosition);

    const numValue = parseFloat(value || '0');
    if (value && !isNaN(numValue) &&
        (numValue < FIELD_CONSTRAINTS.coordinatesX.min || numValue > FIELD_CONSTRAINTS.coordinatesX.max)) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

function validateFloatInput(input) {
    let value = input.value;

    const cursorPosition = input.selectionStart;

    value = value.replace(/[^\d.-]/g, '');

    if (value.includes('-')) {
        if (value.indexOf('-') !== 0) {
            value = value.replace(/-/g, '');
        } else if (value.lastIndexOf('-') > 0) {
            value = '-' + value.replace(/-/g, '');
        }
    }

    if ((value.match(/\./g) || []).length > 1) {
        const parts = value.split('.');
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1].length > 7) {
            parts[1] = parts[1].substring(0, 7);
            value = parts[0] + '.' + parts[1];
        }
    }

    input.value = value;
    input.setSelectionRange(cursorPosition, cursorPosition);

    const numValue = parseFloat(value || '0');
    if (value && !isNaN(numValue) &&
        (numValue < FIELD_CONSTRAINTS.coordinatesY.min || numValue > FIELD_CONSTRAINTS.coordinatesY.max)) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

function validateStringInput(input, constraints) {
    let value = input.value;

    if (value.length > constraints.maxLength) {
        value = value.substring(0, constraints.maxLength);
        input.value = value;
    }

    if (value.length < constraints.min) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

function setupTableSorting() {
    const organizationsTable = document.getElementById('organizationsMainTable');
    if (organizationsTable) {
        organizationsTable.addEventListener('click', function(e) {
            const th = e.target.closest('th[data-field]');
            if (th) {
                const field = th.getAttribute('data-field');
                const ctrlPressed = e.ctrlKey || e.metaKey;
                handleSortClick(field, ctrlPressed);
            }
        });
    }
}

function handleSortClick(field, isMultiSort = false) {
    console.log('Sort click:', field, 'Multi:', isMultiSort);

    const existingSortIndex = currentSorts.findIndex(sort => sort.field === field);

    if (existingSortIndex !== -1) {
        currentSorts[existingSortIndex].direction =
            currentSorts[existingSortIndex].direction === 'asc' ? 'desc' : 'asc';

        if (!isMultiSort) {
            const existingSort = currentSorts.splice(existingSortIndex, 1)[0];
            currentSorts.unshift(existingSort);
            updateSortPriorities();
        }
    } else {
        if (isMultiSort) {
            const newPriority = currentSorts.length > 0 ? Math.max(...currentSorts.map(s => s.priority)) + 1 : 1;
            currentSorts.push({
                field: field,
                direction: 'asc',
                priority: newPriority
            });
        } else {
            currentSorts = [{
                field: field,
                direction: 'asc',
                priority: 1
            }];
        }
    }

    updateSortIndicators();
    loadOrganizations(0);
}

function updateSortPriorities() {
    currentSorts.forEach((sort, index) => {
        sort.priority = index + 1;
    });
}

function updateSortIndicators() {
    const table = document.getElementById('organizationsMainTable');
    if (!table) return;

    const headers = table.querySelectorAll('th[data-field]');
    headers.forEach(header => {
        const field = header.getAttribute('data-field');
        let sortIcon = header.querySelector('.sort-icon');
        let priorityBadge = header.querySelector('.priority-badge');

        if (!sortIcon) {
            sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon ms-1';
            header.appendChild(sortIcon);
        }

        if (!priorityBadge) {
            priorityBadge = document.createElement('span');
            priorityBadge.className = 'priority-badge badge bg-secondary ms-1';
            header.appendChild(priorityBadge);
        }

        const sortConfig = currentSorts.find(sort => sort.field === field);

        if (sortConfig) {
            sortIcon.className = `sort-icon ms-1 fas fa-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'}`;
            priorityBadge.textContent = sortConfig.priority;
            priorityBadge.className = `priority-badge badge ${sortConfig.priority === 1 ? 'bg-primary' : 'bg-secondary'} ms-1`;
            header.style.color = '#0d6efd';
        } else {
            sortIcon.className = 'sort-icon ms-1';
            priorityBadge.textContent = '';
            header.style.color = '';
        }
    });
}

async function loadOrganizations(page = 0) {
    try {
        showLoading('organizationsTable');

        const response = await fetch(`${API_CONFIG.ORGDIRECTORY_SERVICE}/orgdirectory/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: page,
                size: pageSize,
                filters: [],
                sort: currentSorts
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
            <td>(${formatNumber(org.coordinates.x)}, ${formatNumber(org.coordinates.y)})</td>
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

function formatNumber(num, maxDecimals = 7) {
    if (num === null || num === undefined) return 'N/A';

    const numStr = num.toString();

    if (!numStr.includes('.')) {
        return numStr;
    }

    const [integerPart, decimalPart] = numStr.split('.');

    const limitedDecimalPart = decimalPart.substring(0, maxDecimals);

    let result = integerPart;
    if (limitedDecimalPart && limitedDecimalPart !== '0') {
        let lastNonZeroIndex = limitedDecimalPart.length - 1;
        while (lastNonZeroIndex >= 0 && limitedDecimalPart[lastNonZeroIndex] === '0') {
            lastNonZeroIndex--;
        }

        if (lastNonZeroIndex >= 0) {
            result += '.' + limitedDecimalPart.substring(0, lastNonZeroIndex + 1);
        }
    }

    return result;
}
function clearSorts() {
    currentSorts = [{ field: 'id', direction: 'asc', priority: 1 }];
    updateSortIndicators();
    loadOrganizations(0);
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
        <i class="fas fa-${getAlertIcon(type)} me-2"></i>
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

function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'danger': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
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
                    <input type="text" class="form-control" name="name"
                           maxlength="${FIELD_CONSTRAINTS.name.maxLength}"
                           pattern="${FIELD_CONSTRAINTS.name.pattern}"
                           title="Name (1-${FIELD_CONSTRAINTS.name.maxLength} characters)"
                           required>
                    <div class="form-text">Required, ${FIELD_CONSTRAINTS.name.maxLength} characters max, ${FIELD_CONSTRAINTS.name.allowedChars}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" name="fullName"
                           maxlength="${FIELD_CONSTRAINTS.fullName.maxLength}"
                           pattern="${FIELD_CONSTRAINTS.fullName.pattern}"
                           title="Full Name (1-${FIELD_CONSTRAINTS.fullName.maxLength} characters)"
                           required>
                    <div class="form-text">Required, ${FIELD_CONSTRAINTS.fullName.maxLength} characters max, ${FIELD_CONSTRAINTS.fullName.allowedChars}</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Coordinate X *</label>
                    <input type="text" class="form-control" name="coordinates.x"
                           pattern="${FIELD_CONSTRAINTS.coordinatesX.pattern}"
                           title="Double value (${FIELD_CONSTRAINTS.coordinatesX.min} to ${FIELD_CONSTRAINTS.coordinatesX.max})"
                           oninput="validateDoubleInput(this)"
                           maxlength="30"
                           required>
                    <div class="form-text">Required, Double type, max 7 decimal places, ${FIELD_CONSTRAINTS.coordinatesX.allowedChars}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Coordinate Y *</label>
                    <input type="text" class="form-control" name="coordinates.y"
                           pattern="${FIELD_CONSTRAINTS.coordinatesY.pattern}"
                           title="Float value (${FIELD_CONSTRAINTS.coordinatesY.min} to ${FIELD_CONSTRAINTS.coordinatesY.max})"
                           oninput="validateFloatInput(this)"
                           maxlength="30"
                           required>
                    <div class="form-text">Required, Float type, ${FIELD_CONSTRAINTS.coordinatesY.allowedChars}</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Annual Turnover</label>
                    <input type="text" class="form-control" name="annualTurnover"
                           pattern="${FIELD_CONSTRAINTS.annualTurnover.pattern}"
                           title="Integer value (${FIELD_CONSTRAINTS.annualTurnover.min} to ${FIELD_CONSTRAINTS.annualTurnover.max})">
                    <div class="form-text">Optional, Integer type, ${FIELD_CONSTRAINTS.annualTurnover.min}-${FIELD_CONSTRAINTS.annualTurnover.max}, ${FIELD_CONSTRAINTS.annualTurnover.allowedChars}</div>
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
                    <div class="form-text">Optional, select from predefined values</div>
                </div>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Street Address *</label>
            <input type="text" class="form-control" name="postalAddress.street"
                   maxlength="${FIELD_CONSTRAINTS.street.maxLength}"
                   pattern="${FIELD_CONSTRAINTS.street.pattern}"
                   title="Street Address (1-${FIELD_CONSTRAINTS.street.maxLength} characters)"
                   required>
            <div class="form-text">Required, ${FIELD_CONSTRAINTS.street.maxLength} characters max, ${FIELD_CONSTRAINTS.street.allowedChars}</div>
        </div>
    `;
}

function getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    return data;
}

function addFilter() {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOperator').value;
    const valueInput = document.getElementById('filterValue');
    const value = valueInput.value;

    if (!field || !operator || !value) {
        showAlert('Please fill all filter fields', 'warning');
        return;
    }

    if (valueInput.classList.contains('is-invalid')) {
        showAlert('Please enter a valid value for the selected field', 'warning');
        return;
    }

    const filter = {
        field,
        operator,
        value: parseFilterValue(value, operator, field)
    };

    activeFilters.push(filter);
    updateActiveFiltersDisplay();
    valueInput.value = '';
    valueInput.classList.remove('is-valid');
}

function parseFilterValue(value, operator, field) {
    if (operator === 'in') {
        return value.split(',').map(v => convertFilterValue(v.trim(), field));
    }
    if (operator === 'between') {
        const values = value.split(',').map(v => v.trim());
        if (values.length === 2) {
            return values.map(v => convertFilterValue(v, field));
        }
    }
    return convertFilterValue(value, field);
}

function convertFilterValue(value, field) {
    if (field === 'annualTurnover') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? value : parsed;
    } else if (field.includes('coordinates')) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? value : parsed;
    } else if (field === 'type') {
        return value.toUpperCase();
    }
    return value;
}

function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '<h6>Active Filters:</h6>';

    activeFilters.forEach((filter, index) => {
        const filterTag = document.createElement('div');
        filterTag.className = 'filter-tag';
        filterTag.innerHTML = `
            ${filter.field} ${filter.operator} ${JSON.stringify(filter.value)}
            <span class="close" onclick="removeFilter(${index})">&times;</span>
        `;
        container.appendChild(filterTag);
    });
}

function removeFilter(index) {
    activeFilters.splice(index, 1);
    updateActiveFiltersDisplay();
}

function clearFilters() {
    activeFilters = [];
    updateActiveFiltersDisplay();
}

async function performSearch() {
    try {
        showLoading('searchResults');

        const searchRequest = {
            filters: activeFilters,
            sort: [{ field: 'id', direction: 'asc' }],
            page: 0,
            size: 50
        };

        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchRequest)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displaySearchResults(data.organizations);

    } catch (error) {
        showAlert(`Error performing search: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function displaySearchResults(organizations) {
    const container = document.getElementById('searchResults');

    if (organizations.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-search fa-2x mb-2"></i><br>
                No organizations found matching your criteria
            </div>
        `;
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Full Name</th>
                        <th>Type</th>
                        <th>Annual Turnover</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
    `;

    organizations.forEach(org => {
        html += `
            <tr>
                <td>${org.id}</td>
                <td>${escapeHtml(org.name)}</td>
                <td>${escapeHtml(org.fullName)}</td>
                <td><span class="badge bg-secondary">${org.type || 'N/A'}</span></td>
                <td>${org.annualTurnover ? formatCurrency(org.annualTurnover) : 'N/A'}</td>
                <td>${escapeHtml(org.postalAddress.street)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <div class="mt-2 text-muted">Found ${organizations.length} organizations</div>
    `;

    container.innerHTML = html;
}

function updateFilterOperatorOptions() {
    const field = document.getElementById('filterField').value;
    const operatorSelect = document.getElementById('filterOperator');
    const valueInput = document.getElementById('filterValue');

    valueInput.value = '';
    valueInput.classList.remove('is-invalid', 'is-valid');

    switch (field) {
        case 'name':
        case 'fullName':
        case 'postalAddress.street':
            valueInput.type = 'text';
            valueInput.maxLength = FIELD_CONSTRAINTS.name.maxLength;
            valueInput.placeholder = `Enter text (max ${FIELD_CONSTRAINTS.name.maxLength} chars)`;
            break;

        case 'annualTurnover':
            valueInput.type = 'text';
            valueInput.pattern = FIELD_CONSTRAINTS.annualTurnover.pattern;
            valueInput.placeholder = `Enter integer (${FIELD_CONSTRAINTS.annualTurnover.min}-${FIELD_CONSTRAINTS.annualTurnover.max})`;
            break;

        case 'coordinates.x':
            valueInput.type = 'text';
            valueInput.pattern = FIELD_CONSTRAINTS.coordinatesX.pattern;
            valueInput.placeholder = 'Enter decimal number for X coordinate';
            break;

        case 'coordinates.y':
            valueInput.type = 'text';
            valueInput.pattern = FIELD_CONSTRAINTS.coordinatesY.pattern;
            valueInput.placeholder = 'Enter decimal number for Y coordinate';
            break;

        case 'type':
            valueInput.type = 'text';
            valueInput.placeholder = 'COMMERCIAL, GOVERNMENT, TRUST, etc';
            break;
    }

    if (field === 'type') {
        operatorSelect.innerHTML = `
            <option value="eq">Equals</option>
            <option value="ne">Not Equals</option>
            <option value="in">In List</option>
        `;
    } else if (field.includes('coordinates')) {
        operatorSelect.innerHTML = `
            <option value="eq">Equals</option>
            <option value="ne">Not Equals</option>
            <option value="gt">Greater Than</option>
            <option value="gte">Greater Than or Equal</option>
            <option value="lt">Less Than</option>
            <option value="lte">Less Than or Equal</option>
            <option value="between">Between</option>
        `;
    } else {
        operatorSelect.innerHTML = `
            <option value="eq">Equals</option>
            <option value="ne">Not Equals</option>
            <option value="gt">Greater Than</option>
            <option value="gte">Greater Than or Equal</option>
            <option value="lt">Less Than</option>
            <option value="lte">Less Than or Equal</option>
            <option value="like">Contains</option>
            <option value="in">In List</option>
            <option value="between">Between</option>
        `;
    }
}