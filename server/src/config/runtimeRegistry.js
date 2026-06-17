export const runtimeRegistry = {
  js: {
    runtime: "node",
    command: (file) => `node "${file}"`,
  },

  mjs: {
    runtime: "node",
    command: (file) => `node "${file}"`,
  },

  ts: {
    runtime: "node",
    command: (file) => `npx ts-node "${file}"`,
  },

  py: {
    runtime: "python",
    command: (file) => `python3 "${file}"`,
  },

  cpp: {
    runtime: "gcc",
    command: (file) =>
      `g++ "${file}" -o app && ./app`,
  },

  c: {
    runtime: "gcc",
    command: (file) =>
      `gcc "${file}" -o app && ./app`,
  },

  java: {
    runtime: "jdk",
    command: (file) => {
      const className =
        file.split("/").pop().replace(".java", "");

      return `
javac "${file}" &&
java ${className}
`;
    },
  },
};