import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import { LogoMarkIcon, ArrowRightIcon } from "../components/icons.jsx";

function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId) return;

    navigate(`/workspace/${roomId}`);
  };

  return (
    <div className="home">
      <nav className="home-nav">
        <span className="home-nav__brand">
          <span className="home-nav__mark"><LogoMarkIcon width={15} height={15} /></span>
          Workspaces
        </span>

        <div className="home-nav__links">
          <Link className="btn btn--ghost" to="/login">Log in</Link>
          <Link className="btn btn--primary" to="/register">Sign up</Link>
        </div>
      </nav>

      <div className="home-hero">
        <div className="home-hero__copy">
          <span className="home-hero__eyebrow">
            <span className="home-hero__eyebrow-dot" />
            Live, multiplayer editing
          </span>

          <h1>Code together, <em>in the same room</em>.</h1>

          <p className="lede">
            One shared file tree, one terminal, one chat — everyone in the room sees
            every edit and every cursor land in real time.
          </p>

          <form className="home-join" onSubmit={handleJoin}>
            <div className="input-group">
              <input
                className="input"
                type="text"
                placeholder="Enter a room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button className="btn btn--primary" type="submit">
              Join room
              <ArrowRightIcon width={15} height={15} />
            </button>
          </form>

          <p className="home-join__hint">
            Don't have a room yet? <Link to="/register">Create a free account</Link> to start one.
          </p>
        </div>

        <div className="home-hero__visual">
          <div className="code-window">
            <div className="code-window__bar">
              <span className="code-window__dot" />
              <span className="code-window__dot" />
              <span className="code-window__dot" />
              <span className="code-window__filename">main.js</span>
            </div>

            <div className="code-window__body">
              <div className="code-window__line">
                <span className="tok-kw">function</span> <span className="tok-fn">broadcastEdit</span>
                <span className="tok-plain">(doc) {`{`}</span>
              </div>
              <div className="code-window__line">
                <span className="tok-indent">  </span>
                <span className="tok-kw">const</span> <span className="tok-plain">peers = room.peers;</span>
              </div>
              <div className="code-window__line">
                <span className="tok-indent">  </span>
                <span className="tok-plain">peers.</span><span className="tok-fn">forEach</span>
                <span className="tok-plain">(peer {"=>"} {`{`}</span>
              </div>
              <div className="code-window__line">
                <span className="tok-indent">    </span>
                <span className="tok-plain">peer.</span><span className="tok-fn">send</span>
                <span className="tok-plain">(doc.</span><span className="tok-fn">diff</span><span className="tok-plain">());</span>
              </div>
              <div className="code-window__line">
                <span className="tok-indent">  </span>
                <span className="tok-plain">{`}`});</span>
              </div>
              <div className="code-window__line">
                <span className="tok-cmt">  // nobody steps on anybody's cursor</span>
              </div>
              <div className="code-window__line">
                <span className="tok-plain">{`}`}</span>
              </div>

              <span className="cursor-flag cursor-flag--maya" style={{ top: 40, left: 232 }}>
                <span className="cursor-flag__caret" />
                <span className="cursor-flag__tag">MAYA</span>
              </span>

              <span className="cursor-flag cursor-flag--alex" style={{ top: 89, left: 62 }}>
                <span className="cursor-flag__caret" />
                <span className="cursor-flag__tag">ALEX</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
