// src/components/Menu.js
import React from 'react';
import { menuItemsData } from './MenuData';
const Menu = ({ items, activeItemId, onSelectItem }) => {
  return (
    <nav className="menu-section">
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            // Apply an 'active' class based on the current item
            className={activeItemId === item.id ? 'active' : ''}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
