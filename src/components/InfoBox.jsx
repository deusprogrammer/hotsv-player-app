import React, { useEffect } from 'react';

const InfoBox = ({text, id, timeout}) => {
    useEffect(() => {
        if (timeout) {
            setTimeout(() => {
                let event = new Event("info-box-close");
                event.id = id;
                dispatchEvent(event);
            }, timeout);
        }
    }, []);

    return (
        <div className="info-box">
            {text}
        </div>
    );
}

export default InfoBox;