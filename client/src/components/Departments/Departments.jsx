import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Departments.css";
import { fetchDepartments } from "../../api";

// Unsplash API configuration
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = "https://api.unsplash.com/search/photos";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch departments from MongoDB
        const departmentsResponse = await fetchDepartments();

        // 2. Fetch images from Unsplash for each department
        const departmentsWithImages = await Promise.all(
          departmentsResponse.data.map(async (dept) => {
            try {
              const response = await axios.get(
                `${UNSPLASH_API}?query=${encodeURIComponent(dept.department)}&client_id=${ACCESS_KEY}&per_page=1`
              );

              return {
                ...dept,
                image: response.data.results[0]?.urls?.small ||
                  `https://source.unsplash.com/random/300x200/?${encodeURIComponent(dept.department)},grocery`
              };
            } catch (unsplashError) {
              console.error(`Error fetching image for ${dept.department}:`, unsplashError);
              return {
                ...dept,
                image: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(dept.department)},grocery`
              };
            }
          })
        );

        setDepartments(departmentsWithImages);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading departments...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>Error loading departments: {error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="departments-container">
      {departments.map((dept) => (
        <Link
          key={dept.department_id}
          to={`/department/${dept.department_id}`}
          className="department-link"
        >
          <div className="department-card">
            <div className="image-container">
              <img
                src={dept.image}
                alt={dept.department}
                className="department-image"
                loading="lazy"
                onLoad={handleImageLoad}
              />
              {imagesLoaded < departments.length && (
                <div className="image-placeholder"></div>
              )}
            </div>
            <div className="department-info">
              <h3 className="department-name">{dept.department}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Departments;