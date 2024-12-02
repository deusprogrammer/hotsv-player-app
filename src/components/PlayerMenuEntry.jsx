import React from 'react';

const PlayerMenuEntry = ({player, isSelected, actionArea, onSelect}) => (
    <div className={`player${isSelected ? ' selected' : ''}${actionArea === 'ALL' ? ' selectable' : ''}`}>
        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
        <button onClick={onSelect}>
            {player.name}
        </button>
        <div>
            HP: {player.hp}/{player.maxHp} AP:{player.ap}
        </div>
    </div>
);

export default PlayerMenuEntry;