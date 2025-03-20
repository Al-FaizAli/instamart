import React from "react";
import { Link } from "react-router-dom";
import "./Departments.css";
import paan from "../../assets/paan.avif";
import dairy from "../../assets/dairy.avif";
import fruits from "../../assets/fruits.avif";
import drinks from "../../assets/drinks.avif";
import snacks from "../../assets/snacks.avif";
import breakfast from "../../assets/breakfast.avif";
import sweets from "../../assets/sweets.avif";
import bakery from "../../assets/bakery.avif";
import tea from "../../assets/tea.avif";
import atta from "../../assets/atta.avif";
import masala from "../../assets/masala.avif";
import sauces from "../../assets/sauces.avif";
import meat from "../../assets/meat.avif";
import organic from "../../assets/organic.avif";
import babycare from "../../assets/babycare.avif";
import pharma from "../../assets/pharma.avif";
import cleaning from "../../assets/cleaning.avif";
import home from "../../assets/home.avif";
import personal from "../../assets/personal.avif";
import petcare from "../../assets/petcare.avif";

const departments = [
  { name: "Paan Corner", image: paan },
  { name: "Dairy, Bread & Eggs", image: dairy },
  { name: "Fruits & Vegetables", image: fruits },
  { name: "Cold Drinks & Juices", image: drinks },
  { name: "Snacks & Munchies", image: snacks },
  { name: "Breakfast & Instant Food", image: breakfast },
  { name: "Sweet Tooth", image: sweets },
  { name: "Bakery & Biscuits", image: bakery },
  { name: "Tea, Coffee & Health Drink", image: tea },
  { name: "Atta, Rice & Dal", image: atta },
  { name: "Masala, Oil & More", image: masala },
  { name: "Sauces & Spreads", image: sauces },
  { name: "Chicken, Meat & Fish", image: meat },
  { name: "Organic & Healthy Living", image: organic },
  { name: "Baby Care", image: babycare },
  { name: "Pharma & Wellness", image: pharma },
  { name: "Cleaning Essentials", image: cleaning },
  { name: "Home & Office", image: home },
  { name: "Personal Care", image: personal },
  { name: "Pet Care", image: petcare },
];

const Departments = () => {
  return (
    <div className="departments-container">
      {departments.map((dept, index) => (
        <Link
          key={index}
          to={`/department/${dept.name}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={dept.image}
            alt={dept.name}
            className="department-image"
          />
        </Link>
      ))}
    </div>
  );
};

export default Departments;