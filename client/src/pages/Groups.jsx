import "../styles/groups.css";
import { useGroupApi } from "../hooks/useGroupApi";
import GroupList from "../components/GroupList";
import { useState } from "react";
import Notification from "../components/Notification";

export default function Groups() {
  const {
    groups,                // List of all public groups
    myGroups,              // List of groups the user belongs to
    loading,               // Loading state for data fetching
    createGroup,           // API: create a new group
    joinGroup,             // API: send join request
    joinRequests,          // Pending join requests for the user's groups
    acceptJoin,            // Accept a join request
    rejectJoin,            // Reject a join request
    error,                 // Error state (optional)
    notification,          // Notification popup message
    setNotification        // Setter for notification
  } = useGroupApi();

  const [form, setForm] = useState({ name: "", description: "" }); // Create-group form state

  const handleCreate = async (e) => { // Submit new group creation
    e.preventDefault();
    await createGroup(form.name, form.description);
    setForm({ name: "", description: "" });
  };

  return (
    <main className="groups">
      <Notification
        message={notification.message}   // Notification text
        type={notification.type}         // Notification type (success/error)
        onClose={() => setNotification({ message: null })} // Close popup
      />

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
                  setForm({ ...form, name: e.target.value }) // Update name
                }
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value }) // Update description
                }
              />
              <button type="submit">Create Group</button>
            </form>
          </div>

          {/* --- JOIN REQUESTS (OWNERS ONLY) --- */}
          <div className="group-requests-section">
            <h3 className="requests-title">Join Requests</h3>

            {joinRequests.length === 0 ? (
              <p>No pending requests</p> // No join requests
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
                        acceptJoin(req.group_id, req.id) // Approve request
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectJoin(req.group_id, req.id) // Decline request
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

        {/* --- USER'S OWN GROUPS --- */}
        <section className="my-groups">
          <h2 className="groups__title">My Groups</h2>

          <div className="groups__list-container">
            {myGroups.length === 0 ? (
              <p>You are not a member of any groups yet.</p> // No groups joined
            ) : (
              <GroupList groups={myGroups} /> // Show user's groups
            )}
          </div>
        </section>

        {/* --- PUBLIC GROUP LIST --- */}
        <section className="public-groups">
          <h2 className="groups__title">Public Groups</h2>

          <div className="groups__list-container">
            {loading ? (
              <p>Loading...</p> // Loading state
            ) : (
              <GroupList groups={groups} onJoin={joinGroup} /> // Public groups with join button
            )}
          </div>
        </section>
      </section>
    </main>
  );
}