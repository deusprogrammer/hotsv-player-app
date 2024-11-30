import React from 'react';

const colors = ["lightgray", "white", "yellow", "orange", "red"];

const getRarity = (monster) => {
    let rarity = [];
    for (let i = 0; i < 10; i++) {
        let color = colors[Math.floor(i/2)];
        if (i < Math.ceil(monster.rarity/2)) {
            rarity.push(<span key={`rarity-star-${i}`} style={{color, WebkitTextStrokeColor: "white", WebkitTextStrokeWidth: "1px"}}>&#9733;</span>);    
        } else {
            rarity.push(<span key={`rarity-star-${i}`} style={{color: "black", WebkitTextStrokeColor: "white", WebkitTextStrokeWidth: "1px"}}>&#9733;</span>);
        }
    }

    return rarity;
}

const MonsterPreview = ({monster}) => (
    <div style={{fontSize: "1.0rem"}}>
        <h2 style={{fontSize: "1.2rem", margin: "0px"}}>{monster.name}</h2>
        <hr />
        <div style={{fontStyle: "italic", marginLeft: "5px"}}>{monster.description}</div>
        <br />
        <div>
            <div>HP: {monster.hp}/{monster.maxHp}</div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>
                <div>STR: {monster.str}</div>
                <div>DEX: {monster.dex}</div>
                <div>INT: {monster.int}</div>
                <div>HIT: {monster.hit}</div>
                <div>DMG: {monster.dmg}</div>
                <div>AC: {monster.ac}</div>
            </div>
            <div>Rarity: {getRarity(monster)}</div>
        </div>
    </div>
);

export default MonsterPreview;