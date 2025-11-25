import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGroupApi } from "../hooks/useGroupApi";
import "../styles/groupDetails.css";
import GetMoviesSeries from "../components/GetMoviesSeries";

export default function GroupDetails() {
    const { id } = useParams();
    const { fetchGroupById, loggedInId, fetchMoviesByGroup } = useGroupApi();
    const imageSize = "w342"; // Size of poster images: w780, w500, w342, w185, w154, w92, original

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchGroupById(id);
            const movies = await fetchMoviesByGroup(id);
            setGroup({ ...data, movies });
            setLoading(false);
            console.log("Group details:", { ...data, movies });
        }
        load();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!group) return <p>Group not found</p>;

    return (
        <main className="group-details">
            <section className="group-details__header">
                <h2>{group.name}</h2>
                <p className="group-details__description">{group.description}</p>

                <div className="group-details__info">
                    <p>
                        <strong>Owner:</strong>{" "}
                        {group.owner_id === loggedInId
                            ? "You"
                            : group.owner_name}
                    </p>

                    <p>
                        <strong>Created:</strong>{" "}
                        {new Date(group.created_at).toLocaleString().slice(0, 10)}
                    </p>
                </div>
            </section>

            <h3 className="group-details__title">Members</h3>
            <div className="group-details__members-container">
                {group.members && group.members.length > 0 ? (
                    <div className="group-details__members-list">
                        {group.members.map((m) => (
                            <div className="member-card" key={m.id}>
                                <div className="member-info">
                                    <span className="member-name">
                                        {m.username || m.id}
                                        {m.user_id === loggedInId ? " (You)" : ""}
                                    </span>
                                    <span className="member-role">{m.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No members yet...</p>
                )}
            </div>

            <h3 className="group-details__title">Movies</h3>
            <div className="group-details__movies-container">
                {group.movies && group.movies.length > 0 ? (
                    <GetMoviesSeries
                        type="group_movies"
                        movieIds={group.movies.map((movie) => ({
                            id: movie.movie_external_id,
                            type: movie.media_type
                        }))}
                        imageSize={imageSize}
                    />
                ) : (
                    <p>No movies added yet...</p>
                )}
            </div>
        </main>
    );

}