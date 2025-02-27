const sendEmail = async ({ email, url, device, MB, grams, resourceSizeData, resourceCountData }) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          url,
          device,
          MB,
          grams,
          resourceSizeData,
          resourceCountData,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to send email.");
  
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  };
  
  export default sendEmail;
  