import { useEffect, useState } from "react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <nav className="app-nav">
      <h3 className="brand">Expense Tracker</h3>

      <div className="nav-actions">
        <button className="btn btn-secondary" onClick={() => (window.location.href = "/dashboard")}>
          Dashboard
        </button>
        <button className="btn btn-secondary" onClick={() => (window.location.href = "/add-expense")}>
          Add Expense
        </button>
        <button className="btn btn-secondary" onClick={() => (window.location.href = "/budget")}>
          Budget
        </button>

        <button
          className="btn btn-secondary theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          <span className="theme-icon" aria-hidden="true">
            {darkMode ? "☀" : "☾"}
          </span>
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
