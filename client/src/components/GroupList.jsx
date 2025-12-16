import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/groups.css";
import { useGroupApi } from "../hooks/useGroupApi";

export default function GroupList({ groups, onJoin }) {
    const navigate = useNavigate();
    const { loggedInName } = useGroupApi();

    return (
        <div className="group-list">
            {groups.map((group) => {
                // Safely handle null/undefined values
                const groupName = group.name || "Unnamed Group";
                const groupDescription = group.description || "No description provided";
                const ownerName = group.owner_name || "Unknown";

                // Truncate long names/descriptions
                const displayName = groupName.length > 15 
                    ? groupName.substring(0, 17) + "..." 
                    : groupName;

                const displayDescription = groupDescription.length > 30 
                    ? groupDescription.substring(0, 25) + "..." 
                    : groupDescription;

                const displayOwner = ownerName === loggedInName 
                    ? "You" 
                    : (ownerName.length > 15 ? ownerName.substring(0, 15) + "..." : ownerName);

                return (
                    <div className="group-card" key={group.id}>
                        <h3 className="group-card__title">{displayName}</h3>
                        <p className="group-card__description">{displayDescription}</p>

                        <div className="group-card__footer">
                            <span className="group-card__owner">
                                Owner: {displayOwner}
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
                )
            })}
        </div>
    );
}