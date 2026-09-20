// Displays DDAS title and active status
function Header() {
    return (
        <header className="header">
            <div>
                <h1>DDAS</h1>
                <p>Data Download Duplication Alert System</p>
            </div>

            <div className="status-badge">
                <span>●</span> ACTIVE
            </div>
        </header>
    );
}

export default Header;