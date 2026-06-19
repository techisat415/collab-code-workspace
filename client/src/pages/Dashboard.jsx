import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [joinId, setJoinId] = useState("");

  const navigate = useNavigate();

  async function loadWorkspaces() {
    const res = await api.get("/workspace");
    setWorkspaces(res.data);
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function createWorkspace() {
    const res = await api.post("/workspace");

    navigate(`/workspace/${res.data.roomId}`);
  }

  async function joinWorkspace() {
    await api.post(`/workspace/${joinId}/join`);

    loadWorkspaces();

    setJoinId("");
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>

      <button onClick={createWorkspace}>
        + Create Workspace
      </button>

      <hr />

      <h2>My Workspaces</h2>

      {workspaces.map((workspace) => (
        <div
          key={workspace.roomId}
          style={{
            padding: "1rem",
            border: "1px solid gray",
            marginTop: "1rem",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(
              `/workspace/${workspace.roomId}`
            )
        }
        >
          {workspace.roomId}
        </div>
      ))}

      <hr />

      <h2>Join Workspace</h2>

      <input
        value={joinId}
        onChange={(e) =>
          setJoinId(e.target.value)
        }
        placeholder="Workspace ID"
      />

      <button onClick={joinWorkspace}>
        Join
      </button>
    </div>
  );
}