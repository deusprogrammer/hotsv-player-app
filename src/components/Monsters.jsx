import React from 'react';
import Monster from './Monster';

const Monsters = ({monsters, targets, onSelect, onHover}) => (
    <div id="monsters">
        {Object.keys(monsters ?? {}).map((key) => (
            <Monster
                monsterKey={key}
                monster={monsters[key]}
                isSelected={targets.includes(key)}
                onSelect={onSelect}
                onHover={onHover}
            />
        ))}
    </div>
);

export default Monsters;