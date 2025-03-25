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
  { name: "Dairy & Eggs", image: dairy },
  { name: "Fruits & Vegetables", image: fruits },
  { name: "Cold Drinks & Juices", image: drinks },
  { name: "Snacks & Munchies", image: snacks },
  { name: "Breakfast & Instant Food", image: breakfast },
  { name: "Sweets & Chocolates", image: sweets },
  { name: "Bakery & Biscuits", image: bakery },
  { name: "Tea, Coffee & Beverages", image: tea },
  { name: "Atta, Rice & Pulses", image: atta },
  { name: "Spices & Cooking Essentials", image: masala },
  { name: "Sauces, Spreads & Dips", image: sauces },
  { name: "Meat & Seafood", image: meat },
  { name: "Organic & Health Foods", image: organic },
  { name: "Diapers & Baby Essentials", image: babycare },
  { name: "Pharmacy & Wellness", image: pharma },
  { name: "Cleaning & Household", image: cleaning },
  { name: "Home & Kitchen", image: home },
  { name: "Personal Care & Hygiene", image: personal },
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