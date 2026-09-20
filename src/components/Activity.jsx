// Displays recent file activity
function Activity({ activities }) {
    return (
        <section className="activity-section">

            <h2>Recent Activity</h2>

            <div className="activity-card">

                {activities.length === 0 ? (
                    <p className="empty">
                        No recent activity.
                    </p>
                ) : (
                    activities.map((activity, index) => (
                        <div className="activity-item" key={index}>

                            <span
                                className={
                                    activity.type === "duplicate"
                                        ? "warning"
                                        : "success"
                                }
                            >
                                {activity.type === "duplicate" ? "⚠" : "✓"}
                            </span>

                            <div className="activity-info">

                                <strong>{activity.name}</strong>

                                <p>
                                    {activity.type === "duplicate"
                                        ? `Duplicate of ${activity.original}`
                                        : "New file detected"}
                                </p>

                                <small>
                                    Size: {activity.size} bytes
                                </small>

                                <small className="hash">
                                    SHA-256: {activity.hash}
                                </small>

                            </div>

                        </div>
                    ))
                )}

            </div>

        </section>
    );
}

export default Activity;