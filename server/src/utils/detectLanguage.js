export default function detectLanguage(name){

  const ext = name.split(".").pop();

  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    py: "python",
    cpp: "cpp",
    c: "c",
    java: "java",
    css: "css",
    html: "html",
  };

  return (map[ext] ||"plaintext");
}