import React from 'react';

const LoopList = ({ loops }) => {
  return (
    <ul>
      {loops.map((loop, index) => (
        <li key={index}>
          <audio controls src={loop} loop></audio>
        </li>
      ))}
    </ul>
  );
};

export default LoopList;
