"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Tooltip, Legend, CategoryScale, Chart as ChartJS } from "chart.js";
import "@/styles/ResourceChart.css"; // Correct CSS import for Next.js

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

const ResourceSizeChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => `${item.name} (${item.value} KB)`),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)} KB`,
        },
      },
    },
    cutout: "50%", // Makes it a donut chart
  };

  return (
    <div className="chart-container">
      <h4>Resource Size Distribution</h4>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default ResourceSizeChart;
