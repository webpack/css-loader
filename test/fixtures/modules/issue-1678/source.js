import first from "./first.css";
import second from "./second.css";

// Concatenation is where a preserved BOM corrupts: it lands mid-file.
const css = first.toString() + second.toString();

__export__ = css;

export default css;
