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
const SELECT_TARGET = "SELECT_TARGET";

const ACTION_TYPE_ATTACK = "ATTACK";
const ACTION_TYPE_ABILITY = "ABILITY";
const ACTION_TYPE_ITEM = "ITEM";

const GameRoute = () => {
    const [jwt, setJwt] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [gameContext, setGameContext] = useState({});
    const [dungeon, setDungeon] = useState(null);
    const [target, setTarget] = useState('');
    const {channelId} = useParams();

    const [actionType, setActionType] = useState();
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
                    target,
                    jwtToken: jwt,
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
                    target,
                    argument: ability,
                },
                jwtToken: jwt,
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
                jwtToken: jwt,
            })
        );
    };

    const handleCommand = (targetType, target) => {

    }

    const connect = (jwt) => {
        const ws = new W3CWebSocket(config.WS_URL);

        //Register battle panel
        ws.onopen = () => {
            console.log('WEB SOCKET OPENED');
            ws.send(
                JSON.stringify({
                    event: 'JOIN',
                    userType: 'PLAYER',
                    channelId,
                    jwtToken: jwt,
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
                    <button title="Attack a enemy" onClick={() => {
                        setActionType(ACTION_TYPE_ATTACK);
                        setSelectedAction(ACTION_TYPE_ATTACK);
                    }}>
                        Attack
                    </button>
                    <button title="Use an ability" onClick={() => setTurnState(SELECT_ABILITY)}>
                        Ability
                    </button>
                    <button title="Use an item" onClick={() => setTurnState(SELECT_ITEM)}>
                        Item
                    </button>
                    <button>Defend</button>
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
                        <button
                            title={playerData?.abilities[key].description}
                            onClick={() => {
                                setActionType(ACTION_TYPE_ABILITY);
                                setSelectedAction(key);
                            }}
                        >
                            {playerData?.abilities[key].name}
                        </button>
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
                                <button onClick={() => {
                                    setActionType(ACTION_TYPE_ITEM);
                                    setSelectedAction(name);
                                }}>{name}</button>
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
        // <div>
        //     <h2>Test Options</h2>
        //     <div
        //         style={{
        //             display: 'flex',
        //             flexDirection: 'column',
        //             width: '200px',
        //             marginLeft: '10px',
        //         }}
        //     >
        //         <button onClick={() => spawnMonster('GORIYA')}>
        //             Spawn Goriya
        //         </button>
        //     </div>
        // </div>
        <div id="page-container">
            <div id="main">
                <div id="monsters">
                    {Object.keys(dungeon?.monsters ?? {}).map((key) => (
                        <button className="monster" onClick={() => {handleCommand("ENEMY", key)}} disabled={!selectedAction || !actionType}>
                            {dungeon?.monsters?.[key]?.name} {dungeon?.monsters?.[key]?.hp}/{dungeon?.monsters?.[key]?.maxHp}
                        </button>
                    ))}
                </div>
                <div id="player">
                    <div id="actions-menu">
                        {component}
                    </div>
                    <div id="player-stats">
                        {Object.keys(dungeon?.players ?? {}).map((key) => (
                            <button onClick={() => {handleCommand("PLAYER", key)}}>{dungeon?.players?.[key]?.name} {Math.min(dungeon?.players?.[key]?.hp, dungeon?.players?.[key]?.maxHp)}/{dungeon?.players?.[key]?.maxHp}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameRoute;
