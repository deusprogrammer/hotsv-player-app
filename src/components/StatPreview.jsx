const StatPreview = ({name, value}) => {
    let marker = null;
    if (value > 0) {
        marker = <span className="text-green-400 font-green-outline">▲</span>;
    } else if (value < 0) {
        marker = <span className="text-red-600 font-red-outline">▼</span>;
    }

    if (!marker) {
        return null;
    }

    return <div>{name}{marker}</div>
}

export default StatPreview;