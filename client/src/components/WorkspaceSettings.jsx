import api from "../api/api.js";
import { useNavigate } from "react-router-dom";
import "./WorkspaceSettings.css";
import { SettingsIcon, TrashIcon } from "./icons.jsx";

export default function WorkspaceSettings({ members, workspaceName, roomId, onClose, }) {
    const navigate = useNavigate();

    async function deleteWorkspace() {
        const confirmed = window.confirm("Delete this workspace permanently?");
        if (!confirmed) return;
        try {
            await api.delete(`/workspace/${roomId}`);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to delete workspace");
        }
    }

    async function removeMember(userId) {
        try {
            await api.delete(`/workspace/${roomId}/members/${userId}`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to remove member");
        }
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

    return (
        <div className="card settings-modal">
            <div className="settings-modal__head">
                <div>
                    <h2 className="settings-modal__title">
                        <SettingsIcon width={16} height={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                        Workspace settings
                    </h2>
                    <p className="settings-modal__subtitle">{workspaceName}</p>
                </div>
            </div>

            <p className="settings-modal__section-label">Members</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {members.map((member) => (
                    <div className="member-row" key={member.userId}>
                        <span className="member-row__name">{member.username}</span>

                        <div className="member-row__actions">
                            {member.role === "OWNER" ? (
                                <span className="badge badge--owner">Owner</span>
                            ) : (
                                <>
                                    <select
                                        className="select"
                                        value={member.role}
                                        onChange={(e) => changeRole(member.userId, e.target.value)}
                                    >
                                        <option value="EDITOR">EDITOR</option>
                                        <option value="VIEWER">VIEWER</option>
                                    </select>

                                    <button
                                        className="row-icon-btn"
                                        onClick={() => removeMember(member.userId)}
                                        title="Remove member"
                                    >
                                        <TrashIcon width={14} height={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <hr className="settings-modal__divider" />

            <p className="settings-modal__section-label">Danger zone</p>

            <div className="settings-modal__danger-row">
                <p className="settings-modal__danger-copy">
                    Deleting a workspace removes it and all of its files for every member. This can't be undone.
                </p>
                <button className="btn btn--danger" onClick={deleteWorkspace}>
                    Delete workspace
                </button>
            </div>

            <div className="settings-modal__footer">
                <button className="btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
