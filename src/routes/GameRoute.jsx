import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import AbilityPreview from '../components/AbilityPreview';
import MonsterPreview from '../components/MonsterPreview';
import Menu from '../components/Menu';
import BattleBackground from '../components/BattleBackground';
import Monsters from '../components/Monsters';
import AnnounceBox from '../components/AnnounceBox';
import PlayerMenu from '../components/PlayerMenu';
import PlayerPreview from '../components/PlayerPreview';
import { sendEvent, useEventListener } from '../hooks/EventHooks';
import { useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { DEFENDER } from '../utils';

const config = {
    BASE_URL: 'https://deusprogrammer.com/api/twitch',
    WS_URL: 'ws://localhost:3002',
};

// TODO Create hooks for websockets

const GameRoute = () => {
    const [defending, defendingApi] = useSpring(() => ({
        from: {x:0},
        config: {duration: "100"}
    }));
    const onEvent = useCallback((event) => {
        switch(event.actionType) {
            case DEFENDER:
                defendingApi.start({
                    from: {x: 0},
                    to: [{x: 10},{x:-10},{x:10},{x:-10},{x:0}]
                });
                break;
            default:
                break;
        }
    }, [defendingApi]);

    const {channelId} = useParams();

    const [jwt, setJwt] = useState('');
    const [infoBoxTexts, setInfoBoxTexts] = useState([]);
    const [errors, setErrors] = useState([]);

    const [playerData, setPlayerData] = useState(null);
    const [abilityHover, setAbilityHover] = useState(null);
    const [monsterHover, setMonsterHover] = useState(null);
    const [playerHover, setPlayerHover] = useState(null);
    const [gameContext, setGameContext] = useState({});
    const [dungeon, setDungeon] = useState(null);
    const [targets, setTargets] = useState([]);

    const [actionType, setActionType] = useState();
    const [actionArea, setActionArea] = useState();
    const [actionTarget, setActionTarget] = useState();
    const [targetType, setTargetType] = useState();
    const [selectedAction, setSelectedAction] = useState();

    const websocket = useRef();
    const initialLoad = useRef(true);
    const startingMessageIndex = useRef(0);
    const startingEventIndex = useRef(0);
    const errorsRef = useRef();

    useEventListener(playerData?.name, onEvent);

    const commandMap = {
        ATTACK: (abilty, targets) => {
            let target;
            if (targets.length > 1) {
                target = null;
            } else if (targets.length === 1 && targetType === "MONSTER") {
                target = `~${targets[0]}`;
            }

            websocket.current.send(
                JSON.stringify({
                    event: 'ACTION',
                    userType: 'PLAYER',
                    channelId,
                    action: {
                        type: 'ATTACK',
                        actor: playerData.name,
                        targets: target
                    },
                    jwtToken: jwt
                })
            );
        },
        ABILITY: (ability, targets) => {
            let target;
            if (actionArea === "ALL") {
                target = null;
            } else if (actionArea === "ONE" && targetType === "MONSTER") {
                target = `~${targets[0]}`;
            }

            websocket.current.send(
                JSON.stringify({
                    event: 'ACTION',
                    userType: 'PLAYER',
                    channelId,
                    action: {
                        type: 'USE',
                        actor: playerData.name,
                        targets: target,
                        argument: ability,
                    },
                    jwtToken: jwt
                })
            );
        },
        ITEM: (item, targets) => {
            let target;
            if (actionArea === "ALL") {
                target = null;
            } else if (actionArea === "ONE" && targetType === "MONSTER") {
                target = `~${targets[0]}`;
            }

            websocket.current.send(
                JSON.stringify({
                    event: 'ACTION',
                    userType: 'PLAYER',
                    channelId,
                    action: {
                        type: 'USE',
                        actor: playerData.name,
                        targets: target,
                        argument: `#${item}`,
                    },
                    jwtToken: jwt
                })
            );
        }
    }

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
            const { event, playerData: newPlayerData, gameContext: newGameContext, error, dungeon: newDungeon } = JSON.parse(
                message.data
            );

            switch (event) {
                case 'JOINED':
                    if (newPlayerData) {
                        setPlayerData(newPlayerData);
                    }
                    if (newGameContext) {
                        setGameContext(newGameContext);
                    }
                    break;
                case 'UPDATE':
                    if (!initialLoad.current) {
                        setInfoBoxTexts(newDungeon.messages.slice(startingMessageIndex.current));
                        newDungeon.events.slice(startingEventIndex.current).forEach((event) => {
                            sendEvent(event.actor, event);
                            sendEvent(event.target, event);
                            startingEventIndex.current++;
                        });
                    } else {
                        initialLoad.current = false;
                        startingMessageIndex.current = newDungeon.messages.length;
                        startingEventIndex.current = newDungeon.events.length;
                    }

                    setDungeon(newDungeon);
                    break;
                case 'ERROR':
                    console.error("ERROR: " + error);
                    errorsRef.current.push(error);
                    setErrors([...errorsRef.current]);
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

    const getConfirmationText = () => {
        let verb = "Perform";
        let targetName = "";
        let actionName = "";
    
        if (targets.length > 1) {
            if (targetType === "MONSTER") {
                targetName = "all enemies";
            } else if (targetType === "PLAYER") {
                targetName = "all players";
            }
        } else {
            if (targetType === "MONSTER") {
                targetName = dungeon.monsters[targets[0]]?.name;
            } else if (targetType === "PLAYER") {
                targetName = dungeon.players[targets[0]]?.name;
            }
        }
    
        if (selectedAction === "ATTACK") {
            actionName = "attack";
        } else {
            if (actionType === "ITEM") {
                verb = "Use";
                actionName = gameContext.itemTable[selectedAction]?.name;
            } else if (actionType === "ABILITY") {
                actionName = gameContext.abilityTable[selectedAction]?.name;
            }
        }
    
        let message = `${verb} ${actionName} on ${targetName}?`;
    
        return message;
    }

    const clearTargets = () => {
        setSelectedAction(null);
        setActionArea(null);
        setActionTarget(null);
        setTargets([]);
    }

    const onTargetSelect = (type, target) => {
        if (!selectedAction) {
            return;
        }

        setTargetType(type);
        setTargets([target]);
        if (type === "MONSTER") {
            if (actionTarget === "CHAT") {
                return clearTargets(target);
            }

            if (actionArea === "ALL") {
                setTargets(Object.keys(dungeon?.monsters || {}));
            }
        } else if (type === "PLAYER") {
            if (actionTarget === "ENEMY") {
                return clearTargets(target);
            }

            if (actionArea === "ALL") {
                setTargets(Object.keys(dungeon?.players || {}));
            }
        }
    }

    const performCommand = () => {
        commandMap[actionType](selectedAction, targets);
    }

    useEffect(() => {
        errorsRef.current = [];
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

    let playerPanel;
    if (abilityHover) {
        playerPanel = (
            <AbilityPreview 
                ability={abilityHover} 
            />
        );
    } else if (monsterHover) {
        playerPanel = (
            <MonsterPreview 
                monster={monsterHover} 
            />
        );
    }

    return (
        <div id="page-container">
            <animated.div id="main" style={{...defending}}>
                <div id="top-panel">
                    <div id="top-panel-overlay">
                        <AnnounceBox texts={infoBoxTexts} timeout={2000} />
                        <AnnounceBox texts={errors} timeout={3000} />
                    </div>
                    <BattleBackground foreground="Grassland" background="Grassland" />
                    <Monsters 
                        monsters={dungeon?.monsters}
                        targets={targets}
                        actionArea={actionArea}
                        onSelect={(target) => {onTargetSelect("MONSTER", target)}}
                        onHover={(target) => {setMonsterHover(target)}}
                    />
                </div>
                <div id="player">
                    <div id="actions-menu">
                        <Menu 
                            player={playerData}
                            gameContext={gameContext}
                            selectedAction={selectedAction}
                            targets={targets}
                            confirmationText={getConfirmationText()}
                            onActionSelect={(type, action) => {
                                if (type === null && action === null) {
                                    return clearTargets();
                                }

                                setActionType(type);
                                setActionTarget(action.target);
                                setActionArea(action.area);
                                setSelectedAction(action.id);
                                setTargets([]);
                            }}
                            onHover={(type, element) =>{
                                if (type === "MONSTER") {
                                    setMonsterHover(element);
                                } else if (type === "ABILITY") {
                                    setAbilityHover(element);
                                }
                            }}
                            onTestMenuAction={(command, arg) => {
                                if (command === "SPAWN") {
                                    spawnMonster(arg);
                                }
                            }}
                            onConfirm={performCommand}
                        />
                    </div>
                    <div id="player-stats" className="relative">
                        <PlayerPreview 
                            dungeon={dungeon}
                            name={playerHover || playerData?.name}
                        />
                        <PlayerMenu
                            targets={targets}
                            players={dungeon?.players}
                            actionArea={actionArea}
                            onTargetSelect={(key) => onTargetSelect("PLAYER", key)}
                            onHover={(playerName) => setPlayerHover(playerName)}
                        />
                        {playerPanel}
                    </div>
                </div>
            </animated.div>
        </div>
    );
};

export default GameRoute;
