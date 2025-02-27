"use client";


import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResourceSizeChart from "@/components/ResourceSizeChart";
import ResourceCountChart from "@/components/ResourceCountChart";
import supabase from "@/lib/supabaseClient";
import "@/styles/HeroSection.css";  


const ResultsPage = () => {
  const { uniqueId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);  


  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);


      // ✅ 1️⃣ Try getting data from local storage first
      const storedData = localStorage.getItem(`report-${uniqueId}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setResults(parsedData);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }


      // ✅ 2️⃣ If not found in local storage, fetch from Supabase
      const { data, error } = await supabase
        .from("client")
        .select("*")
        .eq("unique_url", `/results/${uniqueId}`)
        .single();


      if (error || !data) {
        console.error("Report not found:", error);
        setResults(null);
      } else {
        setResults({
          device: "Desktop",
          MB: data.page_weight,
          grams: data.co2e_per_visit,
          resourceSizeData: data.resource_size_data || [], // ✅ No need to parse since it's JSONB
    resourceCountData: data.resource_count_data || [], // ✅ No need to parse since it's JSONB
        });
      }


      setLoading(false);
    };


    fetchReport();
  }, [uniqueId]);


  if (loading) return <p>⏳ Loading...</p>;
  if (!results) return <p>⚠️ No report found for this ID. Please generate a new report.</p>;


  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Analysis Report</h1>
        <p><strong>Device:</strong> {results.device || "Unknown"}</p>
        <p><strong>Page Weight:</strong> {results.MB || "N/A"} MB</p>
        <p><strong>CO₂ Emissions per Visit:</strong> {results.grams || "N/A"} g</p>


        {/* ✅ Show Resource Charts If Data Exists */}
        {results.resourceSizeData && results.resourceCountData ? (
          <div className="charts-container">
            <ResourceSizeChart data={results.resourceSizeData} />
            <ResourceCountChart data={results.resourceCountData} />
          </div>
        ) : (
          <p>📊 No resource data available.</p>
        )}
      </div>
    </div>
  );
};


export default ResultsPage;
