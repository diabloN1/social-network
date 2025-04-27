"use client";
import React, { useState } from "react";
import "./header.css";
import logout from "../api/_auth/logout";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Project Name */}
        <div className="project-name">
          <h1>Social Net</h1>
        </div>

        {/* Nav Bar */}
        <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
        </div>
        <div className="header-right">
          {/* Hamburger Icon for small screens */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <img src="/icons/logout.svg" alt="Logout" />
          </button>
      </div>
    </header>
  );
};

export default Header;
