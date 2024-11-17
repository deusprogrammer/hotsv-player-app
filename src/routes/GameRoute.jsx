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

const GameRoute = () => {
    const [jwt, setJwt] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [gameContext, setGameContext] = useState({});
    const [dungeon, setDungeon] = useState(null);
    const [target, setTarget] = useState('');
    const {channelId} = useParams();
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

    return (
        <div>
            <h2>Player Info</h2>
            <table className="player-info">
                <tbody>
                    <tr>
                        <td>Player Name</td>
                        <td>{playerData?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>HP</td>
                        <td>
                            {playerData?.hp}/{playerData?.maxHp}
                        </td>
                    </tr>
                    <tr>
                        <td>AP</td>
                        <td>{playerData?.ap}</td>
                    </tr>
                </tbody>
            </table>
            <h2>Abilities</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '800px',
                    marginLeft: '10px',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                    }}
                >
                    <button title="Attack a enemy" onClick={attack}>
                        Attack
                    </button>
                    <span>
                        Deal {playerData?.equipment?.hand?.dmg}{' '}
                        {playerData?.equipment?.hand?.dmgStat} damage to a
                        hostile
                    </span>
                </div>
                {Object.keys(playerData?.abilities).map((key) => (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                        }}
                        key={key}
                    >
                        <button
                            title={playerData?.abilities[key].description}
                            onClick={() => {
                                ability(key);
                            }}
                        >
                            {playerData?.abilities[key].name}
                        </button>
                        <span>
                            {getAbilityText(playerData?.abilities[key])}
                        </span>
                    </div>
                ))}
            </div>
            <h2>Items</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '200px',
                    marginLeft: '10px',
                }}
            >
                {playerData?.inventory
                    .filter(({ type }) => type === 'consumable')
                    .map(({ name }) => (
                        <>
                            <button>{name}</button>
                        </>
                    ))}
            </div>
            <h2>Players</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '200px',
                    marginLeft: '10px',
                }}
            >
                {Object.keys(dungeon?.players ?? {}).map((key) => (
                    <div>{dungeon?.players?.[key]?.name} {dungeon?.players?.[key]?.hp}/{dungeon?.players?.[key]?.maxHp}</div>
                ))}
            </div>
            <h2>Monsters</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '200px',
                    marginLeft: '10px',
                }}
            >
                {Object.keys(dungeon?.monsters ?? {}).map((key) => (
                    <button>{dungeon?.monsters?.[key]?.name} {dungeon?.monsters?.[key]?.hp}/{dungeon?.monsters?.[key]?.maxHp}</button>
                ))}
            </div>
            <h2>Test Options</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '200px',
                    marginLeft: '10px',
                }}
            >
                <button onClick={() => spawnMonster('GORIYA')}>
                    Spawn Goriya
                </button>
            </div>
        </div>
    );
};

export default GameRoute;
