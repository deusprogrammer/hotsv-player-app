import React, { useEffect, useRef, useState } from 'react';

const AnnounceBox = ({texts, timeout}) => {
    const [text, setText] = useState();
    const indexRef = useRef();
    const textsRef = useRef();

    useEffect(() => {
        if (texts.length > 0) {
            console.log("TEXTS: " + texts.length);
            textsRef.current = texts;
            setText(texts[indexRef.current]);
        }
    }, [texts]);

    useEffect(() => {
        indexRef.current = 0;
        setInterval(() => {
            if (indexRef.current < textsRef.current.length) {
                indexRef.current++;
                setText(textsRef.current[indexRef.current]);
            } else {
                setText(null);
            }
        }, timeout);
    }, []);

    if (!text) {
        return <></>;
    }

    return (
        <div className="info-box">
            {text}
        </div>
    );
}

export default AnnounceBox;