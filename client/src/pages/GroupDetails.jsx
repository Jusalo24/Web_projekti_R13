import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupApi } from "../hooks/useGroupApi";
import "../styles/groupDetails.css";
import GetMoviesSeries from "../components/GetMoviesSeries";

export default function GroupDetails() {
    const { id } = useParams();
    const { fetchGroupById, loggedInId, fetchMoviesByGroup, removeMemberFromGroup, deleteGroup } = useGroupApi();
    const imageSize = "w342"; // Size of poster images: w780, w500, w342, w185, w154, w92, original
    const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Boolean for modal group deleting

    const [group, setGroup] = useState(null); // Stores full group data
    const [loading, setLoading] = useState(true); // Loading state for group fetch

    const navigate = useNavigate(); // For navigation to groups page

    useEffect(() => {
        load();
    }, [id]); // Refetch when ID changes

    const load = async () => {
        setLoading(true); // Start loading
        const data = await fetchGroupById(id); // Fetch group main info
        const movies = await fetchMoviesByGroup(id); // Fetch group's movie list
        setGroup({ ...data, movies }); // Merge group data with movies
        setLoading(false); // Stop loading
        console.log("Group details:", { ...data, movies }); // Debug log
    };

    // Handle clicking on a kick member button
    const handleKickMemberClick = async (member) => {
        await removeMemberFromGroup(group.id, member.user_id);
        await load();
    }

    if (loading) return <p>Loading...</p>; // Show while loading
    if (!group) return <p>Group not found</p>; // Show if group doesn't exist

    return (
        <main className="group-details">
            {/* Group header section */}
            <section className="group-details__header">
                {group.owner_id === loggedInId && (
                    <button
                        className="group-details__delete-group-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirmDelete(true);
                        }}
                    >
                        Delete group
                    </button>
                )}
                <h2>{group.name}</h2>
                <p className="group-details__description">{group.description}</p>

                <div className="group-details__info">
                    <p>
                        <strong>Owner:</strong>{" "}
                        {group.owner_id === loggedInId ? "You" : group.owner_name}
                    </p>

                    <p>
                        <strong>Created:</strong>{" "}
                        {new Date(group.created_at).toLocaleString().slice(0, 10)}
                    </p>
                </div>
            </section>

            {/* Members list */}
            <h3 className="group-details__title">Members</h3>
            <div className="group-details__members-container">
                {group.members && group.members.length > 0 ? (
                    <div className="group-details__members-list">
                        {group.members.map((member) => (
                            <div className="member-card" key={member.id}>
                                <div className="member-info">
                                    <span className="member-name">
                                        {member.username || member.id}
                                        {member.user_id === loggedInId ? " (You)" : ""}
                                    </span>
                                    <span className="member-role">{member.role}</span>
                                </div>

                                {/* Kick button visible only for group owner */}
                                {group.owner_id === loggedInId && member.user_id !== loggedInId && (
                                    <button
                                        className="member-card__kick-member__button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleKickMemberClick(member);
                                        }}
                                    >
                                        Kick
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No members yet...</p>
                )}
            </div>

            {/* Movies section */}
            <h3 className="group-details__title">Movies</h3>
            <div className="group-details__movies-container">
                {group.movies && group.movies.length > 0 ? (
                    <GetMoviesSeries
                        type="group_movies" // Special mode for group movie fetch
                        movieIds={group.movies.map((movie) => ({
                            id: movie.movie_external_id, // External movie ID
                            type: movie.media_type, // Movie or TV type
                        }))}
                        groupId={id} // Pass group ID to child component
                        onDataChanged={load} // Refresh group data on changes
                        imageSize={imageSize} // Poster size for grid
                    />
                ) : (
                    <p>No movies added yet...</p>
                )}
            </div>
            {showConfirmDelete && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Delete this group?</h3>
                        <p>This action cannot be undone.</p>

                        <div className="modal-buttons">
                            <button
                                className="modal-btn cancel"
                                onClick={() => setShowConfirmDelete(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-btn"
                                onClick={async () => {
                                    await deleteGroup(group.id);
                                    navigate("/groups");
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}