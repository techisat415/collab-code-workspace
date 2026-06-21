import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function InvitePage() {

  const { roomId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    async function loadInvite() {

      const res = await api.get(`/workspace/${roomId}/invite`);
      setWorkspace(res.data);
    }

    loadInvite();
  }, [roomId]);

  async function joinWorkspace() {

    await api.post(`/workspace/${roomId}/join`);

    navigate(`/workspace/${roomId}`);
  }

  if (!workspace) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>

      <h1>{workspace.name}</h1>

      <p>
        Invited by {workspace.owner}
      </p>

      {workspace.isMember ? (

        <button
          onClick={() =>
            navigate(`/workspace/${roomId}`)
          }
        >
          Open Workspace
        </button>

      ) : (

        <button
          onClick={joinWorkspace}
        >
          Join Workspace
        </button>

      )}

    </div>
  );
}