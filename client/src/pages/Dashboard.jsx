import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import { LogoMarkIcon, PlusIcon, LinkIcon } from "../components/icons.jsx";

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  async function loadWorkspaces() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/workspace");
      setWorkspaces(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load your workspaces.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function createWorkspace() {
    const name = prompt("Enter workspace name:");
    if (!name) return;

    try {
      const res = await api.post("/workspace", { name });
      navigate(`/workspace/${res.data.roomId}`);
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't create that workspace.");
    }
  }

  async function joinWorkspace(e) {
    e.preventDefault();
    if (!joinId.trim()) return;

    try {
      await api.post(`/workspace/${joinId}/join`);
      navigate(`/workspace/${joinId}`);
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't join that workspace.");
    }
  }

  const displayName = user?.name || user?.username || user?.email;
  const workspaceCount = workspaces.length;
  const ownedCount = workspaces.filter((workspace) => workspace.role === "OWNER").length;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <span className="dashboard-nav__brand">
          <span className="dashboard-nav__mark"><LogoMarkIcon width={15} height={15} /></span>
          Workspaces
        </span>
        {displayName && <span className="dashboard-nav__user">{displayName}</span>}
      </nav>

      <div className="dashboard-body">
        <section className="dashboard-hero">
          <div className="dashboard-hero__copy">
            <span className="dashboard-kicker">Collaborative coding hub</span>
            <h1>Pick up where you left off.</h1>
            <p>
              Open a workspace, share a room ID, or start fresh in a few seconds.
            </p>

            <div className="dashboard-stats">
              <div className="dashboard-stat card">
                <span>Total workspaces</span>
                <strong>{workspaceCount}</strong>
              </div>
              <div className="dashboard-stat card">
                <span>Owned by you</span>
                <strong>{ownedCount}</strong>
              </div>
              <div className="dashboard-stat card dashboard-stat--accent">
                <span>Fast start</span>
                <strong>Join or create</strong>
              </div>
            </div>
          </div>

          <aside className="dashboard-hero__panel card">
            <div className="dashboard-panel__header">
              <div>
                <p className="dashboard-panel__eyebrow">Quick actions</p>
                <h2>Get into a room</h2>
              </div>
              {displayName && <span className="dashboard-panel__user">{displayName}</span>}
            </div>

            <div className="dashboard-actions">
              <form className="dashboard-join" onSubmit={joinWorkspace}>
                <div className="input-group">
                  <LinkIcon />
                  <input
                    className="input"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Workspace ID"
                    aria-label="Workspace ID"
                  />
                </div>
                <button className="btn" type="submit">Join</button>
              </form>

              <button className="btn btn--primary dashboard-create" onClick={createWorkspace}>
                <PlusIcon width={15} height={15} />
                New workspace
              </button>
            </div>

            <p className="dashboard-panel__hint">
              Share a workspace ID with teammates to jump into the same session.
            </p>
          </aside>
        </section>

        <div className="dashboard-toolbar">
          <div>
            <h1>Your workspaces</h1>
            <p>Jump back into a room, or start a new one.</p>
          </div>
        </div>

        {loading && (
          <div className="card dashboard-state">
            <div className="loading-row">
              <span className="spinner" />
              Loading your workspaces…
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="card dashboard-state dashboard-state--error">
            <p className="error-text">{error}</p>
          </div>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <div className="card dashboard-empty">
            <h2>No workspaces yet</h2>
            <p>Create one to start coding with someone, or join an existing room using its ID.</p>
          </div>
        )}

        {!loading && !error && workspaces.length > 0 && (
          <div className="workspace-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace.roomId}
                className="card workspace-card"
                onClick={() => navigate(`/workspace/${workspace.roomId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/workspace/${workspace.roomId}`);
                  }
                }}
              >
                <div className="workspace-card__accent" />
                <div className="workspace-card__name">{workspace.name}</div>
                <div className="workspace-card__meta">
                  <span className="workspace-card__id">{workspace.roomId}</span>
                  <span className={`badge ${workspace.role === "OWNER" ? "badge--owner" : ""}`}>
                    {workspace.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
