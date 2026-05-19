import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home(){
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        if(!roomId) return;

        navigate(`/editor/${roomId}`);
    };

    return(
        <div>
            <h1>Collaborative Workspace</h1>
            <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoin}>Join Room</button>
        </div>
    )
}

export default Home;