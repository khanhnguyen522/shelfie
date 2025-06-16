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
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newCategory, setNewCategory] = useState("");

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
    const price = parseFloat(newPrice) || 0;
    const timestamp = new Date();

    const updated = {
      ...shelves,
      [activeShelf]: [
        ...shelves[activeShelf],
        {
          name: newItem,
          time: timestamp,
          price,
          quantity: newQuantity,
          category: newCategory,
        },
      ],
    };
    updated[activeShelf].sort((a, b) => new Date(a.time) - new Date(b.time));
    setShelves(updated);

    setHistory((prev) => {
      const newLog = [
        {
          name: newItem,
          price,
          quantity: newQuantity,
          action: "add",
          time: timestamp,
          emoji: "📦",
          category: newCategory,
        },

        ...prev,
      ];
      return newLog.slice(0, 50); // keep more if you want
    });

    setNewItem("");
    setNewPrice("");
    setNewQuantity(1);
    setNewCategory("");
    setReaction(":)");
    setSearchTerm("");
  };

  const handleRemove = (item, action) => {
    const updatedShelf = shelves[activeShelf]
      .map((i) => {
        if (
          i.name === item.name &&
          new Date(i.time).toISOString() === new Date(item.time).toISOString()
        ) {
          if (i.quantity && i.quantity > 1) {
            return { ...i, quantity: i.quantity - 1 };
          }
          return null;
        }
        return i;
      })
      .filter(Boolean);

    setShelves({
      ...shelves,
      [activeShelf]: updatedShelf,
    });

    setHistory((prev) =>
      prev.map((entry) => {
        if (entry.name === item.name && entry.time === item.time) {
          return {
            ...entry,
            emoji: action === "eat" ? "🍽️" : "🗑️",
          };
        }
        return entry;
      })
    );

    setReaction(action === "eat" ? ":D" : ":(");
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    const updated = {
      ...shelves,
      [activeShelf]: shelves[activeShelf].map((item) =>
        item.name === editingItem.name && item.time === editingItem.time
          ? { ...item, name: editText }
          : item
      ),
    };
    setShelves(updated);
    setEditingItem(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditText("");
  };

  function groupHistoryByWeek(history) {
    const grouped = {};
    history.forEach((entry) => {
      const date = new Date(entry.time);
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      const weekKey = monday.toISOString().slice(0, 10);
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(entry);
    });

    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0] - new Date(a[0])))
      .map(([weekStart, items]) => ({
        weekStart,
        items,
        total: items.reduce((sum, item) => sum + (item.price || 0), 0),
      }));
  }

  function getCategoryIcon(category) {
    switch (category) {
      case "fruit":
        return "🍎";
      case "veggie":
        return "🥦";
      case "snack":
        return "🍪";
      case "drink":
        return "🥤";
      case "other":
        return "📦";
      default:
        return "";
    }
  }

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
        <input
          type="number"
          min="1"
          placeholder="Qty"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value)) || 1}
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          <option value="">Category</option>
          <option value="fruit">🍎 Fruit</option>
          <option value="veggie">🥦 Veggie</option>
          <option value="snack">🍪 Snack</option>
          <option value="drink">🥤 Drink</option>
          <option value="other">📦 Other</option>
        </select>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
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
                {editingItem &&
                editingItem.name === item.name &&
                editingItem.time === item.time ? (
                  <div className="item-info">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="item-actions">
                      <button onClick={handleEditSave} className="edit-button">
                        💾
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="cancel-button"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-info">
                      {getCategoryIcon(item.category)} {item.name}
                      {item.quantity > 1 && <strong>×{item.quantity}</strong>}
                      <small>{new Date(item.time).toLocaleDateString()}</small>
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditText(item.name);
                        }}
                        className="edit"
                      >
                        ✏️
                      </button>
                    </div>
                  </>
                )}
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

      <aside className={`history-panel${showHistory ? " show" : ""}`}>
        <h3>Spending History</h3>
        {groupHistoryByWeek(history).map((week) => (
          <div key={week.weekStart} className="weekly-group">
            <h4>Week of {new Date(week.weekStart).toLocaleDateString()}</h4>
            <ul>
              {week.items.map((it, i) => (
                <li key={i}>
                  {getCategoryIcon(it.category)} {it.emoji} {it.name}
                  {it.quantity > 1 && ` ×${it.quantity}`} — $
                  {(it.price ?? 0).toFixed(2)}
                  <span className="history-date">
                    ({new Date(it.time).toLocaleDateString()})
                  </span>
                </li>
              ))}
            </ul>
            <div className="weekly-total">Total: ${week.total.toFixed(2)}</div>
          </div>
        ))}{" "}
      </aside>
    </div>
  );
}

export default App;
