import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import socket from "../socket/socket";

import "xterm/css/xterm.css";

export default function SharedTerminal({ roomId }) {

  const terminalRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);

    if (terminalRef.current) {
      console.log("terminal size:", terminalRef.current?.clientWidth, terminalRef.current?.clientHeight);
      
      term.open(terminalRef.current);
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(terminalRef.current);
      setTimeout(() => {
        fitAddon.fit();
        term.focus();

        console.log("Terminal initialized and fit to container.");
        console.log("rows:", term.rows, "cols:", term.cols);
        term.write("Welcome to the shared terminal!\r\n");
        term.write("~/ $ ");
      }, 0);
    }


    let buffer = "";
    
    term.onData((data) => {
      if (data === "\r") {
        const command = buffer;
        socket.emit("terminal-command", {
          roomId,
          command,
        });
        
        term.write("\r\n");
        buffer = "";
        return;
      }

      if (data === "\u007f") {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }
      buffer += data;
      term.write(data);
    });

    const handleOutput = (output) => {
      term.write(output);
      term.write("\r\n~/ $ ");
      term.scrollToBottom();
    };
    
    socket.on("terminal-output", handleOutput);


    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("terminal-output", handleOutput);
      window.removeEventListener("resize", handleResize);

      initializedRef.current = false;

      term.dispose();
    };

  }, [roomId]);

  return (
    <div
      ref={terminalRef}
      style={{
        height: "300px",
        width: "100%",
        border: "1px solid #333",
      }}
    />
  );
}