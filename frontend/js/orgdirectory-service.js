async function filterByTurnover() {
    const min = parseInt(document.getElementById('minTurnover').value);
    const max = parseInt(document.getElementById('maxTurnover').value);

    if (isNaN(min) || isNaN(max)) {
        showAlert('Please enter valid min and max turnover values', 'warning');
        return;
    }

    if (min > max) {
        showAlert('Min turnover cannot be greater than max turnover', 'warning');
        return;
    }

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

    if (organizations.length === 0) {
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