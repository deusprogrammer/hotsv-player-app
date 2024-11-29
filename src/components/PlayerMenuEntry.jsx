import React from 'react';

const PlayerMenuEntry = ({player, isSelected, onSelect}) => (
    <div className={`player${isSelected ? ' selected' : ''}`}>
        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
        <button onClick={onSelect}>
            {player.name}
        </button>
        <div>
            HP: {Math.min(player.hp, player.maxHp)}/{player.maxHp} AP:{player.ap}
        </div>
    </div>
);

export default PlayerMenuEntry;