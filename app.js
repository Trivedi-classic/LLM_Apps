// Add these at the beginning of app.js
document.addEventListener('DOMContentLoaded', function() {
  loadTrades();
  updateAllViews();
});

// Make sure these functions are defined
function addTrade() {
  const tradeForm = document.getElementById('tradeForm');
  tradeForm.style.display = 'block';
}

function importTrades() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.onchange = function(e) {
      const file = e.target.files[0];
      // Handle CSV import
  };
  fileInput.click();
}

function exportTrades() {
  const csvContent = convertTradesToCSV(trades);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trades.csv';
  a.click();
}

// Make functions available globally
window.addTrade = addTrade;
window.importTrades = importTrades;
window.exportTrades = exportTrades;
window.clearAllData = clearAllData;

// ...existing code...

// Application State
let trades = [];
let currentEditingTrade = null;
let currentDate = new Date(2025, 7, 20); // August 2025
let executionCounter = 0;

// Chart instances
let winLossChart = null;
let accountChart = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  setTimeout(initializeApp, 100);
});

document.addEventListener('DOMContentLoaded', function() {
  // Ensure buttons are initialized
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.hasAttribute('disabled')) {
      button.style.cursor = 'pointer'; // Ensure buttons look clickable
    }
  });

  // Reattach event listeners if necessary
  setupEventListeners();
  console.log('Buttons are now clickable and event listeners are attached.');
});

function initializeApp() {
  try {
    console.log('Starting app initialization...');
    loadTrades();
    setupEventListeners();
    updateAllViews();
    updateCalendar();
    console.log('App initialized successfully with', trades.length, 'trades');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function loadTrades() {
  try {
    const storedTrades = localStorage.getItem('tradejournalTrades');
    if (storedTrades) {
      trades = JSON.parse(storedTrades);
      console.log('Loaded trades from storage:', trades.length);
    } else {
      trades = [...sampleTrades];
      saveTrades();
      console.log('Loaded sample trades:', trades.length);
    }
  } catch (error) {
    console.error('Error loading trades:', error);
    trades = [...sampleTrades];
  }
}

function saveTrades() {
  try {
    localStorage.setItem('tradejournalTrades', JSON.stringify(trades));
    console.log('Trades saved to storage');
  } catch (error) {
    console.error('Error saving trades:', error);
  }
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  try {
    // Navigation buttons - more explicit approach
    const dashboardBtn = document.querySelector('[data-view="dashboard"]');
    const tradesBtn = document.querySelector('[data-view="trades"]');
    const analyticsBtn = document.querySelector('[data-view="analytics"]');
    const settingsBtn = document.querySelector('[data-view="settings"]');

    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Dashboard nav clicked');
        switchView('dashboard');
      });
      console.log('Dashboard nav listener attached');
    }

    if (tradesBtn) {
      tradesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Trades nav clicked');
        switchView('trades');
      });
      console.log('Trades nav listener attached');
    }

    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Analytics nav clicked');
        switchView('analytics');
      });
      console.log('Analytics nav listener attached');
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Settings nav clicked');
        switchView('settings');
      });
      console.log('Settings nav listener attached');
    }

    // Add Trade Button
    const addTradeBtn = document.getElementById('addTradeBtn');
    if (addTradeBtn) {
      addTradeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add trade button clicked');
        openAddTradeModal();
      });
      console.log('Add trade button listener attached');
    } else {
      console.error('Add trade button not found');
    }

    // Modal close events
    const modalClose = document.querySelector('.modal__close');
    if (modalClose) {
      modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
      });
      console.log('Modal close listener attached');
    }

    const modalOverlay = document.querySelector('.modal__overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
      });
      console.log('Modal overlay listener attached');
    }

    const cancelBtn = document.getElementById('cancelTrade');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
      });
      console.log('Cancel button listener attached');
    }

    // Trade form
    const tradeForm = document.getElementById('tradeForm');
    if (tradeForm) {
      tradeForm.addEventListener('submit', handleTradeSubmit);
      console.log('Trade form listener attached');
    }

    // Add execution button
    const addExecutionBtn = document.getElementById('addExecutionBtn');
    if (addExecutionBtn) {
      addExecutionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add execution clicked');
        addExecutionRow();
      });
      console.log('Add execution button listener attached');
    }

    // Calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Previous month clicked');
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
      });
      console.log('Previous month listener attached');
    }

    const nextMonthBtn = document.getElementById('nextMonth');
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Next month clicked');
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
      });
      console.log('Next month listener attached');
    }

    const thisMonthBtn = document.getElementById('thisMonth');
    if (thisMonthBtn) {
      thisMonthBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('This month clicked');
        currentDate = new Date(2025, 7, 20); // August 2025
        updateCalendar();
      });
      console.log('This month listener attached');
    }

    // View All Trades button
    const viewAllBtn = document.getElementById('viewAllTradesBtn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('View all trades clicked');
        switchView('trades');
      });
      console.log('View all trades listener attached');
    }

    // Filters
    const symbolFilter = document.getElementById('symbolFilter');
    if (symbolFilter) {
      symbolFilter.addEventListener('input', applyFilters);
    }

    const accountFilter = document.getElementById('accountFilter');
    if (accountFilter) {
      accountFilter.addEventListener('input', applyFilters);
    }

    const resultFilter = document.getElementById('resultFilter');
    if (resultFilter) {
      resultFilter.addEventListener('change', applyFilters);
    }

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Export/Import
    const exportBtn = document.getElementById('exportTrades');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportTrades);
    }

    const exportAllBtn = document.getElementById('exportAllData');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', exportTrades);
    }

    const importBtn = document.getElementById('importDataBtn');
    if (importBtn) {
      importBtn.addEventListener('click', function() {
        const importInput = document.getElementById('importData');
        if (importInput) {
          importInput.click();
        }
      });
    }

    const importInput = document.getElementById('importData');
    if (importInput) {
      importInput.addEventListener('change', importTrades);
    }

    const clearDataBtn = document.getElementById('clearAllData');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', clearAllData);
    }

    console.log('All event listeners setup complete');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

function switchView(viewName) {
  console.log('Switching to view:', viewName);
  
  try {
    // Update navigation
    document.querySelectorAll('.nav__item').forEach(item => {
      item.classList.remove('nav__item--active');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('nav__item--active');
      }
    });

    // Switch views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('view--active');
    });
    
    const targetView = document.getElementById(viewName);
    if (targetView) {
      targetView.classList.add('view--active');
      console.log('Successfully switched to:', viewName);
    } else {
      console.error('Target view not found:', viewName);
    }

    // Update specific view content
    switch(viewName) {
      case 'dashboard':
        updateDashboard();
        updateCalendar();
        break;
      case 'trades':
        updateTradesView();
        break;
      case 'analytics':
        updateAnalyticsView();
        break;
    }
  } catch (error) {
    console.error('Error switching view:', error);
  }
}

function updateAllViews() {
  console.log('Updating all views...');
  try {
    updateDashboard();
    updateTradesView();
    updateAnalyticsView();
  } catch (error) {
    console.error('Error updating views:', error);
  }
}

function updateDashboard() {
  console.log('Updating dashboard...');
  try {
    const metrics = calculateMetrics();
    
    updateElementText('totalPnl', formatCurrency(metrics.totalPnL), metrics.totalPnL >= 0 ? 'metric-card__value positive' : 'metric-card__value negative');
    updateElementText('winRate', `${metrics.winRate}%`);
    updateElementText('totalTrades', metrics.totalTrades.toString());
    updateElementText('profitFactor', metrics.profitFactor.toFixed(2));
    updateElementText('avgWin', formatCurrency(metrics.avgWin));
    updateElementText('avgLoss', formatCurrency(metrics.avgLoss));

    updateRecentTrades();
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

function updateElementText(id, text, className = null) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
    if (className) {
      element.className = className;
    }
  }
}

function updateRecentTrades() {
  const recentTrades = trades.slice(-5).reverse();
  const tableContainer = document.getElementById('recentTradesTable');
  
  if (!tableContainer) return;
  
  if (recentTrades.length === 0) {
    tableContainer.innerHTML = '<div class="empty-state"><h3>No trades yet</h3><p>Add your first trade to get started</p></div>';
    return;
  }
  
  const table = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Symbol</th>
          <th>Account</th>
          <th>P&L</th>
          <th>Executions</th>
        </tr>
      </thead>
      <tbody>
        ${recentTrades.map(trade => {
          const firstExecution = trade.executions[0];
          const date = firstExecution ? new Date(firstExecution.dateTime.split(' ')[0]).toLocaleDateString() : 'N/A';
          return `
            <tr>
              <td>${date}</td>
              <td>${trade.symbol}</td>
              <td>${trade.account}</td>
              <td class="${trade.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatCurrency(trade.totalPnl)}</td>
              <td>${trade.executions.length}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  tableContainer.innerHTML = table;
}

function updateTradesView() {
  const filteredTrades = getFilteredTrades();
  const tableContainer = document.getElementById('tradesTable');
  
  if (!tableContainer) return;
  
  if (filteredTrades.length === 0) {
    tableContainer.innerHTML = '<div class="empty-state"><h3>No trades found</h3><p>Try adjusting your filters or add some trades</p></div>';
    return;
  }
  
  const table = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Symbol</th>
          <th>Account</th>
          <th>Executions</th>
          <th>Net Qty</th>
          <th>Avg Price</th>
          <th>P&L</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredTrades
          .map(
            (trade) => `
            <tr>
              <td>${new Date(trade.executions[0]?.dateTime || 0).toLocaleDateString()}</td>
              <td>${trade.symbol}</td>
              <td>${trade.account}</td>
              <td>${trade.executions.length}</td>
              <td>${trade.netQuantity}</td>
              <td>${formatCurrency(trade.avgPrice)}</td>
              <td class="${trade.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatCurrency(trade.totalPnl)}</td>
              <td class="trade-actions">
                <button class="btn btn--outline btn--sm edit-trade-btn" data-trade-id="${trade.id}">Edit</button>
                <button class="btn btn--outline btn--sm delete-trade-btn" data-trade-id="${trade.id}" style="color: var(--color-error); border-color: var(--color-error);">Delete</button>
                <button class="btn btn--outline btn--sm chart-trade-btn" data-ticker="${trade.symbol}" data-executions='${JSON.stringify(trade.executions)}'>Chart</button>
              </td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>
  `;
  
  tableContainer.innerHTML = table;
  
  // Attach event listeners for dynamically generated buttons
  document.querySelectorAll('.chart-trade-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const ticker = button.getAttribute('data-ticker');
      const executions = JSON.parse(button.getAttribute('data-executions'));
      console.log(`Chart button clicked for ticker: ${ticker}`);
      showTickerChart(ticker, executions);
    });
  });
}

function updateAnalyticsView() {
  const metrics = calculateAdvancedMetrics();
  
  updateElementText('avgRMultiple', (metrics.avgRMultiple || 0).toFixed(2) + 'R');
  updateElementText('bestTrade', formatCurrency(metrics.bestTrade));
  updateElementText('worstTrade', formatCurrency(metrics.worstTrade));
  updateElementText('consecutiveWins', metrics.consecutiveWins.toString());
  updateElementText('consecutiveLosses', metrics.consecutiveLosses.toString());
  
  setTimeout(() => {
    updateWinLossChart();
    updateAccountChart();
  }, 300);
}

function updateCalendar() {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentMonthElement = document.getElementById('currentMonth');
  if (currentMonthElement) {
    currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }
  
  const calendarDays = document.getElementById('calendarDays');
  if (!calendarDays) return;
  
  // Calculate calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const today = new Date(2025, 7, 20); // Current date context
  const calendarDaysHTML = [];
  
  // Group trades by date for this month
  const tradesByDate = {};
  trades.forEach(trade => {
    trade.executions.forEach(execution => {
      const execDate = execution.dateTime.split(' ')[0];
      const dateKey = new Date(execDate).toDateString();
      if (!tradesByDate[dateKey]) {
        tradesByDate[dateKey] = { trades: [], pnl: 0 };
      }
      tradesByDate[dateKey].trades.push(trade);
    });
  });
  
  // Calculate daily P&L
  Object.keys(tradesByDate).forEach(dateKey => {
    const dayTrades = tradesByDate[dateKey].trades;
    const uniqueTrades = [...new Set(dayTrades.map(t => t.id))];

    let dailyPnl = 0;
    let hasSellOrder = false;

    uniqueTrades.forEach(tradeId => {
      const trade = trades.find(t => t.id === tradeId);
      if (trade) {
        trade.executions.forEach(execution => {
          if (new Date(execution.dateTime.split(' ')[0]).toDateString() === dateKey) {
            if (execution.side === 'SELL') {
              hasSellOrder = true;
              dailyPnl += execution.quantity * (execution.price - trade.avgPrice);
            }
          }
        });
      }
    });

    tradesByDate[dateKey].pnl = hasSellOrder ? dailyPnl : 0; // P&L is $0 if no sell orders
    tradesByDate[dateKey].count = uniqueTrades.length;
  });

  // Generate calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateKey = date.toDateString();
    const dayData = tradesByDate[dateKey];
    const isToday = date.toDateString() === today.toDateString();
    const isOtherMonth = date.getMonth() !== month;
    
    let dayClass = 'calendar-day';
    if (isOtherMonth) dayClass += ' other-month';
    if (isToday) dayClass += ' today';
    if (dayData && dayData.pnl > 0) dayClass += ' profit';
    if (dayData && dayData.pnl < 0) dayClass += ' loss';
    
    let dayContent = `<div class="calendar-day-number">${date.getDate()}</div>`;
    if (dayData) {
      dayContent += `<div class="calendar-day-pnl ${dayData.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(dayData.pnl)}</div>`;
      dayContent += `<div class="calendar-day-trades">${dayData.count} trade${dayData.count !== 1 ? 's' : ''}</div>`;
    }
    
    calendarDaysHTML.push(`<div class="${dayClass}" onclick="showDaySummary('${dateKey}')">${dayContent}</div>`);
  }
  
  calendarDays.innerHTML = calendarDaysHTML.join('');
  
  // Update monthly stats
  const monthlyData = calculateMonthlyStats(year, month);
  updateElementText('monthlyPnl', formatCurrency(monthlyData.pnl));
  updateElementText('monthlyTradingDays', monthlyData.tradingDays.toString());
  
  // Update weekly summary
  updateWeeklySummary(year, month);
}

function calculateMonthlyStats(year, month) {
  let monthlyPnl = 0;
  const tradingDays = new Set();
  
  trades.forEach(trade => {
    trade.executions.forEach(execution => {
      const execDate = new Date(execution.dateTime.split(' ')[0]);
      if (execDate.getFullYear() === year && execDate.getMonth() === month) {
        tradingDays.add(execDate.toDateString());
      }
    });
    
    // Check if trade has any executions in this month
    const hasExecutionsInMonth = trade.executions.some(execution => {
      const execDate = new Date(execution.dateTime.split(' ')[0]);
      return execDate.getFullYear() === year && execDate.getMonth() === month;
    });
    
    if (hasExecutionsInMonth) {
      monthlyPnl += trade.totalPnl;
    }
  });
  
  return {
    pnl: monthlyPnl,
    tradingDays: tradingDays.size
  };
}

function updateWeeklySummary(year, month) {
  const weeklySummary = document.getElementById('weeklySummary');
  if (!weeklySummary) return;
  
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Generate weeks
  for (let week = 0; week < 6; week++) {
    const weekStart = new Date(firstDay);
    weekStart.setDate(1 + (week * 7) - firstDay.getDay());
    
    if (weekStart.getMonth() === month || week === 0) {
      const weekStats = calculateWeekStats(weekStart, year, month);
      if (weekStats.tradingDays > 0) {
        weeks.push({
          title: `Week ${week + 1}`,
          stats: weekStats
        });
      }
    }
  }
  
  const summaryHTML = weeks.map(week => `
    <div class="week-summary">
      <div class="week-title">${week.title}</div>
      <div class="week-stats">
        <div class="week-stat">
          <span class="week-stat-label">P&L:</span>
          <span class="week-stat-value ${week.stats.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(week.stats.pnl)}</span>
        </div>
        <div class="week-stat">
          <span class="week-stat-label">Days:</span>
          <span class="week-stat-value">${week.stats.tradingDays}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  weeklySummary.innerHTML = summaryHTML;
}

function calculateWeekStats(weekStart, year, month) {
  let weekPnl = 0;
  const tradingDays = new Set();
  const processedTrades = new Set();
  let hasSellOrder = false;

  for (let day = 0; day < 7; day++) {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + day);

    if (currentDay.getMonth() === month) {
      trades.forEach(trade => {
        const hasExecutionsThisDay = trade.executions.some(execution => {
          const execDate = new Date(execution.dateTime.split(' ')[0]);
          return execDate.toDateString() === currentDay.toDateString();
        });

        if (hasExecutionsThisDay && !processedTrades.has(trade.id)) {
          tradingDays.add(currentDay.toDateString());
          trade.executions.forEach(execution => {
            if (new Date(execution.dateTime.split(' ')[0]).toDateString() === currentDay.toDateString()) {
              if (execution.side === 'SELL') {
                hasSellOrder = true;
                weekPnl += execution.quantity * (execution.price - trade.avgPrice);
              }
            }
          });
          processedTrades.add(trade.id);
        }
      });
    }
  }

  // Set weekly P&L to $0 if there are no sell orders
  weekPnl = hasSellOrder ? weekPnl : 0;

  return {
    pnl: weekPnl,
    tradingDays: tradingDays.size
  };
}

function openAddTradeModal() {
  console.log('Opening add trade modal...');
  
  try {
    currentEditingTrade = null;
    executionCounter = 0;
    
    const modal = document.getElementById('addTradeModal');
    const modalTitle = document.getElementById('modalTitle');
    const tradeForm = document.getElementById('tradeForm');
    
    if (modalTitle) {
      modalTitle.textContent = 'Add New Trade';
    }
    
    if (tradeForm) {
      tradeForm.reset();
    }
    
    // Clear executions table
    const executionsTableBody = document.getElementById('executionsTableBody');
    if (executionsTableBody) {
      executionsTableBody.innerHTML = '';
    }
    
    // Add initial execution row
    addExecutionRow();
    
    if (modal) {
      modal.classList.remove('hidden');
      console.log('Modal opened successfully');
    } else {
      console.error('Modal not found');
    }
    
    calculateTradeMetrics();
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}

function addExecutionRow() {
  const executionsTableBody = document.getElementById('executionsTableBody');
  if (!executionsTableBody) {
    console.error('Executions table body not found');
    return;
  }
  
  executionCounter++;
  const now = new Date(2025, 7, 20, 9, 30, 0); // Default to current context time
  const defaultDateTime = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
  
  const row = document.createElement('tr');
  row.dataset.executionId = executionCounter;
  
  row.innerHTML = `
    <td><input type="text" class="execution-input" placeholder="MM/DD/YYYY HH:MM:SS" value="${defaultDateTime}"></td>
    <td><input type="number" class="execution-input" placeholder="0" min="0"></td>
    <td>
      <select class="execution-select">
        <option value="">Select</option>
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
      </select>
    </td>
    <td><input type="number" class="execution-input" placeholder="0.00" step="0.01" min="0"></td>
    <td><input type="number" class="execution-input" placeholder="0.00" step="0.01" min="0"></td>
    <td><input type="number" class="execution-input" placeholder="0.00" step="0.01" min="0"></td>
    <td><button type="button" class="execution-delete" onclick="removeExecutionRow(${executionCounter})" title="Delete execution">🗑️</button></td>
  `;
  
  executionsTableBody.appendChild(row);
  
  // Add event listeners for real-time calculation
  const inputs = row.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', calculateTradeMetrics);
    input.addEventListener('change', calculateTradeMetrics);
  });
  
  console.log('Added execution row:', executionCounter);
}

function removeExecutionRow(executionId) {
  const row = document.querySelector(`[data-execution-id="${executionId}"]`);
  if (row) {
    row.remove();
    calculateTradeMetrics();
    console.log('Removed execution row:', executionId);
  }
}

function calculateTradeMetrics() {
  const executionsTableBody = document.getElementById('executionsTableBody');
  if (!executionsTableBody) return;
  
  const rows = executionsTableBody.querySelectorAll('tr');
  let totalPnl = 0;
  let netQuantity = 0;
  let totalValue = 0;
  let totalCommissions = 0;
  let totalFees = 0;
  let totalShares = 0;
  
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input, select');
    const quantity = parseFloat(inputs[1].value) || 0;
    const side = inputs[2].value;
    const price = parseFloat(inputs[3].value) || 0;
    const commission = parseFloat(inputs[4].value) || 0;
    const fee = parseFloat(inputs[5].value) || 0;
    
    if (quantity && side && price) {
      if (side === 'BUY') {
        netQuantity += quantity;
        totalValue += quantity * price;
        totalShares += quantity;
      } else if (side === 'SELL') {
        netQuantity -= quantity;
        totalValue -= quantity * price;
        totalShares += quantity;
      }
      
      totalCommissions += commission;
      totalFees += fee;
    }
  });
  
  totalPnl = -totalValue - totalCommissions - totalFees;
  const avgPrice = totalShares > 0 ? Math.abs(totalValue) / totalShares : 0;
  
  // Update calculated fields
  const calculatedPnl = document.getElementById('calculatedPnl');
  if (calculatedPnl) {
    calculatedPnl.textContent = formatCurrency(totalPnl);
    calculatedPnl.className = `calc-value ${totalPnl >= 0 ? 'positive' : 'negative'}`;
  }
  
  const calculatedQty = document.getElementById('calculatedQty');
  if (calculatedQty) {
    calculatedQty.textContent = netQuantity.toString();
  }
  
  const calculatedAvgPrice = document.getElementById('calculatedAvgPrice');
  if (calculatedAvgPrice) {
    calculatedAvgPrice.textContent = formatCurrency(avgPrice);
  }
}

function editTrade(tradeId) {
  const trade = trades.find(t => t.id === tradeId);
  if (!trade) return;
  
  currentEditingTrade = trade;
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'Edit Trade';
  }
  
  // Fill form fields
  const symbolInput = document.getElementById('tradeSymbol');
  if (symbolInput) symbolInput.value = trade.symbol;
  
  const accountInput = document.getElementById('tradeAccount');
  if (accountInput) accountInput.value = trade.account;
  
  const notesInput = document.getElementById('tradeNotes');
  if (notesInput) notesInput.value = trade.notes || '';
  
  // Clear and populate executions
  const executionsTableBody = document.getElementById('executionsTableBody');
  if (executionsTableBody) {
    executionsTableBody.innerHTML = '';
    executionCounter = 0;
    
    trade.executions.forEach(execution => {
      addExecutionRow();
      const row = executionsTableBody.lastElementChild;
      const inputs = row.querySelectorAll('input, select');
      inputs[0].value = execution.dateTime;
      inputs[1].value = execution.quantity;
      inputs[2].value = execution.side;
      inputs[3].value = execution.price;
      inputs[4].value = execution.commission;
      inputs[5].value = execution.fee;
    });
  }
  
  const modal = document.getElementById('addTradeModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
  
  calculateTradeMetrics();
}

function deleteTrade(tradeId) {
  if (confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
    trades = trades.filter(t => t.id !== tradeId);
    saveTrades();
    updateAllViews();
    updateCalendar();
  }
}

function closeModal() {
  const modal = document.getElementById('addTradeModal');
  if (modal) {
    modal.classList.add('hidden');
    console.log('Modal closed');
  }
  currentEditingTrade = null;
}

function handleTradeSubmit(e) {
  e.preventDefault();
  
  try {
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const account = document.getElementById('tradeAccount').value;
    const notes = document.getElementById('tradeNotes').value;
    
    if (!symbol || !account) {
      alert('Please fill in Symbol and Account fields');
      return;
    }
    
    // Collect executions
    const executionsTableBody = document.getElementById('executionsTableBody');
    const rows = executionsTableBody.querySelectorAll('tr');
    const executions = [];
    
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input, select');
      const execution = {
        id: parseInt(row.dataset.executionId),
        dateTime: inputs[0].value,
        quantity: parseFloat(inputs[1].value) || 0,
        side: inputs[2].value,
        price: parseFloat(inputs[3].value) || 0,
        commission: parseFloat(inputs[4].value) || 0,
        fee: parseFloat(inputs[5].value) || 0
      };
      
      if (execution.quantity && execution.side && execution.price) {
        executions.push(execution);
      }
    });
    
    if (executions.length === 0) {
      alert('Please add at least one execution');
      return;
    }
    
    // Calculate trade metrics
    const metrics = calculateTradeMetricsFromExecutions(executions);
    
    const trade = {
      id: currentEditingTrade ? currentEditingTrade.id : Date.now(),
      symbol,
      account,
      executions,
      notes,
      totalPnl: metrics.totalPnl,
      netQuantity: metrics.netQuantity,
      avgPrice: metrics.avgPrice
    };
    
    if (currentEditingTrade) {
      const index = trades.findIndex(t => t.id === currentEditingTrade.id);
      if (index !== -1) {
        trades[index] = trade;
      }
    } else {
      trades.push(trade);
    }
    
    saveTrades();
    updateAllViews();
    updateCalendar();
    closeModal();
    
    // Switch back to dashboard if we were adding a new trade
    if (!currentEditingTrade) {
      switchView('dashboard');
    }
    
    console.log('Trade saved successfully');
  } catch (error) {
    console.error('Error saving trade:', error);
    alert('Error saving trade. Please check your input.');
  }
}

function calculateTradeMetricsFromExecutions(executions) {
  let totalPnl = 0;
  let netQuantity = 0;
  let avgPrice = 0;

  executions.forEach(execution => {
    const { quantity, side, price, commission = 0, fee = 0 } = execution;

    if (side === 'BUY') {
      // Update net quantity and average price for buys
      const totalCost = netQuantity * avgPrice + quantity * price;
      netQuantity += quantity;
      avgPrice = netQuantity > 0 ? totalCost / netQuantity : 0;
    } else if (side === 'SELL') {
      // Calculate P&L for sells
      const sellPnl = quantity * (price - avgPrice) - commission - fee;
      totalPnl += sellPnl;

      // Reduce net quantity after the sell
      netQuantity -= quantity;

      // If all shares are sold, reset avgPrice
      if (netQuantity === 0) {
        avgPrice = 0;
      }
    }
  });

  return {
    totalPnl,
    netQuantity,
    avgPrice
  };
}

function calculateMetrics() {
  if (trades.length === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      totalTrades: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0
    };
  }
  
  const totalPnL = trades.reduce((sum, trade) => sum + trade.totalPnl, 0);
  const winningTrades = trades.filter(trade => trade.totalPnl > 0);
  const losingTrades = trades.filter(trade => trade.totalPnl < 0);
  
  const winRate = ((winningTrades.length / trades.length) * 100).toFixed(1);
  const totalWins = winningTrades.reduce((sum, trade) => sum + trade.totalPnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.totalPnl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
  
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  
  return {
    totalPnL,
    winRate: parseFloat(winRate),
    totalTrades: trades.length,
    profitFactor,
    avgWin,
    avgLoss
  };
}

function calculateAdvancedMetrics() {
  if (trades.length === 0) {
    return {
      avgRMultiple: 0,
      bestTrade: 0,
      worstTrade: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0
    };
  }
  
  const bestTrade = Math.max(...trades.map(trade => trade.totalPnl));
  const worstTrade = Math.min(...trades.map(trade => trade.totalPnl));
  
  // Calculate consecutive wins/losses
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;
  
  trades.forEach(trade => {
    if (trade.totalPnl > 0) {
      currentWins++;
      currentLosses = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
    } else {
      currentLosses++;
      currentWins = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
    }
  });
  
  return {
    avgRMultiple: 0, // R-Multiple not applicable to execution-based trades
    bestTrade,
    worstTrade,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses
  };
}

function updateWinLossChart() {
  const canvas = document.getElementById('winLossChart');
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    
    if (winLossChart) {
      winLossChart.destroy();
      winLossChart = null;
    }
    
    const winningTrades = trades.filter(trade => trade.totalPnl > 0).length;
    const losingTrades = trades.filter(trade => trade.totalPnl <= 0).length;
    
    winLossChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [winningTrades, losingTrades],
          backgroundColor: ['#1FB8CD', '#B4413C'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error updating win/loss chart:', error);
  }
}

function updateAccountChart() {
  const canvas = document.getElementById('accountChart');
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    
    if (accountChart) {
      accountChart.destroy();
      accountChart = null;
    }
    
    // Group trades by account
    const accountData = {};
    trades.forEach(trade => {
      if (!accountData[trade.account]) {
        accountData[trade.account] = { count: 0, pnl: 0 };
      }
      accountData[trade.account].count++;
      accountData[trade.account].pnl += trade.totalPnl;
    });
    
    const labels = Object.keys(accountData);
    const data = Object.values(accountData).map(item => item.pnl);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
    
    accountChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'P&L by Account',
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error updating account chart:', error);
  }
}

function getFilteredTrades() {
  const symbolFilter = document.getElementById('symbolFilter')?.value.toLowerCase() || '';
  const accountFilter = document.getElementById('accountFilter')?.value.toLowerCase() || '';
  const resultFilter = document.getElementById('resultFilter')?.value || '';
  
  return trades.filter(trade => {
    const symbolMatch = !symbolFilter || trade.symbol.toLowerCase().includes(symbolFilter);
    const accountMatch = !accountFilter || trade.account.toLowerCase().includes(accountFilter);
    const resultMatch = !resultFilter || 
      (resultFilter === 'win' && trade.totalPnl > 0) ||
      (resultFilter === 'loss' && trade.totalPnl <= 0);
    
    return symbolMatch && accountMatch && resultMatch;
  }).sort((a, b) => {
    const aDate = new Date(a.executions[0]?.dateTime || 0);
    const bDate = new Date(b.executions[0]?.dateTime || 0);
    return bDate - aDate;
  });
}

function applyFilters() {
  updateTradesView();
}

function clearFilters() {
  const filters = ['symbolFilter', 'accountFilter', 'resultFilter'];
  filters.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = '';
    }
  });
  updateTradesView();
}

function exportTrades() {
  if (trades.length === 0) {
    alert('No trades to export');
    return;
  }
  
  try {
    const csv = tradesArrayToCSV(trades);
    downloadCSV(csv, 'trades.csv');
  } catch (error) {
    console.error('Error exporting trades:', error);
    alert('Error exporting trades');
  }
}

function tradesArrayToCSV(tradesArray) {
  const headers = ['Trade ID', 'Symbol', 'Account', 'Execution DateTime', 'Quantity', 'Side', 'Price', 'Commission', 'Fee', 'Notes', 'Total P&L'];
  
  const rows = [];
  tradesArray.forEach(trade => {
    trade.executions.forEach((execution, index) => {
      rows.push([
        trade.id,
        trade.symbol,
        trade.account,
        execution.dateTime,
        execution.quantity,
        execution.side,
        execution.price,
        execution.commission,
        execution.fee,
        index === 0 ? `"${(trade.notes || '').replace(/"/g, '""')}"` : '',
        index === 0 ? trade.totalPnl : ''
      ].join(','));
    });
  });
  
  return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function importTrades(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const importedTrades = parseCSV(csv);
      
      if (confirm(`Import ${importedTrades.length} trades? This will add to your existing trades.`)) {
        importedTrades.forEach(trade => {
          trade.id = Date.now() + Math.random();
          trades.push(trade);
        });
        
        saveTrades();
        updateAllViews();
        updateCalendar();
        alert(`Successfully imported ${importedTrades.length} trades`);
      }
    } catch (error) {
      alert('Error importing trades. Please check the file format.');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function parseCSV(csv) {
  // This is a simplified CSV parser - would need more robust implementation for production
  const lines = csv.split('\n');
  const trades = [];
  // Implementation would depend on the specific CSV format
  return trades;
}

function clearAllData() {
  if (confirm('Are you sure you want to delete ALL trades? This action cannot be undone.')) {
    if (confirm('This will permanently delete all your trading data. Are you absolutely sure?')) {
      trades = [];
      saveTrades();
      updateAllViews();
      updateCalendar();
      alert('All trades have been deleted.');
    }
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Make functions available globally for inline event handlers
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.removeExecutionRow = removeExecutionRow;
window.calculateTradeMetrics = calculateTradeMetrics;

// Add a global object to store notes for each day
const dayNotes = {};

// Function to show the day summary modal
function showDaySummary(dateKey) {
  const dayTrades = trades.filter(trade =>
    trade.executions.some(execution => new Date(execution.dateTime.split(' ')[0]).toDateString() === dateKey)
  );

  const dayTradesSummary = document.getElementById('dayTradesSummary');
  const daySummaryTitle = document.getElementById('daySummaryTitle');
  const dayNote = document.getElementById('dayNote');

  daySummaryTitle.textContent = `Summary for ${dateKey}`;
  dayTradesSummary.innerHTML = dayTrades.length
    ? `
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          ${dayTrades
            .map(trade =>
              trade.executions
                .filter(execution => new Date(execution.dateTime.split(' ')[0]).toDateString() === dateKey)
                .map(
                  execution => `
                  <tr>
                    <td>${trade.symbol}</td>
                    <td>${execution.side}</td>
                    <td>${execution.quantity}</td>
                    <td>${formatCurrency(execution.price)}</td>
                    <td>${execution.side === 'BUY' ? '$0.00' : formatCurrency(execution.quantity * (execution.price - trade.avgPrice))}</td>
                  </tr>
                `
                )
                .join('')
            )
            .join('')}
        </tbody>
      </table>
    `
    : '<p>No trades for this day.</p>';

  dayNote.value = dayNotes[dateKey] || '';
  document.getElementById('daySummaryModal').classList.remove('hidden');
}

// Function to close the day summary modal
function closeDaySummaryModal() {
  document.getElementById('daySummaryModal').classList.add('hidden');
}

// Function to save the note for the day
function saveDayNote() {
  const daySummaryTitle = document.getElementById('daySummaryTitle').textContent;
  const dateKey = daySummaryTitle.replace('Summary for ', '');
  const dayNote = document.getElementById('dayNote').value;

  dayNotes[dateKey] = dayNote;
  alert('Note saved successfully!');
  closeDaySummaryModal();
}

// Function to handle "Edit Note" button click
function editNote() {
  const dayNote = document.getElementById('dayNote');
  dayNote.focus();
}

// Function to show the TradingView-style chart for a specific ticker
function showTickerChart(ticker, executions) {
  const chartModal = document.getElementById('chartModal');
  const chartTitle = document.getElementById('chartTitle');
  const chartContainer = document.getElementById('tickerChart');

  chartTitle.textContent = `Price Chart for ${ticker}`;
  chartModal.classList.remove('hidden');

  // Clear previous chart
  chartContainer.innerHTML = '';

  // Ensure TradingView script is loaded asdf
  if (typeof TradingView === 'undefined' || !TradingView.widget) {
    console.error('TradingView widget is not available. Ensure the TradingView script is loaded.');
    alert('Unable to load the chart. Please check your internet connection or try again later.');
    return;
  }

  // Create TradingView widget
  new TradingView.widget({
    container_id: 'tickerChart',
    symbol: ticker.toUpperCase(), // Ensure the ticker is in uppercase
    interval: 'D',
    theme: 'light',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_side_toolbar: false,
    allow_symbol_change: false,
    studies: [],
    details: true,
    withdateranges: true,
    save_image: false,
    show_popup_button: true,
    popup_width: '1000',
    popup_height: '650',
  });
}

// Function to close the chart modal
function closeChartModal() {
  const chartModal = document.getElementById('chartModal');
  chartModal.classList.add('hidden');
}