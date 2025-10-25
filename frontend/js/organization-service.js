let currentEditingId = null;


async function createOrganization() {
    try {
        const formData = getFormData('createForm');
        const organizationData = {
            name: formData.name,
            coordinates: {
                x: parseFloat(formData['coordinates.x']),
                y: parseFloat(formData['coordinates.y'])
            },
            annualTurnover: formData.annualTurnover ? parseInt(formData.annualTurnover) : null,
            fullName: formData.fullName,
            type: formData.type || null,
            postalAddress: {
                street: formData['postalAddress.street']
            }
        };

        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(organizationData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create organization');
        }

        const result = await response.json();
        showAlert('Organization created successfully!', 'success');
        document.getElementById('createModal').querySelector('.btn-close').click();
        loadOrganizations();

    } catch (error) {
        showAlert(`Error creating organization: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

async function editOrganization(id) {
    try {
        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch organization');
        }

        const organization = await response.json();
        currentEditingId = id;

        populateEditForm(organization);
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();

    } catch (error) {
        showAlert(`Error fetching organization: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function populateEditForm(organization) {
    const form = document.getElementById('editForm');
    form.querySelector('[name="name"]').value = organization.name;
    form.querySelector('[name="coordinates.x"]').value = organization.coordinates.x;
    form.querySelector('[name="coordinates.y"]').value = organization.coordinates.y;
    form.querySelector('[name="annualTurnover"]').value = organization.annualTurnover || '';
    form.querySelector('[name="fullName"]').value = organization.fullName;
    form.querySelector('[name="type"]').value = organization.type || '';
    form.querySelector('[name="postalAddress.street"]').value = organization.postalAddress.street;
}

async function updateOrganization() {
    if (!currentEditingId) return;

    try {
        const formData = getFormData('editForm');
        const organizationData = {
            name: formData.name,
            coordinates: {
                x: parseFloat(formData['coordinates.x']),
                y: parseFloat(formData['coordinates.y'])
            },
            annualTurnover: formData.annualTurnover ? parseInt(formData.annualTurnover) : null,
            fullName: formData.fullName,
            type: formData.type || null,
            postalAddress: {
                street: formData['postalAddress.street']
            }
        };

        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/${currentEditingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(organizationData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update organization');
        }

        const result = await response.json();
        showAlert('Organization updated successfully!', 'success');
        document.getElementById('editModal').querySelector('.btn-close').click();
        loadOrganizations();

    } catch (error) {
        showAlert(`Error updating organization: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

async function deleteOrganization(id) {
    if (!confirm('Are you sure you want to delete this organization?')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete organization');
        }

        showAlert('Organization deleted successfully!', 'success');
        loadOrganizations();

    } catch (error) {
        showAlert(`Error deleting organization: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
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
    const value = document.getElementById('filterValue').value;

    if (!field || !operator || !value) {
        showAlert('Please fill all filter fields', 'warning');
        return;
    }

    const filter = {
        field,
        operator,
        value: parseFilterValue(value, operator)
    };

    activeFilters.push(filter);
    updateActiveFiltersDisplay();
    document.getElementById('filterValue').value = '';
}

function parseFilterValue(value, operator) {
    if (operator === 'in') {
        return value.split(',').map(v => v.trim());
    }
    if (operator === 'between') {
        const values = value.split(',').map(v => v.trim());
        if (values.length === 2) {
            return values.map(v => isNaN(v) ? v : parseFloat(v));
        }
    }
    return isNaN(value) ? value : parseFloat(value);
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

async function groupByFullName() {
    try {
        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/group-by-fullname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayGroupByResults(data);

    } catch (error) {
        showAlert(`Error grouping organizations: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function displayGroupByResults(data) {
    const container = document.getElementById('orgdirectoryResults');

    let html = `
        <h6>Organizations Grouped by Full Name:</h6>
        <div class="table-responsive">
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.entries(data).forEach(([fullName, count]) => {
        html += `
            <tr>
                <td>${escapeHtml(fullName)}</td>
                <td><span class="badge bg-primary">${count}</span></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

function showCountByAddressModal() {
    const modal = new bootstrap.Modal(document.getElementById('countByAddressModal'));
    modal.show();
}

async function countByAddress() {
    const street = document.getElementById('countAddressStreet').value;

    if (!street) {
        showAlert('Please enter a street address', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/count-by-address`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ street })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const count = await response.json();

        const container = document.getElementById('orgdirectoryResults');
        container.innerHTML = `
            <div class="alert alert-info">
                <h6>Count Result:</h6>
                <p>There are <strong>${count}</strong> organizations with address lexicographically less than "${street}"</p>
            </div>
        `;

        document.getElementById('countByAddressModal').querySelector('.btn-close').click();

    } catch (error) {
        showAlert(`Error counting organizations: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function showDeleteByAddressModal() {
    const modal = new bootstrap.Modal(document.getElementById('deleteByAddressModal'));
    modal.show();
}

async function deleteByAddress() {
    const street = document.getElementById('deleteAddressStreet').value;

    if (!street) {
        showAlert('Please enter a street address', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to delete an organization with address "${street}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.ORGANIZATION_SERVICE}/organizations/by-address`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ street })
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No organization found with the specified address');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showAlert('Organization deleted successfully!', 'success');
        document.getElementById('deleteByAddressModal').querySelector('.btn-close').click();
        loadOrganizations();

    } catch (error) {
        showAlert(`Error deleting organization: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}