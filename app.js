// Initialize global variables
let currentDate = new Date(); // Tracks the current month for the calendar
let trades = []; // Array to store trades
let executionCounter = 0; // Counter for unique execution row IDs
let currentAccountFilter = ''; // Tracks the selected account filter

// Calendar Logic
function renderCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Update current month display
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    // Clear previous calendar days
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Get first day of the month and days in the month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'calendar-day--empty');
        calendarDays.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;

        // Highlight days with trades based on account filter
        const tradeDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const filteredTrades = currentAccountFilter ? trades.filter(trade => trade.account === currentAccountFilter) : trades;
        const hasTrades = filteredTrades.some(trade => trade.date.split('T')[0] === tradeDate);
        if (hasTrades) {
            dayElement.classList.add('calendar-day--active');
            dayElement.addEventListener('click', () => openDaySummaryModal(tradeDate));
        }

        calendarDays.appendChild(dayElement);
    }

    // Update monthly stats based on account filter
    updateMonthlyStats(year, month);
}

// Update monthly stats
function updateMonthlyStats(year, month) {
    const filteredTrades = currentAccountFilter ? trades.filter(trade => trade.account === currentAccountFilter) : trades;
    const monthlyTrades = filteredTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
    });

    const monthlyPnl = monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const tradingDays = new Set(monthlyTrades.map(trade => trade.date.split('T')[0])).size;

    document.getElementById('monthlyPnl').textContent = `$${monthlyPnl.toFixed(2)}`;
    document.getElementById('monthlyTradingDays').textContent = tradingDays;
}

// Calendar Navigation
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1); // Decrement by 1 month
    renderCalendar(currentDate);
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1); // Increment by 1 month
    renderCalendar(currentDate);
});

document.getElementById('thisMonth').addEventListener('click', () => {
    currentDate = new Date(); // Reset to current month
    renderCalendar(currentDate);
});

// View Switching
document.querySelectorAll('.nav__item').forEach(button => {
    button.addEventListener('click', () => {
        const viewId = button.getAttribute('data-view');
        document.querySelectorAll('.view').forEach(view => view.classList.remove('view--active'));
        document.querySelectorAll('.nav__item').forEach(btn => btn.classList.remove('nav__item--active'));
        document.getElementById(viewId).classList.add('view--active');
        button.classList.add('nav__item--active');

        if (viewId === 'dashboard') {
            renderCalendar(currentDate);
            populateAccountFilter();
        } else if (viewId === 'trades') {
            renderTradesTable();
        } else if (viewId === 'analytics') {
            renderAnalytics();
        }
    });
});

// Add Trade Modal
const addTradeModal = document.getElementById('addTradeModal');
const addTradeBtn = document.getElementById('addTradeBtn');
const cancelTradeBtn = document.getElementById('cancelTrade');
const tradeForm = document.getElementById('tradeForm');

addTradeBtn.addEventListener('click', () => {
    addTradeModal.classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Add New Trade';
    tradeForm.reset();
    document.getElementById('executionsTableBody').innerHTML = '';
    addExecutionRow();
    updateCalculatedFields();
});

cancelTradeBtn.addEventListener('click', () => {
    addTradeModal.classList.add('hidden');
});

// Execution Rows
document.getElementById('addExecutionBtn').addEventListener('click', addExecutionRow);

function addExecutionRow() {
    const executionsTableBody = document.getElementById('executionsTableBody');
    if (!executionsTableBody) {
        console.error('Executions table body not found');
        return;
    }

    executionCounter++;
    const now = new Date(); // Current date and time (05:39 PM EDT, August 22, 2025)
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const row = document.createElement('tr');
    row.dataset.executionId = executionCounter;

    row.innerHTML = `
        <td><input type="date" class="form-control execution-date" required value="${defaultDate}"></td>
        <td><input type="time" class="form-control execution-time" required value="${defaultTime}"></td>
        <td><input type="number" class="form-control" placeholder="Qty" required></td>
        <td>
            <select class="form-control" required>
                <option value="">Select</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>
        </td>
        <td><input type="number" step="0.01" class="form-control" placeholder="Price" required></td>
        <td><input type="number" step="0.01" class="form-control" placeholder="Comm" value="0"></td>
        <td><input type="number" step="0.01" class="form-control" placeholder="Fee" value="0"></td>
        <td><button type="button" class="btn btn--outline btn--sm remove-execution" onclick="removeExecutionRow(${executionCounter})">Remove</button></td>
    `;

    executionsTableBody.appendChild(row);

    // Add event listeners for input changes
    const inputs = row.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateCalculatedFields);
        input.addEventListener('change', updateCalculatedFields);
    });
}

function removeExecutionRow(id) {
    const row = document.querySelector(`tr[data-execution-id="${id}"]`);
    if (row) {
        row.remove();
        updateCalculatedFields();
    }
}

function updateCalculatedFields() {
    const executions = Array.from(document.querySelectorAll('#executionsTableBody tr'));
    let totalPnl = 0;
    let netQty = 0;
    let totalValue = 0;

    executions.forEach(row => {
        const date = row.querySelector('.execution-date').value;
        const time = row.querySelector('.execution-time').value;
        const qty = parseFloat(row.querySelectorAll('input[type="number"]')[0].value) || 0;
        const side = row.querySelector('select').value;
        const price = parseFloat(row.querySelectorAll('input[type="number"]')[1].value) || 0;
        const comm = parseFloat(row.querySelectorAll('input[type="number"]')[2].value) || 0;
        const fee = parseFloat(row.querySelectorAll('input[type="number"]')[3].value) || 0;

        const signedQty = side === 'buy' ? qty : -qty;
        netQty += signedQty;
        totalValue += signedQty * price;
        totalPnl -= (comm + fee);
        if (side === 'sell') {
            totalPnl += qty * price;
        } else {
            totalPnl -= qty * price;
        }
    });

    const avgPrice = netQty !== 0 ? Math.abs(totalValue / netQty) : 0;
    document.getElementById('calculatedPnl').textContent = `$${totalPnl.toFixed(2)}`;
    document.getElementById('calculatedQty').textContent = netQty;
    document.getElementById('calculatedAvgPrice').textContent = `$${avgPrice.toFixed(2)}`;
}

// Save Trade
tradeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const trade = {
        id: Date.now(),
        symbol: document.getElementById('tradeSymbol').value,
        account: document.getElementById('tradeAccount').value,
        date: Array.from(document.querySelectorAll('#executionsTableBody tr')).map(row => {
            const date = row.querySelector('.execution-date').value;
            const time = row.querySelector('.execution-time').value;
            return `${date}T${time}:00`; // Combine date and time into ISO format
        })[0], // Use the first execution's date for the trade
        executions: Array.from(document.querySelectorAll('#executionsTableBody tr')).map(row => {
            const date = row.querySelector('.execution-date').value;
            const time = row.querySelector('.execution-time').value;
            return {
                dateTime: `${date}T${time}:00`,
                qty: parseFloat(row.querySelectorAll('input[type="number"]')[0].value),
                side: row.querySelector('select').value,
                price: parseFloat(row.querySelectorAll('input[type="number"]')[1].value),
                comm: parseFloat(row.querySelectorAll('input[type="number"]')[2].value),
                fee: parseFloat(row.querySelectorAll('input[type="number"]')[3].value),
            };
        }),
        notes: document.getElementById('tradeNotes').value,
        pnl: parseFloat(document.getElementById('calculatedPnl').textContent.replace('$', '')),
    };

    trades.push(trade);
    addTradeModal.classList.add('hidden');
    renderCalendar(currentDate);
    populateAccountFilter();
    renderTradesTable();
});

// Populate Account Filter
function populateAccountFilter() {
    const accountFilter = document.getElementById('accountFilter');
    const uniqueAccounts = ['All Accounts', ...new Set(trades.map(trade => trade.account))];
    accountFilter.innerHTML = '<option value="">All Accounts</option>';
    uniqueAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account || 'Unnamed Account';
        accountFilter.appendChild(option);
    });
    accountFilter.value = currentAccountFilter;
}

// Filter by Account
function filterByAccount() {
    currentAccountFilter = document.getElementById('accountFilter').value;
    renderCalendar(currentDate);
    renderTradesTable();
}

// Render Trades Table
function renderTradesTable() {
    const table = document.getElementById('tradesTable');
    const filteredTrades = currentAccountFilter ? trades.filter(trade => trade.account === currentAccountFilter) : trades;
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Account</th>
                    <th>P&L</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${filteredTrades.map(trade => `
                    <tr>
                        <td>${new Date(trade.date).toLocaleDateString()}</td>
                        <td>${trade.symbol}</td>
                        <td>${trade.account}</td>
                        <td class="${trade.pnl >= 0 ? 'text-success' : 'text-error'}">$${trade.pnl.toFixed(2)}</td>
                        <td>${trade.notes || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('recentTradesTable').innerHTML = table.innerHTML; // Update recent trades
}

// Day Summary Modal
function openDaySummaryModal(date) {
    const modal = document.getElementById('daySummaryModal');
    const summary = document.getElementById('dayTradesSummary');
    document.getElementById('daySummaryTitle').textContent = `Day Summary - ${date}`;

    const filteredTrades = currentAccountFilter ? trades.filter(trade => trade.account === currentAccountFilter) : trades;
    const dayTrades = filteredTrades.filter(trade => trade.date.split('T')[0] === date);
    summary.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>P&L</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${dayTrades.map(trade => `
                    <tr>
                        <td>${trade.symbol}</td>
                        <td>$${trade.pnl.toFixed(2)}</td>
                        <td>${trade.notes || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    modal.classList.remove('hidden');
}

function closeDaySummaryModal() {
    document.getElementById('daySummaryModal').classList.add('hidden');
}

function editNote() {
    document.getElementById('dayNote').style.display = 'block';
}

function saveDayNote() {
    // Save note logic (e.g., store in trades or separate notes array)
    closeDaySummaryModal();
}

// Analytics Charts
function renderAnalytics() {
    const filteredTrades = currentAccountFilter ? trades.filter(trade => trade.account === currentAccountFilter) : trades;
    const winLossChart = new Chart(document.getElementById('winLossChart'), {
        type: 'pie',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [
                    filteredTrades.filter(t => t.pnl > 0).length,
                    filteredTrades.filter(t => t.pnl <= 0).length
                ],
                backgroundColor: ['#34C759', '#FF3B30']
            }]
        }
    });

    const accounts = currentAccountFilter ? [currentAccountFilter] : [...new Set(trades.map(t => t.account))];
    const accountChart = new Chart(document.getElementById('accountChart'), {
        type: 'bar',
        data: {
            labels: accounts,
            datasets: [{
                label: 'P&L by Account',
                data: accounts.map(acc => filteredTrades.filter(t => t.account === acc).reduce((sum, t) => sum + t.pnl, 0)),
                backgroundColor: '#007AFF'
            }]
        }
    });
}

// Initialize
renderCalendar(currentDate);
populateAccountFilter();
renderTradesTable();