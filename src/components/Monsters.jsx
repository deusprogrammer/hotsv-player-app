import React from 'react';
import Monster from './Monster';

const Monsters = ({monsters, targets, actionArea, onSelect, onHover}) => (
    <div id="monsters">
        {Object.keys(monsters ?? {}).map((key) => (
            <Monster
                key={key}
                monsterKey={key}
                monster={monsters[key]}
                actionArea={actionArea}
                isSelected={targets.includes(key)}
                onSelect={onSelect}
                onHover={onHover}
            />
        ))}
    </div>
);

export default Monsters;