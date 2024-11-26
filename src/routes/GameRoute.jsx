import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const config = {
    BASE_URL: 'https://deusprogrammer.com/api/twitch',
    WS_URL: 'ws://localhost:3002',
};

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
            message = <div>{`Cleanses ${ability.buffs}`}</div>;
            break;
        case 'BUFFING':
            message = (
                <div>{`${ability.buffs} for ${ability.buffsDuration} ticks`}</div>
            );
            break;
        case 'HEALING':
            message = (
                <div>{`Heals ${ability.dmg} ${ability.dmgStat} to ${target}.`}</div>
            );
            break;
        default:
            message = (
                <div>{`${ability.dmg} ${ability.element !== 'NONE' ? ability.element.toLowerCase() : ''} ${ability.dmgStat} damage ${ability.procTime > 0 ? ` every ${ability.procTime} ticks for ${ability.maxProcs} ticks` : ''} to ${target}`}</div>
            );
            break;
    }

    return message;
};

const SELECT_ACTION = "START";
const SELECT_ABILITY = "SELECT_ABILITY";
const SELECT_ITEM = "SELECT_ITEM";

const ACTION_TYPE_ATTACK = "ATTACK";
const ACTION_TYPE_ABILITY = "ABILITY";
const ACTION_TYPE_ITEM = "ITEM";

const GameRoute = () => {
    const [jwt, setJwt] = useState('');
    const [playerData, setPlayerData] = useState(null);
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
                        <button title="Attack a enemy" onClick={() => {
                            setActionType(ACTION_TYPE_ATTACK);
                            setActionArea("ONE");
                            setActionTarget("ANY");
                            setSelectedAction(ACTION_TYPE_ATTACK);

                            if (targets.length > 1) {
                                setTargets([]);
                            }
                        }}>
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
                        <button onClick={() => spawnMonster('GORIYA')}>
                            Spawn Goriya
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
                        .map(({ name }) => (
                            <>
                                <div>
                                    <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                                    <button onClick={() => {
                                        setActionType(ACTION_TYPE_ITEM);
                                        setSelectedAction(name);
                                    }}>{name}</button>
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
                            <button className={`monster${targets.includes(key) ? ' selected' : ''}`} onClick={() => {
                                if (actionTarget === "CHAT") {
                                    setSelectedAction(null);
                                    setActionArea(null);
                                    setActionTarget(null);
                                    setTargets([key]);
                                    return;
                                }
                                
                                setTargets([key]);

                                if (actionArea === "ALL") {
                                    setTargets([...dungeon?.monsters]);
                                }
                            }}>
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
                        {Object.keys(dungeon?.players ?? {}).map((key) => (
                            <div className={`player${targets.includes(key) ? ' selected' : ''}`}>
                                <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                                <button onClick={() => {
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
                                }}>{dungeon?.players?.[key]?.name} {Math.min(dungeon?.players?.[key]?.hp, dungeon?.players?.[key]?.maxHp)}/{dungeon?.players?.[key]?.maxHp}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameRoute;
