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

  useEffect(() => {
    localStorage.setItem("shelfie-data", JSON.stringify(shelves));
  });

  const handleAdd = () => {
    if (!newItem) return;
    const updated = {
      ...shelves,
      [activeShelf]: [
        ...shelves[activeShelf],
        { name: newItem, time: new Date() },
      ],
    };
    setShelves(updated);
    setNewItem("");
    setReaction(":)");
  };

  const handleRemove = (item, action) => {
    const updated = {
      ...shelves,
      [activeShelf]: shelves[activeShelf].filter((i) => i != item),
    };
    setShelves(updated);
    setReaction(action === "eat" ? ":D" : ":(");
  };

  return (
    <div>
      <div className="header">
        <img
          src={require("./fridge-logo.png")}
          alt="Shelfie Logo"
          className="logo"
        />
        <h1>SHELFIE</h1>
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

      <ul className="item-list">
        {shelves[activeShelf].map((item, idx) => (
          <li key={idx}>
            {item.name} <small>{new Date(item.time).toLocaleString()}</small>
            <button onClick={() => handleRemove(item, "eat")}>Eat</button>
            <button onClick={() => handleRemove(item, "throw")}>Throw</button>
          </li>
        ))}
      </ul>

      <div className="add-box">
        <input
          type="text"
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button onClick={handleAdd}>+</button>
      </div>

      <div className="reaction-face">{reaction}</div>
    </div>
  );
}

export default App;
