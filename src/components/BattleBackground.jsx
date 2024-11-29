import React from 'react';

const BattleBackground = ({foreground, background}) => (
    <div style={{position: "absolute", height: "100%", width: "100%", top: "0px", left: "0px"}}>
        <img id="background-front" alt="background" src={`${process.env.PUBLIC_URL}/${foreground}-front.png`} />
        <img id="background-back" alt="background" src={`${process.env.PUBLIC_URL}/${background}-back.png`} />
    </div>  
)

export default BattleBackground;