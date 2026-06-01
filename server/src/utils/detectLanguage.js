export default function detectLanguage(fileName){

  const ext = fileName.split(".").pop();

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