const form = document.getElementById("transaction-form");
const tableBody = document.querySelector("#transaction-table tbody");
const chartCanvas = document.getElementById("summary-chart");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTransactions(data = transactions) {
  tableBody.innerHTML = "";
  data.forEach(tx => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td>${tx.type}</td>
      <td>${tx.amount}</td>
      <td>${tx.notes || ""}</td>
    `;
    tableBody.appendChild(row);
  });
}

function updateChart() {
  const income = transactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const expense = transactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const newTransaction = {
    amount: form.amount.value,
    date: form.date.value,
    category: form.category.value,
    notes: form.notes.value,
    type: form.type.value
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderTransactions();
  updateChart();
  form.reset();
});

function applyFilters() {
  const filterCategory = document.getElementById("filter-category").value.toLowerCase();
  const filterDate = document.getElementById("filter-date").value;

  const filtered = transactions.filter(tx => {
    return (
      (!filterCategory || tx.category.toLowerCase().includes(filterCategory)) &&
      (!filterDate || tx.date === filterDate)
    );
  });

  renderTransactions(filtered);
}

function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,Category,Type,Amount,Notes\n";

  transactions.forEach(tx => {
    const row = [tx.date, tx.category, tx.type, tx.amount, tx.notes || ""].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize
renderTransactions();
updateChart();
