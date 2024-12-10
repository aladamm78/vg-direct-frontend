import React from "react";

function Footer() {
  return (
    <footer style={{ textAlign: "center", padding: "1em", background: "#f1f1f1" }}>
      <p>
        Data provided by{" "}
        <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">
          RAWG API
        </a>
      </p>
    </footer>
  );
}

export default Footer;
