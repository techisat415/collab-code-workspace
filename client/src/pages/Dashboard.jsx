import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Dashboard.css";

export default function Dashboard() {

  const [workspaces, setWorkspaces] = useState([]);
  const [joinId, setJoinId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      const res = await api.get("/workspace");
      setWorkspaces(res.data);
    }
    catch (err) {
      console.error(err);
    }
  }

  async function createWorkspace() {
    const name = prompt("Workspace name");

    if (!name) return;

    const res = await api.post("/workspace", { name });

    navigate(`/workspace/${res.data.roomId}`);
  }

  async function joinWorkspace() {

    if (!joinId.trim()) return;

    await api.post(
      `/workspace/${joinId}/join`
    );

    navigate(`/workspace/${joinId}`);
  }

  const ownedWorkspaces = workspaces.filter(
    ws => ws.role === "OWNER"
  );

  const sharedWorkspaces = workspaces.filter(
    ws => ws.role !== "OWNER"
  );

  return (
    <div className="dashboard">

      <div className="dashboard__hero">

        <div>
          <h1 className="dashboard__title">
            Welcome back 👋
          </h1>

          <p className="dashboard__subtitle">
            Manage your collaborative workspaces.
          </p>
        </div>

        <div className="dashboard__actions">

          <button
            className="dashboard-btn dashboard-btn--primary"
            onClick={createWorkspace}
          >
            + Create Workspace
          </button>

          <div className="join-box">
            <input
              value={joinId}
              placeholder="Workspace ID"
              onChange={(e) =>
                setJoinId(e.target.value)
              }
            />

            <button
              className="dashboard-btn"
              onClick={joinWorkspace}
            >
              Join
            </button>
          </div>

        </div>

      </div>

      <section className="workspace-section">

        <h2>Owned Workspaces</h2>

        <div className="workspace-grid">
          {ownedWorkspaces.map(workspace => (
            <WorkspaceCard
              key={workspace.roomId}
              workspace={workspace}
              navigate={navigate}
            />
          ))}
        </div>

      </section>

      <section className="workspace-section">

        <h2>Shared With Me</h2>

        <div className="workspace-grid">
          {sharedWorkspaces.map(workspace => (
            <WorkspaceCard
              key={workspace.roomId}
              workspace={workspace}
              navigate={navigate}
            />
          ))}
        </div>

      </section>

    </div>
  );
}

function WorkspaceCard({
  workspace,
  navigate,
}) {

  return (
    <div
      className="workspace-card"
      onClick={() =>
        navigate(`/workspace/${workspace.roomId}`)
      }
    >

      <h3>{workspace.name}</h3>

      <span
        className={`role-pill ${
          workspace.role === "OWNER"
            ? "owner"
            : "editor"
        }`}
      >
        {workspace.role}
      </span>

      <p className="workspace-id">
        {workspace.roomId}
      </p>

    </div>
  );
}