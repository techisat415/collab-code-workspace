import api from "../api/api.js";
import { useNavigate } from "react-router-dom";

export default function WorkspaceSettings({ members, workspaceName, roomId, onClose, }) {
    const navigate = useNavigate();
    async function deleteWorkspace() {

    const confirmed = window.confirm("Delete this workspace permanently?");
    if (!confirmed) return;
    try {
        await api.delete(`/workspace/${roomId}`);
        alert("Workspace deleted");
        navigate("/dashboard");
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to delete workspace");
    }
}

    async function removeMember(userId) {
        await api.delete(`/workspace/${roomId}/members/${userId}`);
        window.location.reload();
    }

    async function changeRole(userId, role) {
        try {
            await api.patch(`/workspace/${roomId}/members/${userId}`, { role });
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to change role");
        }
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


                            {member.role === "OWNER" ? (

                                <span>
                                    OWNER
                                </span>

                            ) : (

                                <select
                                    value={member.role}
                                    onChange={(e) =>
                                        changeRole(
                                            member.userId,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="EDITOR">
                                        EDITOR
                                    </option>

                                    <option value="VIEWER">
                                        VIEWER
                                    </option>
                                </select>

                            )}

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
                onClick={deleteWorkspace}
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