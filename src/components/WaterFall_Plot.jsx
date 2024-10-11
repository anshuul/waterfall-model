import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WaterFall_Plot = ({ data }) => {
  console.log("WaterFall_Plot data:", data); // Debugging

  const labels = data.map(item => item.month);
  const values = data.map(item => item.intermediateValue);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Intermediate Values",
        data: values,
        backgroundColor: values.map(val =>
          val >= 0 ? "rgba(75, 192, 192, 0.5)" : "rgba(255, 99, 132, 0.5)"
        ),
        borderColor: values.map(val =>
          val >= 0 ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Waterfall Chart of Intermediate Values",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="p-4 mx-auto w-full max-w-4xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WaterFall_Plot;
