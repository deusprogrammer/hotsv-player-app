import React from 'react';
import { useEventListener } from '../hooks/EventHooks';
import { useCallback } from 'react';
import { ATTACKER, DEFENDER } from '../utils';

const PlayerMenuEntry = ({player, isSelected, onSelect, onHover}) => {
    const onEvent = useCallback((event) => {
        switch(event.actionType) {
            case ATTACKER:
                console.log(`${player.name} attacked`);
                break;
            case DEFENDER:
                console.log(`${player.name} was attacked`);
                break;
            default:
                break;
        }
    }, [player.name]);
    useEventListener(player.name, onEvent);

    return (
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
};

export default PlayerMenuEntry;