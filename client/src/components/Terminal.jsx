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

      fontFamily: "'Menlo', 'SF Mono', 'JetBrains Mono', monospace",
      fontSize: 13,
      lineHeight: 1.2,
      letterSpacing: 0,
      fontWeight: "400",
      theme: {
        // background: "#1e1e1e",
        background: "#1f2023",
        foreground: "#d4d4d4",
        cursor: "#aeafad",
        cursorAccent: "#1e1e1e",
        selectionBackground: "#264f78",

        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",

        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#ffffff",
      },
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
        height: "100%",
        width: "100%",
        minHeight: 0,
      }}
    />
  );
}