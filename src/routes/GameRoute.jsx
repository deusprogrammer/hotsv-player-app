import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const config = {
    BASE_URL: 'https://deusprogrammer.com/api/twitch',
    WS_URL: 'ws://localhost:3002',
};

const colors = ["lightgray", "white", "yellow", "orange", "red"];

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

const SELECT_ACTION = "START";
const SELECT_ABILITY = "SELECT_ABILITY";
const SELECT_ITEM = "SELECT_ITEM";
const TEST_MENU = "TEST_MENU";

const ACTION_TYPE_ATTACK = "ATTACK";
const ACTION_TYPE_ABILITY = "ABILITY";
const ACTION_TYPE_ITEM = "ITEM";

const GameRoute = () => {
    const [jwt, setJwt] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [abilityHover, setAbilityHover] = useState(null);
    const [monsterHover, setMonsterHover] = useState(null);
    const [gameContext, setGameContext] = useState({});
    const [dungeon, setDungeon] = useState(null);
    const [targets, setTargets] = useState([]);
    const {channelId} = useParams();

    const [actionType, setActionType] = useState();
    const [actionArea, setActionArea] = useState();
    const [actionTarget, setActionTarget] = useState();
    const [selectedAction, setSelectedAction] = useState();
    const [turnState, setTurnState] = useState(SELECT_ACTION);

    const websocket = useRef();

    const attack = () => {
        websocket.current.send(
            JSON.stringify({
                event: 'ACTION',
                userType: 'PLAYER',
                channelId,
                action: {
                    type: 'ATTACK',
                    actor: playerData.name,
                    targets,
                    jwtToken: jwt
                },
            })
        );
    };

    const ability = (ability) => {
        websocket.current.send(
            JSON.stringify({
                event: 'ACTION',
                userType: 'PLAYER',
                channelId,
                action: {
                    type: 'USE',
                    actor: playerData.name,
                    targets,
                    argument: ability,
                },
                jwtToken: jwt
            })
        );
    };

    const spawnMonster = (monster) => {
        websocket.current.send(
            JSON.stringify({
                event: 'ACTION',
                userType: 'PLAYER',
                channelId,
                action: {
                    type: 'SPAWN_MONSTER',
                    actor: monster,
                },
                jwtToken: jwt
            })
        );
    };

    const connect = (jwt) => {
        const ws = new W3CWebSocket(config.WS_URL);

        //Register player
        ws.onopen = () => {
            console.log('WEB SOCKET OPENED');
            ws.send(
                JSON.stringify({
                    event: 'JOIN',
                    userType: 'PLAYER',
                    channelId,
                    jwtToken: jwt
                })
            );
        };

        ws.onmessage = (message) => {
            console.log('MESSAGE: ' + message.data);
            const { event, playerData: newPlayerData, gameContext: newGameContext, dungeon: newDungeon } = JSON.parse(
                message.data
            );

            switch (event) {
                case 'JOINED':
                    if (newPlayerData) {
                        setPlayerData(newPlayerData);
                    }
                    if (newGameContext) {
                        setGameContext(newGameContext);
                        console.log("GAME CONTEXT " + JSON.stringify(newGameContext, null, 5));
                    }
                    break;
                case 'UPDATE':
                    console.log("UPDATE MESSAGE RECEIVED");
                    console.log("DUNGEON: " + JSON.stringify(newDungeon, null, 5));
                    setDungeon(newDungeon);
                    break;
                default:
                    break;
            }
        };

        ws.onclose = (e) => {
            console.log(
                'Socket is closed. Reconnect will be attempted in 5 second.',
                e.reason
            );
        };

        ws.onerror = (err) => {};

        websocket.current = ws;
    };

    useEffect(() => {
        console.log("CHANNEL: " + channelId);
        (async () => {
            let {
                data: { jwt },
            } = await axios.post(
                `https://deusprogrammer.com/api/streamcrabs/auth/ws`,
                {
                    channel: channelId,
                },
                {
                    headers: {
                        'X-Access-Token': localStorage.getItem('accessToken'),
                    },
                }
            );
            setJwt(jwt);

            if (channelId) {
                connect(jwt);
            }
        })();
    }, []);

    if (!playerData) {
        return <>Loading</>;
    }

    let component;
    switch (turnState) {
        case SELECT_ACTION:
            component = (
                <>
                    <div className={`ability${selectedAction === ACTION_TYPE_ATTACK ? ' selected' : ''}`}>
                        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                        <button 
                            title="Attack a enemy" 
                            onClick={() => {
                                setActionType(ACTION_TYPE_ATTACK);
                                setActionArea("ONE");
                                setActionTarget("ANY");
                                setSelectedAction(ACTION_TYPE_ATTACK);

                                if (targets.length > 1) {
                                    setTargets([]);
                                }
                            }}
                        >
                            Attack
                        </button>
                    </div>
                    <div>
                        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                        <button title="Use an ability" onClick={() => setTurnState(SELECT_ABILITY)}>
                            Ability
                        </button>
                    </div>
                    <div>
                        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                        <button title="Use an item" onClick={() => setTurnState(SELECT_ITEM)}>
                            Item
                        </button>
                    </div>
                    <div>
                        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                        <button title="Open test menu" onClick={() => setTurnState(TEST_MENU)}>
                            Test Menu
                        </button>
                    </div>
                </>
            );
            break;
        case SELECT_ABILITY:
            component = (
                <>
                    <button onClick={() => setTurnState(SELECT_ACTION)}>
                        &lt;- Back
                    </button>
                    {Object.keys(playerData?.abilities).map((key) => (
                        <div className={`ability${actionType === ACTION_TYPE_ABILITY && selectedAction === key ? ' selected' : ''}`}>
                            <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                            <button
                                title={playerData?.abilities[key].description}
                                onClick={() => {
                                    if (actionTarget !== playerData?.abilities[key].target && playerData?.abilities[key].target !== "ANY") {
                                        setTargets([]);
                                    }

                                    setActionType(ACTION_TYPE_ABILITY);
                                    setActionTarget(playerData?.abilities[key].target);
                                    setActionArea(playerData?.abilities[key].area);
                                    setSelectedAction(key);

                                    if (playerData?.abilities[key].area !== "ALL" && targets.length > 1) {
                                        setTargets([]);
                                    }

                                    if (playerData?.abilities[key].target === "ENEMY" && playerData?.abilities[key].area === "ALL") {
                                        setTargets(Object.keys(dungeon?.monsters));
                                    } else if (playerData?.abilities[key].target === "CHAT" && playerData?.abilities[key].area === "ALL") {
                                        setTargets(Object.keys(dungeon?.players));
                                    }
                                }}
                                onMouseOver={() => {
                                    setAbilityHover(playerData?.abilities[key]);
                                }}
                                onMouseOut={() => {
                                    setAbilityHover(null);
                                }}
                            >
                                {playerData?.abilities[key].name}
                            </button>
                        </div>
                    ))}
                </>
            );
            break;
        case SELECT_ITEM:
            component = (
                <>
                    <button onClick={() => setTurnState(SELECT_ACTION)}>
                        &lt;- Back
                    </button>
                    {playerData?.inventory
                        .filter(({ type }) => type === 'consumable')
                        .map(({ name, use, description }) => (
                            <>
                                <div>
                                    <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                                    <button 
                                        onClick={() => {
                                            setActionType(ACTION_TYPE_ITEM);
                                            setSelectedAction(name);
                                        }}
                                        onMouseOver={() => {
                                            setAbilityHover({
                                                ...gameContext.abilityTable[use],
                                                name,
                                                description
                                            });
                                        }}
                                        onMouseOut={() => {
                                            setAbilityHover(null);
                                        }}
                                    >
                                        {name}
                                    </button>
                                </div>
                            </>
                    ))}
                </>
            );
            break;
        case TEST_MENU:
            component = (
                <>
                    <button onClick={() => setTurnState(SELECT_ACTION)}>
                        &lt;- Back
                    </button>
                    {Object.keys(gameContext?.monsterTable)
                        .map((key) => (
                            <>
                                <div>
                                    <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                                    <button 
                                        onClick={() => {
                                            spawnMonster(key);
                                        }}
                                        onMouseOver={() => {
                                            setMonsterHover(gameContext?.monsterTable[key]);
                                        }}
                                        onMouseOut={() => {
                                            setMonsterHover(null);
                                        }}
                                    >
                                        Spawn {gameContext?.monsterTable[key].name}
                                    </button>
                                </div>
                            </>
                    ))}
                </>
            );
            break;
        default:
            component = <></>;
            break;
    }

    let playerPanel;
    if (abilityHover) {
        playerPanel = (
            <div style={{fontSize: "1.0rem", margin: "0px"}}>
                <h2 style={{fontSize: "1.2rem", margin: "0px"}}>{abilityHover.name}</h2>
                <hr />
                <div style={{fontStyle: "italic", marginLeft: "5px"}}>{abilityHover.description}</div>
                <br />
                <div style={{marginLeft: "5px"}}>Effect: {getAbilityText(abilityHover)}</div>
                <div style={{marginLeft: "5px"}}>Cost: {abilityHover.ap}AP</div>
            </div>
        )
    } else if (monsterHover) {
        let rarity = [];
        for (let i = 0; i < 10; i++) {
            let color = colors[Math.floor(i/2)];
            if (i < Math.ceil(monsterHover.rarity/2)) {
                rarity.push(<span style={{color, WebkitTextStrokeColor: "white", WebkitTextStrokeWidth: "1px"}}>&#9733;</span>);    
            } else {
                rarity.push(<span style={{color: "black", WebkitTextStrokeColor: "white", WebkitTextStrokeWidth: "1px"}}>&#9733;</span>);
            }
        }
        playerPanel = (
            <div style={{fontSize: "1.0rem"}}>
                <h2 style={{fontSize: "1.2rem", margin: "0px"}}>{monsterHover.name}</h2>
                <hr />
                <div style={{fontStyle: "italic", marginLeft: "5px"}}>{monsterHover.description}</div>
                <br />
                <div>
                    <div>HP: {monsterHover.hp}/{monsterHover.maxHp}</div>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>
                        <div>STR: {monsterHover.str}</div>
                        <div>DEX: {monsterHover.dex}</div>
                        <div>INT: {monsterHover.int}</div>
                        <div>HIT: {monsterHover.hit}</div>
                        <div>DMG: {monsterHover.dmg}</div>
                        <div>AC: {monsterHover.ac}</div>
                    </div>
                    <div>Rarity: {rarity}</div>
                </div>
            </div>
        )
    } else {
        playerPanel = (
            <div style={{fontSize: "1.0rem"}}>
                <h2 style={{fontSize: "1.2rem", margin: "0px"}}>Friendlies</h2>
                {Object.keys(dungeon?.players ?? {}).map((key) => (
                    <div className={`player${targets.includes(key) ? ' selected' : ''}`}>
                        <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                        <button 
                            onClick={() => {
                                if (actionTarget === "ENEMY") {
                                    setSelectedAction(null);
                                    setActionArea(null);
                                    setActionTarget(null);
                                    setTargets([key]);
                                    return;
                                }

                                setTargets([key]);

                                if (actionArea === "ALL") {
                                    setTargets([...dungeon?.players]);
                                }
                            }}
                        >
                            {dungeon?.players?.[key]?.name}
                        </button>
                        <div>
                            HP: {Math.min(dungeon?.players?.[key]?.hp, dungeon?.players?.[key]?.maxHp)}/{dungeon?.players?.[key]?.maxHp} AP:{dungeon?.players?.[key]?.ap}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div id="page-container">
            <div id="main">
                <div id="top-panel">
                    <div style={{position: "absolute", height: "100%", width: "100%", top: "0px", left: "0px"}}>
                        <img id="background-front" alt="background" src={`${process.env.PUBLIC_URL}/Grassland-front.png`} />
                        <img id="background-back" alt="background" src={`${process.env.PUBLIC_URL}/Grassland-back.png`} />
                    </div>
                    <div id="monsters">
                        {Object.keys(dungeon?.monsters ?? {}).map((key) => (
                            <button 
                                className={`monster${targets.includes(key) ? ' selected' : ''}`} 
                                onClick={() => {
                                    if (actionTarget === "CHAT") {
                                        setSelectedAction(null);
                                        setActionArea(null);
                                        setActionTarget(null);
                                        setTargets([key]);
                                        return;
                                    }

                                    if (actionArea === "ALL") {
                                        setTargets(Object.keys(dungeon?.monsters || {}));
                                    } else { 
                                        setTargets([key]);
                                    }
                                }}
                                onMouseOver={() => {
                                    setMonsterHover(dungeon?.monsters[key]);
                                }}
                                onMouseOut={() => {
                                    setMonsterHover(null);
                                }}
                            >
                                <img className="enemy-arrow" alt="enemy selection arrow" src={`${process.env.PUBLIC_URL}/green-down-arrow.png`} />
                                <img className="enemy-image" alt="enemy" src={dungeon?.monsters?.[key]?.imageUrl || `${process.env.PUBLIC_URL}/slime.webp`} />
                                <div style={{color: "white", fontWeight: "bolder"}}>{dungeon?.monsters?.[key]?.name} {dungeon?.monsters?.[key]?.hp}/{dungeon?.monsters?.[key]?.maxHp}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div id="player">
                    <div id="actions-menu">
                        {component}
                    </div>
                    <div id="player-stats">
                        {playerPanel}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameRoute;
