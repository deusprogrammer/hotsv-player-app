import React from 'react';

const Monster = ({monster, monsterKey, isSelected, onSelect, onHover}) => (
    <button 
        className={`flex flex-col items-center justify-center monster${isSelected ? ' selected' : ''}`} 
        onClick={() => onSelect(monsterKey)}
        onMouseOver={() => {
            onHover(monster);
        }}
        onMouseOut={() => {
            onHover(null);
        }}
    >
        <img className="enemy-arrow" alt="enemy selection arrow" src={`${process.env.PUBLIC_URL}/green-down-arrow.png`} />
        <img className="enemy-image" alt="enemy" src={monster.imageUrl || `${process.env.PUBLIC_URL}/slime.webp`} />
        <div style={{color: "white", fontWeight: "bolder"}}>{monster.name} {monster.hp}/{monster.maxHp}</div>
    </button>
);

export default Monster;