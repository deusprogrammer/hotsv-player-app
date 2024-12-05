import React from 'react';
import { useEventListener } from '../hooks/EventHooks';
import { useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web'
import { ATTACKER, DEFENDER } from '../utils';

const Monster = ({monster, monsterKey, isSelected, onSelect, onHover}) => {
    const [attacking, attackingApi] = useSpring(() => ({
        from: { scale: 1.0 },
        config: {duration: "250"}
    }));
    const [defending, defendingApi] = useSpring(() => ({
        from: {x:0},
        config: {duration: "100"}
    }));
    const onEvent = useCallback((event) => {
        switch(event.actionType) {
            case ATTACKER:
                console.log(`${monster.name}-${monsterKey} attacked`);
                attackingApi.start({
                    from: { scale: 1.0 },
                    to: [{ scale: 1.5 },{ scale: 1.0 }]
                });
                break;
            case DEFENDER:
                console.log(`${monster.name}-${monsterKey} was attacked`);
                defendingApi.start({
                    from: {x: 0},
                    to: [{x: 10},{x:-10},{x:10},{x:-10},{x:0}]
                });
                break;
            default:
                break;
        }
    }, [monster.name, monsterKey, attackingApi, defendingApi]);
    useEventListener(`~${monsterKey}`, onEvent);

    return (
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
            <animated.img style={{...attacking, ...defending}} className="enemy-image" alt="enemy" src={monster.imageUrl || `${process.env.PUBLIC_URL}/slime.webp`} />
            <div style={{color: "white", fontWeight: "bolder"}}>{monster.name} {monster.hp}/{monster.maxHp}</div>
        </button>
    );
};

export default Monster;