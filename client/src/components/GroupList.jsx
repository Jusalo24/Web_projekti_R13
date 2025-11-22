import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/groups.css";
import { useGroupApi } from "../hooks/useGroupApi";

export default function GroupList({ groups, onJoin }) {
    const navigate = useNavigate();
    const { ownerName } = useGroupApi();

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
                            Owner: {group.owner_name === ownerName ? "You" : (group.owner_name || "Unknown")}
                        </span>

                        <div className="group-card__buttons">

                            {/* If onJoin exists -> Public Groups list */}
                            {onJoin && (
                                <button
                                    className="group-card__join-btn"
                                    onClick={() => onJoin(group.id)}
                                >
                                    Join
                                </button>
                            )}

                            {/* If onJoin does NOT exist -> My Groups list */}
                            {!onJoin && (
                                <button
                                    className="group-card__open-btn"
                                    onClick={() => navigate(`/groupDetails/${group.id}`)}
                                >
                                    Open
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}