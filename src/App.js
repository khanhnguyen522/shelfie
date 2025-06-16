import { useEffect, useState } from "react";
import "./App.css";

const DEFAULT_SHELVES = {
  top: [],
  bottom: [],
};

function App() {
  const [activeShelf, setActiveShelf] = useState("top");
  const [shelves, setShelves] = useState(() => {
    const saved = localStorage.getItem("shelfie-data");
    return saved ? JSON.parse(saved) : DEFAULT_SHELVES;
  });
  const [newItem, setNewItem] = useState("");
  const [reaction, setReaction] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("dark-mode") === "true";
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("shelfie-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem("shelfie-data", JSON.stringify(shelves));
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("shelfie-history", JSON.stringify(history));
  }, [history]);

  const handleAdd = () => {
    if (!newItem) return;
    const updated = {
      ...shelves,
      [activeShelf]: [
        ...shelves[activeShelf],
        { name: newItem, time: new Date() },
      ],
    };
    updated[activeShelf].sort((a, b) => new Date(a.time) - new Date(b.time));
    setShelves(updated);
    setNewItem("");
    setReaction(":)");
    setSearchTerm("");
  };

  const handleRemove = (item, action) => {
    const updated = {
      ...shelves,
      [activeShelf]: shelves[activeShelf].filter(
        (i) => i.name !== item.name || i.time !== item.time
      ),
    };
    setShelves(updated);
    setReaction(action === "eat" ? ":D" : ":(");

    const emoji = action === "eat" ? "🍽️" : "🗑️";
    setHistory((prev) => {
      const newLog = [
        { name: item.name, action, time: new Date(), emoji },
        ...prev,
      ];
      return newLog.slice(0, 10);
    });
  };

  return (
    <div className="container">
      <div className="header">
        <img
          src={require("./fridge-logo.png")}
          alt="Shelfie Logo"
          className="logo"
        />
        <h1>SHELFIE</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>
      <div className="tabs">
        <button
          onClick={() => setActiveShelf("top")}
          className={activeShelf === "top" ? "active" : ""}
        >
          Top Shelf
        </button>
        <button
          onClick={() => setActiveShelf("bottom")}
          className={activeShelf === "bottom" ? "active" : ""}
        >
          Bottom Shelf
        </button>
      </div>

      <div className="add-box">
        <input
          type="text"
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button onClick={handleAdd}>+</button>
      </div>

      {/* <div className="reaction-face">{reaction}</div> */}

      <div className="drop-zones">
        <div
          className="drop-zone eat"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const item = JSON.parse(e.dataTransfer.getData("item"));
            handleRemove(item, "eat");
          }}
        >
          🍽️ Eat
        </div>
        <div
          className="drop-zone trash"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const item = JSON.parse(e.dataTransfer.getData("item"));
            handleRemove(item, "throw");
          }}
        >
          🗑️ Trash
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm("")}>
            ❌
          </button>
        )}
      </div>

      <div className="scroll-area">
        <ul className="item-list">
          {shelves[activeShelf]
            .filter((item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, idx) => (
              <li
                key={idx}
                className="item"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("item", JSON.stringify(item))
                }
              >
                <div className="item-info">
                  {item.name}{" "}
                  <small>{new Date(item.time).toLocaleDateString()}</small>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <button
        className="history-toggle"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "❌" : "🗃️"}
      </button>

      <div className={`history-panel ${showHistory ? "show" : ""}`}>
        <h3>History</h3>
        <ul>
          {history.map((log, i) => (
            <li key={i}>
              {log.emoji} <strong> {log.name}</strong> - {log.action} on{" "}
              {new Date(log.time).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
