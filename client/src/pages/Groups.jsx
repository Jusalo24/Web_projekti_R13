import "../styles/groups.css";
import { useGroupApi } from "../hooks/useGroupApi";
import GroupList from "../components/GroupList";
import { useState } from "react";

export default function Groups() {
  const {
    groups,
    myGroups,
    loading,
    createGroup,
    joinGroup,
    joinRequests,
    acceptJoin,
    rejectJoin,
  } = useGroupApi();

  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    await createGroup(form.name, form.description);
    setForm({ name: "", description: "" });
  };

  return (
    <main className="groups">
      <section className="groups__section">
        <h2 className="groups__title">Groups</h2>

        <div className="groups__layout">
          {/* --- CREATE GROUP FORM --- */}
          <div className="group-form-section">
            <form className="group-form" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Group name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button type="submit">Create Group</button>
            </form>
          </div>

          {/* --- JOIN REQUESTS (VISIBLE ONLY FOR OWNERS) --- */}
          <div className="group-requests-section">
            <h3 className="requests-title">Join Requests</h3>

            {joinRequests.length === 0 ? (
              <p>No pending requests</p>
            ) : (
              joinRequests.map((req) => (
                <div className="request-card" key={req.id}>
                  <p>
                    <strong>Group:</strong> {req.groupName}
                  </p>
                  <p>
                    <strong>User:</strong> {req.user_id.slice(0, 6)}...
                  </p>

                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() =>
                        acceptJoin(req.group_id, req.id)
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectJoin(req.group_id, req.id)
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- MY GROUPS --- */}
        <section className="my-groups">
          <h2 className="groups__title">My Groups</h2>

          <div className="groups__list-container">
            {myGroups.length === 0 ? (
              <p>You are not a member of any groups yet.</p>
            ) : (
              <GroupList groups={myGroups} />
            )}
          </div>
        </section>

        {/* --- PUBLIC GROUPS --- */}
        <section className="public-groups">
          <h2 className="groups__title">Public Groups</h2>

          <div className="groups__list-container">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <GroupList groups={groups} onJoin={joinGroup} />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
