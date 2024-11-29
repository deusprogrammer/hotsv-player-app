import React from 'react';

const getAbilityText = (ability) => {
    let message = ``;
    let target = ``;

    switch (ability.target) {
        case 'ENEMY':
            if (ability.area === 'ALL') {
                target = 'all hostiles';
            } else {
                target = 'one hostile';
            }
            break;
        case 'CHAT':
            if (ability.area === 'ALL') {
                target = 'all friendlies';
            } else {
                target = 'one friendly';
            }
            break;
        case 'ANY':
            if (ability.area === 'ALL') {
                target = 'all hostiles and players';
            } else {
                target = 'one hostile or player';
            }
            break;
        default:
            target = 'unknown';
    }

    switch (ability.element) {
        case 'CLEANSING':
            message = `Cleanses ${ability.buffs}`;
            break;
        case 'BUFFING':
            message = `${ability.buffs} for ${ability.buffsDuration} ticks to ${target}`;
            break;
        case 'HEALING':
            message = `Heals ${ability.dmg} ${ability.dmgStat} to ${target}.`;
            break;
        default:
            message = `${ability.dmg} ${ability.element !== 'NONE' ? ability.element.toLowerCase() : ''} ${ability.dmgStat} damage ${ability.procTime > 0 ? ` every ${ability.procTime} ticks for ${ability.maxProcs} ticks` : ''} to ${target}`;
            break;
    }

    return message;
};

const AbilityPreview = ({ability}) => (
    <div style={{fontSize: "1.0rem", margin: "0px"}}>
        <h2 style={{fontSize: "1.2rem", margin: "0px"}}>{ability.name}</h2>
        <hr />
        <div style={{fontStyle: "italic", marginLeft: "5px"}}>{ability.description}</div>
        <br />
        <div style={{marginLeft: "5px"}}>Effect: {getAbilityText(ability)}</div>
        <div style={{marginLeft: "5px"}}>Cost: {ability.ap}AP</div>
    </div>
);

export default AbilityPreview;