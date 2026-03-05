function Home() {
  return (
    <div className="home-hero">
      <div className="home-hero-content">
        <p className="home-eyebrow">Personal Finance</p>
        <h1>Smart Expense Tracker</h1>
        <p className="home-subtitle">
          Track your daily expenses, stay within budget, and take control of your financial future.
        </p>

        <div className="home-actions">
          <button className="btn btn-secondary" onClick={() => (window.location.href = "/login")}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => (window.location.href = "/register")}>
            Get Started
          </button>
        </div>

        <p className="home-quote">"Small savings today lead to big freedom tomorrow."</p>
      </div>
    </div>
  );
}

export default Home;
