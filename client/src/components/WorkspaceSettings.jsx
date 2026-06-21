import api from "../api/api.js";
import { useNavigate } from "react-router-dom";

export default function WorkspaceSettings({members, workspaceName, roomId, onClose,}) {

    async function removeMember(userId) {
        await api.delete(`/workspace/${roomId}/members/${userId}`);
        window.location.reload();
    }

    console.log(members);
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#1e1e1e",
        border: "1px solid #444",
        borderRadius: "10px",
        padding: "20px",
        zIndex: 1000,
        width: "600px",
        color: "white",
      }}
    >
      <h2>⚙ Workspace Settings</h2>

      <p
        style={{
          color: "#aaa",
          marginBottom: "20px",
        }}
      >
        {workspaceName}
      </p>

      <h3>Members</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {members.map((member) => (

          <div
            key={member.userId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #333",
              borderRadius: "6px",
            }}
          >
            <div>
              <strong>
                {member.username}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <span>
                {member.role}
              </span>
              

              <button>
                Change Role
              </button>

              {member.role !== "OWNER" && (
                <button onClick={() => removeMember(member.userId)}>Remove</button>
              )}
            </div>
          </div>

        ))}
      </div>

      <hr
        style={{
          margin: "20px 0",
        }}
      />

      <h3>Danger Zone</h3>

      <button
        style={{
          background: "#8b0000",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Delete Workspace
      </button>

      <div
        style={{
          marginTop: "20px",
          textAlign: "right",
        }}
      >
        <button onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}