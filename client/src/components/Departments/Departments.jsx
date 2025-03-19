import React from "react";
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
  { image: paan },
  { image: dairy },
  { image: fruits },
  { image: drinks },
  { image: snacks },
  { image: breakfast },
  { image: sweets },
  { image: bakery },
  { image: tea },
  { image: atta },
  { image: masala },
  { image: sauces },
  { image: meat },
  { image: organic },
  { image: babycare },
  { image: pharma },
  { image: cleaning },
  { image: home },
  { image: personal },
  { image: petcare },
];

const Departments = () => {
  return (
    <div className="departments-container">
      {departments.map((dept, index) => (
        <img key={index} src={dept.image} alt={`Department ${index + 1}`} className="department-image" />
      ))}
    </div>
  );
};

export default Departments;
