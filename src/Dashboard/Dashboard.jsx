// src/App.js
import React, { useState } from 'react';
import Menu from './Menu';
import Details from './Details';
import { menuItemsData } from './MenuData';
import './css/dashboard.css'; // Add some basic styling

const Dashboard = () => {
  // State to track the ID of the active/selected item
  const [activeItemId, setActiveItemId] = useState(menuItemsData[0].id);

  // Function to find the active item details from the data
  const activeItem = menuItemsData.find(item => item.id === activeItemId);

  return (
    <div className="app-container">
      <Menu
        items={menuItemsData}
        activeItemId={activeItemId}
        onSelectItem={setActiveItemId}
      />
      <Details
        item={activeItem}
      />
    </div>
  );
};

export default Dashboard;
