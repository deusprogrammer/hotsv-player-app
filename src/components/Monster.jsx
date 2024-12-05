import React from 'react';
import { useEventListener } from '../hooks/EventHooks';
import { useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web'
import { ATTACKER, DEFENDER } from '../utils';
import { useState } from 'react';

const Monster = ({monster, monsterKey, isSelected, onSelect, onHover}) => {
    const [attacking, attackingApi] = useSpring(() => ({
        from: { scale: 1.0 },
        config: {duration: "250"}
    }));
    const [defending, defendingApi] = useSpring(() => ({
        from: {x:0},
        config: {duration: "100"}
    }));
    const [damage, damageApi] = useSpring(() => ({
        from: {x:0, y: 60, opacity: 0},
        config: {duration: "100"}
    }));
    const [damageNumber, setDamageNumber] = useState(0);
    const onEvent = useCallback((event) => {
        switch(event.actionType) {
            case ATTACKER:
                attackingApi.start({
                    from: { scale: 1.0 },
                    to: [{ scale: 1.5 },{ scale: 1.0 }]
                });
                break;
            case DEFENDER:
                setDamageNumber(`${event.data.dmg} ${event.data.dmgType}`);
                defendingApi.start({
                    from: {x: 0},
                    to: [{x: 10},{x:-10},{x:10},{x:-10},{x:0}]
                });
                damageApi.start({
                    from: {x:0, y: 0, opacity: 0},
                    to: [{x: 0, y: -10, opacity: 1.0}, {x: 0, y: -10, opacity: 0.0}, {x: 0, y: 60, opacity: 0.0}],
                    config: {duration: "500"}
                });
                break;
            default:
                break;
        }
    }, [attackingApi, defendingApi, damageApi]);
    useEventListener(`~${monsterKey}`, onEvent);

    return (
        <div className="relative">
            <animated.div style={{...damage}} className="absolute w-full h-full text-center"><span className="text-white text-xl" style={{textShadow: "0px 0px 5px black"}}>-{damageNumber}</span></animated.div>
            <button 
                className={`flex flex-col items-center justify-center relative monster${isSelected ? ' selected' : ''}`} 
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
        </div>
    );
};

export default Monster;