import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import RegionLink from "./components/RegionLink";
import ProjectList from "./components/ProjectList";
import "./App.css";

// Main App component defined as a functional component using TypeScript
const App: React.FC = () => {
  // Array of region objects used for rendering region links
  const regions = [
    { code: "IN", name: "India" },
    { code: "MEA", name: "Middle East & Africa" },
    { code: "SEA", name: "South East Asia" },
    { code: "EU", name: "Europe" },
    { code: "LATAM", name: "Latin America" },
    { code: "US", name: "United States" },
  ];

  // State variables to store total counts of projects
  const [totalGoLiveReadyCount, setTotalGoLiveReadyCount] = useState<number>(0);
  const [totalTestingCount, setTotalTestingCount] = useState<number>(0);

  useEffect(() => {
    // Fetches total counts of projects based on their status and updates state variables
    const fetchTotalCounts = async () => {
      try {
        // API key should be stored in environment variables for security
        const apiKey = import.meta.env.VITE_API_KEY;
        // Making concurrent API calls using Promise.all for better performance
        const [goLiveResp, testingResp] = await Promise.all([
          axios.get("https://api.rocketlane.com/api/1.0/projects", {
            headers: { "api-key": apiKey },
            params: { "project.field.26538.value": "18" },
          }),
          axios.get("https://api.rocketlane.com/api/1.0/projects", {
            headers: { "api-key": apiKey },
            params: { "project.field.26538.value": "4" },
          }),
        ]);

        // Updating state with the count of projects
        setTotalGoLiveReadyCount(goLiveResp.data.data.length);
        setTotalTestingCount(testingResp.data.data.length);
      } catch (error) {
        // Proper error handling in case of API call failure
        console.error("Error fetching total project counts:", error);
      }
    };

    // Invoke the fetch function on component mount
    fetchTotalCounts();
  }, []);

  return (
    <Router>
      {/* Overall wrapper for the dashboard */}
      <div className="app">
        <h1>Go-Live Dashboard</h1>
        <div className="total-project-counts">
          <p className="counter go-live-counter">
            Total Go-Live Ready Projects: {totalGoLiveReadyCount}
          </p>
          <p className="counter testing-counter">
            Total Projects in Testing: {totalTestingCount}
          </p>
        </div>
      </div>
      <div className="app2">
        <h1 className="firstHeader">Select Your Region</h1>
        <div className="regions-list">
          {/* Map function to iterate over regions array and render links */}
          {regions.map((region) => (
            <RegionLink
              key={region.code} // Providing unique key for each child
              regionCode={region.code}
              regionName={region.name}
            />
          ))}
        </div>

        {/* Setting up Route for displaying project list based on region */}
        <Routes>
          <Route path="/projects/:regionCode" element={<ProjectList />} />
        </Routes>
      </div>
    </Router>
  );
};

// Exporting App component for use in other parts of the application
export default App;
