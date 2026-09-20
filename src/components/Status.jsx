// Displays monitoring status and file statistics.
function Status({ fileCount, duplicateCount }) {
    return (
        <section className="status-section">
            <div className="monitor-card">
                <div className="monitor-title">
                    <span className="green-dot">●</span>
                    Monitoring Downloads
                </div>
                <p> DDAS is watching your Downloads folder for new files. </p>
            </div>

            <div className="stats">
                <div className="stat-card">
                    <h2>{fileCount}</h2>
                    <p>Files Recorded</p>
                </div>

                <div className="stat-card">
                    <h2>{duplicateCount}</h2>
                    <p>Duplicates Detected</p>
                </div>
            </div>
        </section>
    );
}

export default Status;