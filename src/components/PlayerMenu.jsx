import React from 'react';
import PlayerMenuEntry from './PlayerMenuEntry';

const PlayerMenu = ({players, targets, actionArea, onTargetSelect, onHover}) => (
    <div id='players' className={`overflow-y-scroll ${actionArea === 'ALL' ? ' all' : ''}`} style={{fontSize: "1.0rem"}}>
        <h2 style={{fontSize: "1.2rem", margin: "0px"}}>Others</h2>
        <hr />
        {Object.keys(players ?? {}).map((key) => (
            <PlayerMenuEntry
                key={key}
                player={players[key]}
                isSelected={targets.includes(key)}
                onSelect={() => onTargetSelect(key)}
                onHover={(value) => onHover(value)}
            />
        ))}
    </div>
);

export default PlayerMenu;