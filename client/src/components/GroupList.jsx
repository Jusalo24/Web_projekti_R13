import { useNavigate } from "react-router-dom";
import "../styles/groups.css";

export default function GroupList({ groups, onJoin }) {
    const navigate = useNavigate();

    return (
        <div className="group-list">
            {groups.map((group) => (
                <div className="group-card" key={group.id}>
                    <h3 className="group-card__title">{group.name}</h3>
                    <p className="group-card__description">
                        {group.description || "No description provided"}
                    </p>

                    <div className="group-card__footer">
                        <span className="group-card__owner">
                            Owner: {group.owner_id ? group.owner_id.slice(0, 6) + "..." : "Unknown"}
                        </span>

                        <div className="group-card__buttons">
                            {onJoin && (
                                <button
                                    className="group-card__join-btn"
                                    onClick={() => onJoin(group.id)}
                                >
                                    Join
                                </button>
                            )}

                            <button
                                className="group-card__open-btn"
                                onClick={() => navigate(`/groups/${group.id}`)}
                            >
                                Open
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
