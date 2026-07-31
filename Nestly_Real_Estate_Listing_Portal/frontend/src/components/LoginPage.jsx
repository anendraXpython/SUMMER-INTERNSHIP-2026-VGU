import { useState } from "react";
import { loginUser } from "../api/api";

function LoginPage({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("buyer");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await loginUser({ username, email, role });
      onLoggedIn(res.data);
    } catch (error) {
      setIsError(true);
      setMessage(error?.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="login-page">
      <header className="app-header">
        <h1 className="logo">Nestly</h1>
      </header>

      <section className="hero">
        <h2>Welcome to Nestly</h2>
        <p>Enter your details to start searching listings, or list properties as an agent.</p>
      </section>

      <section className="login-section">
        <div className="login-box">
          <form onSubmit={handleSubmit}>
            <label>Your Name</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>I am a...</label>
            <div className="role-toggle">
              <button
                type="button"
                className={role === "buyer" ? "role-btn active" : "role-btn"}
                onClick={() => setRole("buyer")}
              >
                Buyer
              </button>
              <button
                type="button"
                className={role === "agent" ? "role-btn active" : "role-btn"}
                onClick={() => setRole("agent")}
              >
                Agent
              </button>
            </div>

            <button type="submit" className="btn-primary">
              Enter Nestly
            </button>
          </form>

          {message && (
            <p className={isError ? "message error" : "message success"}>{message}</p>
          )}
        </div>
      </section>

      <footer className="app-footer">
        <p>Nestly</p>
      </footer>
    </div>
  );
}

export default LoginPage;
