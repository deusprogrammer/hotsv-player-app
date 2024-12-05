import { useEffect } from "react"
import { ATTACKER, DEFENDER } from "../utils";

export const useEventListener = (key, callback) => {
    useEffect(() => {
        console.log("USE EVENT LISTENER STARTED FOR KEY " + key);
        window.addEventListener(`${key}-game-event`, callback);
        return () => {
            window.removeEventListener(`${key}-game-event`, callback);
        }
    }, [key, callback]);
}

export const sendEvent = (key, data) => {
    console.log("SEND EVENT FOR " + key + " " + JSON.stringify(data, null, 5));
    let event = new Event(`${key}-game-event`);
    event.data = data;
    event.actionType = key === data.actor ? ATTACKER : DEFENDER;
    dispatchEvent(event);
}