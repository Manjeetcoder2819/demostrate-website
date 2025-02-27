"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "@/styles/ResourceChart.css"; // Import styles correctly for Next.js

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const ResourceCountChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => `${item.name} (${item.count} items)`),
    datasets: [
      {
        data: data.map((item) => item.count),
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
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} items`,
        },
      },
    },
    cutout: "50%", // Makes it a donut chart
  };

  return (
    <div className="chart-container">
      <h4>Resource Type Count</h4>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default ResourceCountChart;
