import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./InvitePage.css";

export default function InvitePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/workspace/${roomId}/invite`);
        setWorkspace(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Couldn't load this invite.");
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [roomId]);

  async function joinWorkspace() {
    try {
      await api.post(`/workspace/${roomId}/join`);
      navigate(`/workspace/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't join this workspace.");
    }
  }

  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-page__shell">
          <div className="invite-card card">
            <div className="invite-loading">
              <span className="invite-spinner" />
              Loading invite...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <div className="invite-page__shell">
        <div className="invite-hero">
          <div className="invite-hero__brand">
            <span className="invite-hero__dot" />
            Collaborative IDE
          </div>

          <h1>You've been invited.</h1>
          <p>
            Review the workspace details below, then join the room or open it if you're already a member.
          </p>
        </div>

        <div className="invite-card card">
          {workspace && (
            <>
              <div className="invite-card__top">
                <div>
                  <p className="invite-card__eyebrow">Workspace</p>
                  <h2>{workspace.name}</h2>
                </div>
                <span className="invite-card__room">{roomId}</span>
              </div>

              <div className="invite-meta">
                <div>
                  <span className="invite-meta__label">Invited by</span>
                  <strong>{workspace.owner}</strong>
                </div>
                <div>
                  <span className="invite-meta__label">Status</span>
                  <strong>{workspace.isMember ? "Already a member" : "Ready to join"}</strong>
                </div>
              </div>

              {error && <p className="invite-error">{error}</p>}

              <div className="invite-actions">
                {workspace.isMember ? (
                  <button className="btn btn--primary invite-actions__button" onClick={() => navigate(`/workspace/${roomId}`)}>
                    Open workspace
                  </button>
                ) : (
                  <button className="btn btn--primary invite-actions__button" onClick={joinWorkspace}>
                    Join workspace
                  </button>
                )}

                <button className="btn btn--ghost invite-actions__button" onClick={() => navigate("/dashboard") }>
                  Back to dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}