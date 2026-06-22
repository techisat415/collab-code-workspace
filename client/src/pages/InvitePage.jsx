import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./InvitePage.css";
import { LogoMarkIcon, ArrowRightIcon } from "../components/icons.jsx";

export default function InvitePage() {

  const { roomId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await api.get(`/workspace/${roomId}/invite`);
        setWorkspace(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "This invite is invalid or has expired.");
      }
    }

    loadInvite();
  }, [roomId]);

  async function joinWorkspace() {
    try {
      await api.post(`/workspace/${roomId}/join`);
      navigate(`/workspace/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't join that workspace.");
    }
  }

  if (error) {
    return (
      <div className="invite-shell">
        <div className="card invite-card">
          <span className="invite-card__mark"><LogoMarkIcon /></span>
          <p className="error-text">{error}</p>
          <Link className="btn" to="/">Back home</Link>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="invite-shell">
        <div className="card invite-card">
          <div className="invite-card__loading">
            <span className="spinner" />
            Loading invite…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-shell">
      <div className="card invite-card">
        <span className="invite-card__mark"><LogoMarkIcon /></span>

        <div>
          <span className="invite-card__eyebrow">You're invited</span>
          <h1 className="invite-card__title">{workspace.name}</h1>
          <p className="invite-card__owner">Invited by {workspace.owner}</p>
        </div>

        {workspace.isMember ? (
          <button className="btn btn--primary btn--block" onClick={() => navigate(`/workspace/${roomId}`)}>
            Open workspace
            <ArrowRightIcon width={15} height={15} />
          </button>
        ) : (
          <button className="btn btn--primary btn--block" onClick={joinWorkspace}>
            Join workspace
            <ArrowRightIcon width={15} height={15} />
          </button>
        )}
      </div>
    </div>
  );
}
