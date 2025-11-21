import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGroupApi } from "../hooks/useGroupApi";
import "../styles/groupDetails.css";

export default function GroupDetails() {
    const { id } = useParams();
    const { fetchGroupById, ownerId } = useGroupApi();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchGroupById(id);
            setGroup(data);
            setLoading(false);
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
                        {group.owner_id === ownerId
                            ? "You"
                            : group.owner_name || group.owner_id}
                    </p>

                    <p>
                        <strong>Created:</strong>{" "}
                        {new Date(group.created_at).toLocaleString().slice(0, 10)}
                    </p>
                </div>
            </section>

            <section className="group-details__content">
                <h3>Members</h3>
                <p>Members listing will come here...</p>

                <h3>Movies</h3>
                <p>Movies listing will come here...</p>
            </section>
        </main>
    );
}