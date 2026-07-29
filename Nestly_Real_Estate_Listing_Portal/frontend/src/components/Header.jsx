function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <h1 className="logo">Nestly</h1>
      <div className="header-right">
        {/* <nav>
          <a href="#listings">Listings</a>
          <a href="#map">Map Search</a>
          <a href="#calculator">Mortgage Calculator</a>
          <a href="#chat">Live Chat</a>
          {user.role === "agent" && <a href="#agent-dashboard">Agent Dashboard</a>}
        </nav> */}

        <nav>
          <a href="#listings">Listings</a>
          <a href="#map">Map Search</a>
          <a href="#calculator">Mortgage Calculator</a>
          <a href="#chat">Live Chat</a>
          {user.role === "agent" && <a href="#agent-dashboard">Agent Dashboard</a>}
          <a href="#about">About</a>
        </nav>
        
        <div className="user-badge">
          Logged in as <strong>{user.username}</strong>
          <span className={`role-pill role-${user.role}`}>{user.role}</span>
          <a href="#logout" onClick={onLogout} className="logout-link">
            Logout
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
