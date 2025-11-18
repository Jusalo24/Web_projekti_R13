import "./Account.css"

export default function Account() {
  return (
    <div className="account-container">

      {/* Sivupaneeli */}
      <aside className="account-sidebar">
        <h2>Account</h2>
        <button className="side-btn">Change Password</button>
        <button className="side-btn delete">Delete Account</button>
      </aside>

      {/* Pääsisältö */}
      <main className="account-main">
        <h1>Your Profile</h1>

        <section className="info-box">
          <h3>Name:</h3>
          <p>John Doe</p> {/* Tämä haetaan backendistä myöhemmin */}
        </section>

        <section className="info-box">
          <h3>Your Favorites</h3>
          <ul className="list">
            <li>Movie 1</li>
            <li>Movie 2</li>
            <li>Movie 3</li>
          </ul>
        </section>

        <section className="info-box">
          <h3>Your Groups</h3>
          <ul className="list">
            <li>Group A</li>
            <li>Group B</li>
          </ul>
        </section>

      </main>
    </div>
  )
}

