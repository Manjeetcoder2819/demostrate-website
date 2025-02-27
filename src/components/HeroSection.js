"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { TextField, Button, Grid, LinearProgress } from "@mui/material";
import sendEmail from "@/lib/EmailService";
import "@/styles/HeroSection.css";

const HeroSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // ✅ URL Validation & Formatting
  const formatURL = (url) => {
    try {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      return new URL(formattedUrl).href;
    } catch {
      return null;
    }
  };

  // ✅ CO2 Calculation Function
  const calculateCO2ePerVisit = (totalByteWeight) => {
    return ((totalByteWeight / (1024 * 1024 * 1.8)) * 0.6).toFixed(2);
  };

  // ✅ Fetch Page Data & Store in Supabase
  const fetchData = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Fetching data...");

    const inputURL = formatURL(e.target.url.value);
    const email = e.target.email.value.trim();
    const uniqueId = uuidv4();

    if (!inputURL) {
      setLoadingMessage("Invalid URL. Please enter a valid website URL.");
      setIsLoading(false);
      return;
    }

    try {
      const apiURL = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(inputURL)}&strategy=desktop&key=${apiKey}`;
      
      const response = await fetch(apiURL);
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

      const json = await response.json();
      const totalByteWeight = json?.lighthouseResult?.audits?.["total-byte-weight"]?.numericValue || 0;
      const co2ePerVisit = calculateCO2ePerVisit(totalByteWeight);

      const resources = json?.lighthouseResult?.audits?.["network-requests"]?.details?.items || [];
      const resourceSizes = {};
      const resourceCounts = {};

      // ✅ Resource Type Mapping
      const typeMapping = {
        Script: "JavaScript",
        Document: "HTML",
        Stylesheet: "CSS",
        Font: "Fonts",
        Image: "Images",
        Media: "Media",
      };

      resources.forEach((resource) => {
        const type = typeMapping[resource.resourceType] || "Other";
        resourceSizes[type] = (resourceSizes[type] || 0) + (resource.resourceSize || 0);
        resourceCounts[type] = (resourceCounts[type] || 0) + 1;
      });

      // ✅ Format Data for Charts
      const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0", "#607D8B"];
      const formattedSizeData = Object.keys(resourceSizes).map((key, index) => ({
        name: key,
        value: parseFloat((resourceSizes[key] / 1024).toFixed(2)),
        color: COLORS[index % COLORS.length],
      }));
      const formattedCountData = Object.keys(resourceCounts).map((key, index) => ({
        name: key,
        count: resourceCounts[key],
        color: COLORS[index % COLORS.length],
      }));

     
      // ✅ Store Data in Supabase with Error Handling
const { error } = await supabase.from("client").insert([
  {
    url: inputURL,
    page_weight: (totalByteWeight / (1024 * 1024)).toFixed(2),
    co2e_per_visit: co2ePerVisit,
    email,
    device: "desktop",
    unique_url: `/results/${uniqueId}`, // Keeping unique URL if needed
  },
]);

if (error) throw new Error(`Supabase Insert Error: ${error.message}`);

      // ✅ Store in Local Storage
      localStorage.setItem(
        `report-${uniqueId}`,
        JSON.stringify({
          device: "Desktop",
          MB: (totalByteWeight / (1024 * 1024)).toFixed(2),
          grams: co2ePerVisit,
          resourceSizeData: formattedSizeData,
          resourceCountData: formattedCountData,
        })
      );

      // ✅ Send Email
      await sendEmail({
        email,
        url: inputURL,
        device: "Desktop",
        MB: (totalByteWeight / (1024 * 1024)).toFixed(2),
        grams: co2ePerVisit,
        resourceSizeData: formattedSizeData,
        resourceCountData: formattedCountData,
        uniqueUrl: `/results/${uniqueId}`,
      });

      // ✅ Redirect to Results Page
      router.push(`/results/${uniqueId}`);
    } catch (error) {
      console.error(error);
      setLoadingMessage(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, router]);

  return (
    <section className="hero-section">
      <div className="page-width">
        <div className="hero-inner">
          <h4>What's my website's impact on the planet?🔥</h4>
          <h1>Make your website eco-friendly, today.</h1>
        </div>

        <div className="section-home">
          <h3>Calculate your web page's Carbon Footprint.</h3>
          <form onSubmit={fetchData}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField id="url" name="url" label="Enter URL" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField id="email" name="email" type="email" label="Enter Email" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button type="submit" variant="contained" className="MuiButton-root" fullWidth disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </Grid>
            </Grid>
          </form>
          <p>{loadingMessage}</p>
          {isLoading && <LinearProgress />}
          <p>Your submitted data will be stored and publicly available when you use this carbon calculator.</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
