let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTransactions(filtered = transactions) {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';
  filtered.forEach((t, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.category}</td>
      <td>${t.amount}</td>
      <td>${t.type}</td>
      <td>${t.date}</td>
      <td>${t.note || ''}</td>
      <td>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
      <td>
        <button class="pdf-btn" data-index="${index}">Download PDF</button>
      </td>
    `;
    list.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = this.getAttribute('data-index');
      transactions.splice(index, 1);
      saveTransactions();
      renderTransactions();
    });
  });

  document.querySelectorAll('.pdf-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = this.getAttribute('data-index');
      const t = transactions[index];

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Transaction Receipt', 70, 20);

      doc.setFontSize(12);
      doc.text(`Date: ${t.date}`, 20, 40);
      doc.text(`Type: ${t.type}`, 20, 50);
      doc.text(`Category: ${t.category}`, 20, 60);
      doc.text(`Amount: #${t.amount}`, 20, 70);
      doc.text(`Note: ${t.note || 'N/A'}`, 20, 80);

      doc.setFontSize(10);
      doc.text('Thank you for using Personal Finance Tracker.', 20, 100);

      doc.save(`transaction-${index + 1}.pdf`);
    });
  });

  renderChart();
}



function addTransaction(e) {
  e.preventDefault();
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const type = document.getElementById("type").value;
  transactions.push({ amount: parseFloat(amount), date, category, note, type });
  saveTransactions();
  renderTransactions();
  document.getElementById("transaction-form").reset();
}

function applyFilters() {
  const catFilter = document
    .getElementById("filter-category")
    .value.toLowerCase();
  const dateFilter = document.getElementById("filter-date").value;
  const filtered = transactions.filter((t) => {
    return (
      (!catFilter || t.category.toLowerCase().includes(catFilter)) &&
      (!dateFilter || t.date === dateFilter)
    );
  });
  renderTransactions(filtered);
}

function resetFilters() {
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-date").value = "";
  renderTransactions();
}

function exportCSV() {
  const rows = [
    ["Type", "Amount", "Date", "Category", "Note"],
    ...transactions.map((t) => [
      t.type,
      t.amount,
      t.date,
      t.category,
      t.note || "",
    ]),
  ];
  const csvContent = rows.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

function renderChart() {
  const canvas = document.getElementById("chart");

  const ctx = canvas.getContext("2d");
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  if (window.chartInstance) window.chartInstance.destroy();

  window.chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

document
  .getElementById("transaction-form")
  .addEventListener("submit", addTransaction);

renderTransactions();
