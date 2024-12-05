import React from 'react';

const PlayerMenuEntry = ({player, isSelected, onSelect, onHover}) => (
    <div className={`flex flex-row gap-3 player${isSelected ? ' selected' : ''}`}>
        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
        <button onClick={onSelect} onMouseOver={() => onHover(player.name)} onMouseOut={() => onHover(null)}>
            {player.name}
        </button>
        <div>
            HP: {player.hp}/{player.maxHp} AP:{player.ap}
        </div>
    </div>
);

export default PlayerMenuEntry;