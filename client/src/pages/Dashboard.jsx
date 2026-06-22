import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [joinId, setJoinId] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  async function loadWorkspaces() {
    try {
      const res = await api.get("/workspace");
      setWorkspaces(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function createWorkspace() {
    const name = prompt("Workspace name");

    if (!name) return;

    try {
      const res = await api.post("/workspace", {
        name,
      });

      navigate(`/workspace/${res.data.roomId}`);
    } catch (err) {
      console.error(err);
    }
  }

  async function joinWorkspace() {
    if (!joinId.trim()) return;

    try {
      await api.post(`/workspace/${joinId}/join`);

      navigate(`/workspace/${joinId}`);
    } catch (err) {
      console.error(err);
      alert("Unable to join workspace");
    }
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand__icon">
            {"</>"}
          </div>

          <span>Workspaces</span>
        </div>

        <div className="dashboard-user">
          {user?.name || user?.username || "User"}
        </div>
      </header>

      {/* Content */}
      <main className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <h1>Your workspaces</h1>

            <p>
              Jump back into a room, or start a new one.
            </p>
          </div>

          <div className="dashboard-actions">
            <input
              value={joinId}
              onChange={(e) =>
                setJoinId(e.target.value)
              }
              placeholder="Workspace ID"
            />

            <button
              className="dashboard-btn dashboard-btn--secondary"
              onClick={joinWorkspace}
            >
              Join
            </button>

            <button
              className="dashboard-btn dashboard-btn--primary"
              onClick={createWorkspace}
            >
              + New Workspace
            </button>
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="dashboard-empty">
            No workspaces yet.
          </div>
        ) : (
          <div className="workspace-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace.roomId}
                className="workspace-card"
                onClick={() =>
                  navigate(
                    `/workspace/${workspace.roomId}`
                  )
                }
              >
                <h3>{workspace.name}</h3>

                <div className="workspace-meta">
                  <span
                    className={`workspace-role ${
                      workspace.role === "OWNER"
                        ? "owner"
                        : "editor"
                    }`}
                  >
                    {workspace.role}
                  </span>
                </div>

                <p className="workspace-id">
                  {workspace.roomId}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}