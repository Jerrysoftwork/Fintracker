let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function renderTransactions(filtered = transactions) {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';
  filtered.forEach(t => {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <span>${t.type}</span>
      <span>${t.amount}</span>
      <span>${t.date}</span>
      <span>${t.category}</span>
      <span>${t.note || ''}</span>
    `;
    list.appendChild(item);
  });
  renderChart();
}

function addTransaction(e) {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;
  const note = document.getElementById('note').value;
  const type = document.getElementById('type').value;
  transactions.push({ amount: parseFloat(amount), date, category, note, type });
  saveTransactions();
  renderTransactions();
  document.getElementById('transaction-form').reset();
}

function applyFilters() {
  const catFilter = document.getElementById('filter-category').value.toLowerCase();
  const dateFilter = document.getElementById('filter-date').value;
  const filtered = transactions.filter(t => {
    return (!catFilter || t.category.toLowerCase().includes(catFilter)) &&
           (!dateFilter || t.date === dateFilter);
  });
  renderTransactions(filtered);
}

function resetFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-date').value = '';
  renderTransactions();
}

function exportCSV() {
  const rows = [['Type', 'Amount', 'Date', 'Category', 'Note'], ...transactions.map(t => [t.type, t.amount, t.date, t.category, t.note || ''])];
  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
}

function renderChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  if (window.chartInstance) window.chartInstance.destroy();

  window.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    }
  });
}

document.getElementById('transaction-form').addEventListener('submit', addTransaction);

renderTransactions();
