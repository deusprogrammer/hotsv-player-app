import React, { useCallback, useEffect, useRef, useState } from 'react';

const AnnounceBox = ({texts, timeout}) => {
    const [text, setText] = useState();
    const indexRef = useRef();
    const textsRef = useRef();
    const isIdleRef = useRef();

    const updateText = useCallback(() => {
        if (indexRef.current < textsRef.current?.length) {
            let nextText = textsRef.current[indexRef.current++];

            if (typeof nextText === "string") {
                setText(nextText);
            } else {
                console.log(JSON.stringify(nextText));
            }
            setTimeout(updateText, timeout);
        } else {
            setText(null);
            isIdleRef.current = true;
        }
    }, [timeout]);

    useEffect(() => {
        if (texts.length > 0) {
            textsRef.current = texts;
            if (isIdleRef.current) {
                isIdleRef.current = false;
                updateText();
            }
        }
    }, [texts, timeout, updateText]);

    useEffect(() => {
        indexRef.current = 0;
        textsRef.current = [];
        isIdleRef.current = true;
    }, [timeout]);

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