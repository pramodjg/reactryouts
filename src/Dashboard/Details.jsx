// src/components/Details.js
import React from 'react';
import SimpleForm from '../simpleform/SimpleForm';

const Details = ({ item }) => {
  if (!item) {
    return <div className="details-section">Select an item from the menu.</div>;
  }
 if(item.name=="Form Demo")
 {
   return (<SimpleForm></SimpleForm>)
 }
  return (
    <div className="details-section">
      <h2>{item.name}</h2>
      <p>{item.details}</p>
    </div>
  );
};

export default Details;
