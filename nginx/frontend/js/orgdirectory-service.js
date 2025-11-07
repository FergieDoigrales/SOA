let orgDirectoryCurrentSorts = [];

function validateTurnoverInput(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    const messageElement = document.getElementById('turnoverValidationMessage');

    if (isNaN(value)) {
        input.classList.remove('is-valid', 'is-invalid');
        messageElement.textContent = '';
        return;
    }

    if (value < min || value > max) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        messageElement.textContent = `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`;
        messageElement.className = 'text-danger';
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        messageElement.textContent = '';
    }

    const minInput = document.getElementById('minTurnover');
    const maxInput = document.getElementById('maxTurnover');
    const minValue = parseInt(minInput.value);
    const maxValue = parseInt(maxInput.value);

    if (!isNaN(minValue) && !isNaN(maxValue) && minValue > maxValue) {
        messageElement.textContent = 'Min turnover cannot be greater than max turnover';
        messageElement.className = 'text-danger';
        minInput.classList.add('is-invalid');
        maxInput.classList.add('is-invalid');
    }
}

function formatTurnoverInput(input) {
    const value = parseInt(input.value);
    if (!isNaN(value) && value >= 0) {
        input.value = value;
    }
}

async function filterByTurnover() {
    const minInput = document.getElementById('minTurnover');
    const maxInput = document.getElementById('maxTurnover');
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);

    if (isNaN(min) || isNaN(max)) {
        showAlert('Please enter both min and max turnover values', 'warning');
        minInput.classList.add('is-invalid');
        maxInput.classList.add('is-invalid');
        return;
    }

    if (min < 0 || max < 0) {
        showAlert('Turnover values cannot be negative', 'warning');
        minInput.classList.add('is-invalid');
        maxInput.classList.add('is-invalid');
        return;
    }

    if (min > 2147483647 || max > 2147483647) {
        showAlert('Turnover values cannot exceed 2,147,483,647', 'warning');
        minInput.classList.add('is-invalid');
        maxInput.classList.add('is-invalid');
        return;
    }

    if (min > max) {
        showAlert('Min turnover cannot be greater than max turnover', 'warning');
        minInput.classList.add('is-invalid');
        maxInput.classList.add('is-invalid');
        return;
    }

    minInput.classList.remove('is-invalid');
    maxInput.classList.remove('is-invalid');

    try {
        showLoading('orgdirectoryResults');

        const requestBody = {
            minAnnualTurnover: min,
            maxAnnualTurnover: max,
            page: 0,
            size: 50
        };

        const response = await fetch(`${API_CONFIG.ORGDIRECTORY_SERVICE}/orgdirectory/filter/turnover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayTurnoverResults(data.organizations, min, max);

    } catch (error) {
        showAlert(`Error filtering by turnover: ${error.message}`, 'danger');
        console.error('Error:', error);
    }
}

function displayTurnoverResults(organizations, min, max) {
    const container = document.getElementById('orgdirectoryResults');

    if (!organizations || organizations.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                No organizations found with annual turnover between ${formatCurrency(min)} and ${formatCurrency(max)}
            </div>
        `;
        return;
    }

    let html = `
        <h6>Organizations with Annual Turnover between ${formatCurrency(min)} and ${formatCurrency(max)}:</h6>
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
                <td>${escapeHtml(org.name || 'N/A')}</td>
                <td>${escapeHtml(org.fullName || 'N/A')}</td>
                <td><span class="badge bg-secondary">${org.type || 'N/A'}</span></td>
                <td>${org.annualTurnover ? formatCurrency(org.annualTurnover) : 'N/A'}</td>
                <td>${escapeHtml(org.postalAddress?.street || 'N/A')}</td>
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


function displayGroupedResults(groups) {
    const container = document.getElementById('orgdirectoryResults');
    
    if (!groups || groups.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No grouped data found</div>';
        return;
    }

    let html = '<h6>Organizations Grouped by Full Name:</h6><div class="table-responsive"><table class="table table-sm table-hover"><thead><tr><th>Full Name</th><th>Count</th><th>Organizations</th></tr></thead><tbody>';
    
    groups.forEach(group => {
        html += `
            <tr>
                <td>${escapeHtml(group.fullName)}</td>
                <td><span class="badge bg-primary">${group.count}</span></td>
                <td>${group.organizations.map(org => org.name).join(', ')}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function showCountByAddressModal() {
    const modal = new bootstrap.Modal(document.getElementById('countByAddressModal'));
    modal.show();
}

function showDeleteByAddressModal() {
    const modal = new bootstrap.Modal(document.getElementById('deleteByAddressModal'));
    modal.show();
}



document.addEventListener('DOMContentLoaded', function() {
    const minTurnover = document.getElementById('minTurnover');
    const maxTurnover = document.getElementById('maxTurnover');
    
    if (minTurnover) minTurnover.value = '0';
    if (maxTurnover) maxTurnover.value = '1000000';
    
    const modals = [
        'countByAddressModal',
        'deleteByAddressModal'
    ];
    
    modals.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            new bootstrap.Modal(modalElement);
        }
    });
});