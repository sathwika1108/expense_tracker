import { Pie } from "react-chartjs-2";

function ExpensePieChart({ expenses }) {
  const filteredExpenses = Array.isArray(expenses) ? expenses : [];
  const categories = {};

  filteredExpenses.forEach((exp) => {
    categories[exp.category] =
      (categories[exp.category] || 0) + Number(exp.amount);
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
          "#FF9800",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "300px" }}>
      <h3>Category-wise Expenses</h3>
      <Pie data={data} />
    </div>
  );
}

export default ExpensePieChart;
