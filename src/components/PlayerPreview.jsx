import { useCallback } from "react";
import { ATTACKER, createBuffMap, DEFENDER } from "../utils";
import Gauge from "./Gauge";
import StatPreview from "./StatPreview";
import { useEventListener } from "../hooks/EventHooks";

const PlayerPreview = ({dungeon, name}) => {
    const onEvent = useCallback((event) => {
        switch(event.actionType) {
            case ATTACKER:
                console.log(`You attacked`);
                break;
            case DEFENDER:
                console.log(`You were attacked`);
                break;
            default:
                break;
        }
    }, []);
    useEventListener(name, onEvent);

    if (!dungeon) {
        return null;
    }

    const player = dungeon?.players[name];
    const buffTable = createBuffMap(player);
    return (
        <>
            <h2 style={{fontSize: "1.2rem", margin: "0px"}}>{player?.name}</h2>
            <hr />
            <div className="flex flex-col ml-4">
                <div className="flex flex-row gap-2 items-center">
                    <div>HP: {player?.hp}/{player?.maxHp}</div>
                    <div>AP: {player?.ap}</div>
                    <div></div>
                    <Gauge 
                        current={player?.dex - (dungeon?.cooldowns[player?.name] || 0)} 
                        max={player?.dex}
                        width={250} 
                    />
                </div>
                <div className="flex flex-row gap-2">
                    <div>Buffs:</div>
                    <StatPreview name="STR" value={buffTable?.str} />
                    <StatPreview name="DEX" value={buffTable?.dex} />
                    <StatPreview name="INT" value={buffTable?.int} />
                    <StatPreview name="HIT" value={buffTable?.hit} />
                    <StatPreview name="AC"  value={buffTable?.ac} />
                </div>
            </div>
        </>
    );
};

export default PlayerPreview;