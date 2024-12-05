export const randomUuid = () => {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
};

export const createBuffMap = (target) => {
    let buffs = target?.buffs || [];
    let buffMap = {
        str: 0,
        dex: 0,
        int: 0,
        hit: 0,
        ac: 0,
    };

    buffs.forEach((buff) => {
        buff.changes.forEach((change) => {
            buffMap[change.stat.toLowerCase()] += change.amount;
        });
    });

    return buffMap;
};