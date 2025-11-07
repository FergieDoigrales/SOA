async function createOrganization() {
    try {
        const formData = getFormData('createForm');

        const preValidationError = validateFormDataBeforeSubmit(formData);
        if (preValidationError) {
            throw new Error(preValidationError);
        }

        const organizationData = {
            name: formData.name,
            coordinates: {
                x: parseCoordinateX(formData['coordinates.x']),
                y: parseCoordinateY(formData['coordinates.y'])
            },
            annualTurnover: formData.annualTurnover ? parseInteger(formData.annualTurnover) : null,
            fullName: formData.fullName,
            type: formData.type || null,
            postalAddress: {
                street: formData['postalAddress.street']
            }
        };

        const validationError = validateOrganizationData(organizationData);
        if (validationError) {
            throw new Error(validationError);
        }

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
                x: parseCoordinateX(formData['coordinates.x']),
                y: parseCoordinateY(formData['coordinates.y'])
            },
            annualTurnover: formData.annualTurnover ? parseInteger(formData.annualTurnover) : null,
            fullName: formData.fullName,
            type: formData.type || null,
            postalAddress: {
                street: formData['postalAddress.street']
            }
        };

        const validationError = validateOrganizationData(organizationData);
        if (validationError) {
            throw new Error(validationError);
        }

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

function validateFormDataBeforeSubmit(formData) {
    if (!formData.name || formData.name.trim().length === 0) {
        return 'Name is required';
    }
    if (!formData.fullName || formData.fullName.trim().length === 0) {
        return 'Full name is required';
    }
    if (!formData['coordinates.x'] || formData['coordinates.x'].trim().length === 0) {
        return 'Coordinate X is required';
    }
    if (!formData['coordinates.y'] || formData['coordinates.y'].trim().length === 0) {
        return 'Coordinate Y is required';
    }
    if (!formData['postalAddress.street'] || formData['postalAddress.street'].trim().length === 0) {
        return 'Street address is required';
    }

    if (formData.name.length > FIELD_CONSTRAINTS.name.maxLength) {
        return `Name must not exceed ${FIELD_CONSTRAINTS.name.maxLength} characters`;
    }
    if (formData.fullName.length > FIELD_CONSTRAINTS.fullName.maxLength) {
        return `Full name must not exceed ${FIELD_CONSTRAINTS.fullName.maxLength} characters`;
    }
    if (formData['postalAddress.street'].length > FIELD_CONSTRAINTS.street.maxLength) {
        return `Street address must not exceed ${FIELD_CONSTRAINTS.street.maxLength} characters`;
    }

    if (formData.annualTurnover && !/^\d+$/.test(formData.annualTurnover)) {
        return 'Annual turnover must contain only digits';
    }

    return null;
}


function parseInteger(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error('Value must be a valid integer');
    }

    if (parsed < FIELD_CONSTRAINTS.annualTurnover.min || parsed > FIELD_CONSTRAINTS.annualTurnover.max) {
        throw new Error(`Annual turnover must be between ${FIELD_CONSTRAINTS.annualTurnover.min} and ${FIELD_CONSTRAINTS.annualTurnover.max}`);
    }

    return parsed;
}

function parseCoordinateX(value) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        throw new Error('Coordinate X must be a valid number');
    }

    if (parsed < FIELD_CONSTRAINTS.coordinatesX.min || parsed > FIELD_CONSTRAINTS.coordinatesX.max) {
        throw new Error(`Coordinate X must be between ${FIELD_CONSTRAINTS.coordinatesX.min} and ${FIELD_CONSTRAINTS.coordinatesX.max}`);
    }

    return parsed;
}

function parseCoordinateY(value) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        throw new Error('Coordinate Y must be a valid number');
    }

    if (parsed < FIELD_CONSTRAINTS.coordinatesY.min || parsed > FIELD_CONSTRAINTS.coordinatesY.max) {
        throw new Error(`Coordinate Y must be between ${FIELD_CONSTRAINTS.coordinatesY.min} and ${FIELD_CONSTRAINTS.coordinatesY.max}`);
    }

    return parseFloat(parsed.toPrecision(7));
}

function validateOrganizationData(data) {
    if (data.name.length > FIELD_CONSTRAINTS.name.maxLength) {
        return `Name must not exceed ${FIELD_CONSTRAINTS.name.maxLength} characters`;
    }
    if (data.fullName.length > FIELD_CONSTRAINTS.fullName.maxLength) {
        return `Full name must not exceed ${FIELD_CONSTRAINTS.fullName.maxLength} characters`;
    }
    if (data.postalAddress.street.length > FIELD_CONSTRAINTS.street.maxLength) {
        return `Street address must not exceed ${FIELD_CONSTRAINTS.street.maxLength} characters`;
    }

    if (data.annualTurnover !== null) {
        if (!Number.isInteger(data.annualTurnover)) {
            return 'Annual turnover must be an integer value';
        }
    }

    return null;
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
        displaySimpleGroupByResults(data);

    } catch (error) {
        showAlert(`Error grouping organizations: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function displaySimpleGroupByResults(data) {
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



async function countByAddress() {
    const street = document.getElementById('countAddressStreet').value;
    const errorContainer = document.getElementById('countByAddressError');

    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.remove('alert', 'alert-danger');
    }

    if (!street) {
        showModalError('countByAddressError', 'Please enter a street address');
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
        showModalError('countByAddressError', `Error counting organizations: ${error.message}`);
        console.error('Error:', error);
    }
}

function showCountByAddressModal() {
    const errorContainer = document.getElementById('countByAddressError');
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.remove('alert', 'alert-danger');
    }

    document.getElementById('countAddressStreet').value = '';

    const modal = new bootstrap.Modal(document.getElementById('countByAddressModal'));
    modal.show();
}

function showDeleteByAddressModal() {
    const errorContainer = document.getElementById('deleteByAddressError');
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.remove('alert', 'alert-danger');
    }

    document.getElementById('deleteAddressStreet').value = '';

    const modal = new bootstrap.Modal(document.getElementById('deleteByAddressModal'));
    modal.show();
}

async function deleteByAddress() {
    const street = document.getElementById('deleteAddressStreet').value;
    const errorContainer = document.getElementById('deleteByAddressError');

    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.remove('alert', 'alert-danger');
    }

    if (!street) {
        showModalError('deleteByAddressError', 'Please enter a street address');
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
            if (response.status === 500) {
                throw new Error('No organization found with the specified address');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showAlert('Organization deleted successfully!', 'success');
        document.getElementById('deleteByAddressModal').querySelector('.btn-close').click();
        loadOrganizations();

    } catch (error) {
        showModalError('deleteByAddressError', `Error deleting organization: ${error.message}`);
        console.error('Error:', error);
    }
}

function showModalError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show mb-0 mt-2">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        container.classList.add('alert', 'alert-danger');
    } else {
        showAlert(message, 'danger');
    }
}