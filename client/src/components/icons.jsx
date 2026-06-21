// Minimal stroke-icon set — no external icon package required.
// Every icon is 18x18, inherits color via currentColor, and shares the
// same stroke weight so the IDE chrome reads as one consistent system.

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const ChevronLeftIcon = (p) => (
  <svg {...base} {...p}><polyline points="15 6 9 12 15 18" /></svg>
);

export const ChevronRightIcon = (p) => (
  <svg {...base} {...p}><polyline points="9 6 15 12 9 18" /></svg>
);

export const ChevronUpIcon = (p) => (
  <svg {...base} {...p}><polyline points="6 15 12 9 18 15" /></svg>
);

export const ChevronDownIcon = (p) => (
  <svg {...base} {...p}><polyline points="6 9 12 15 18 9" /></svg>
);

export const FilesIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 4h6l2 2h8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
  </svg>
);

export const ChatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </svg>
);

export const TerminalIcon = (p) => (
  <svg {...base} {...p}>
    <polyline points="4 7 9 12 4 17" />
    <line x1="12" y1="17" x2="20" y2="17" />
  </svg>
);

export const PlayIcon = (p) => (
  <svg {...base} {...p}><polygon points="6 4 20 12 6 20 6 4" /></svg>
);

export const SettingsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.6-2-3.4-2.4.5a8 8 0 0 0-1.7-1L14.8 3h-3.6l-.5 2.5a8 8 0 0 0-1.7 1l-2.4-.5-2 3.4 2 1.6a7.97 7.97 0 0 0 0 2l-2 1.6 2 3.4 2.4-.5a8 8 0 0 0 1.7 1l.5 2.5h3.6l.5-2.5a8 8 0 0 0 1.7-1l2.4.5 2-3.4-2-1.6Z" />
  </svg>
);

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
    <path d="M16 4.3a3 3 0 0 1 0 5.8" />
    <path d="M21 19.5c0-2.5-2-4.2-4.5-4.7" />
  </svg>
);

export const LinkIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 7l1.3-1.3a3.5 3.5 0 0 1 5 5L16 12" />
    <path d="M13 17l-1.3 1.3a3.5 3.5 0 0 1-5-5L8 12" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 12 20.5 4l-5 16-4-6-7-2Z" />
  </svg>
);
