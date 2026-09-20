// Controls the main DDAS dashboard
import { useEffect, useState } from "react";

import Header from "./components/Header";
import Status from "./components/Status";
import Activity from "./components/Activity";

import "./App.css";

function App() {
    const [records, setRecords] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        window.ddas.getRecords().then((data) => {
            setRecords(data);
        });

        window.ddas.onFileActivity((activity) => {
            setActivities((oldActivities) => {
                return [activity, ...oldActivities].slice(0, 10);
            });

            window.ddas.getRecords().then((data) => {
                setRecords(data);
            });
        });
    }, []);

    const duplicateCount = activities.filter((activity) => {
        return activity.type === "duplicate";
    }).length;

    return (
        <div className="app">
            <Header />

            <main>
                <Status
                    fileCount={records.length}
                    duplicateCount={duplicateCount}
                />

                <Activity activities={activities} />
            </main>
        </div>
    );
}

export default App;