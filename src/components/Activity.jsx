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

                            <div>
                                <strong>{activity.name}</strong>

                                <p>
                                    {activity.type === "duplicate"
                                        ? `Duplicate of ${activity.original}`
                                        : "New file detected"}
                                </p>
                            </div>

                        </div>
                    ))
                )}

            </div>

        </section>
    );
}

export default Activity;