import React from 'react';

const Gauge = ({current, max, width}) => (
    <div className="relative bg-slate-600 border-2 rounded-xl overflow-hidden" style={{width: `${width}px`, height: "10px"}}>
        <div className="absolute left-0 top-0 h-full bg-white" style={{width: `${(current/max) * width}px`}} />
    </div>
);

export default Gauge;