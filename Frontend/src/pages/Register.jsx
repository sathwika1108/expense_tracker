import { useState } from "react";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("REGISTER RESPONSE:", res.data);
      alert("Registration successful. Now login.");
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setIsCreating(false);
    }
  };

  return (
  <div className="auth-container">
    <div className="auth-card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <span
          style={{ color: "#6366f1", cursor: "pointer" }}
          onClick={() => window.location.href = "/login"}
        >
          Login
        </span>
      </p>
    </div>
  </div>
);

}

export default Register;
