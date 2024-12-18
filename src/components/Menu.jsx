import React, { useState } from 'react';

const SELECT_ACTION = "START";
const SELECT_ABILITY = "SELECT_ABILITY";
const SELECT_ITEM = "SELECT_ITEM";
const TEST_MENU = "TEST_MENU";

const ACTION_TYPE_ATTACK = "ATTACK";

const MainMenu = ({selectedAction, onActionSelect, onSubMenuOpen}) => (
    <>
        <div className={`ability${selectedAction === ACTION_TYPE_ATTACK ? ' selected' : ''}`}>
            <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
            <button 
                title="Attack a enemy" 
                onClick={() => onActionSelect(ACTION_TYPE_ATTACK, 
                    {
                        id: "ATTACK",
                        target: "ANY",
                        area: "ONE"
                    }
                )}
            >
                Attack
            </button>
        </div>
        <div>
            <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
            <button title="Use an ability" onClick={() => onSubMenuOpen(SELECT_ABILITY)}>
                Ability
            </button>
        </div>
        <div>
            <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
            <button title="Use an item" onClick={() => onSubMenuOpen(SELECT_ITEM)}>
                Item
            </button>
        </div>
        <div>
            <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
            <button title="Open test menu" onClick={() => onSubMenuOpen(TEST_MENU)}>
                Test Menu
            </button>
        </div>
    </>
);

const AbilityMenu = ({abilities, selectedAction, onActionSelect, onBack, onHover}) => (
    <>
        <button onClick={onBack}>
            &lt;- Back
        </button>
        {Object.keys(abilities).map((key) => (
            <div key={key} className={`ability${selectedAction === key ? ' selected' : ''}`}>
                <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                <button
                    title={abilities[key].description}
                    onClick={() => {
                        onActionSelect("ABILITY", abilities[key]);
                    }}
                    onMouseOver={() => {
                        onHover("ABILITY", abilities[key]);
                    }}
                    onMouseOut={() => {
                        onHover("ABILITY", null);
                    }}
                >
                    {abilities[key].name}
                </button>
            </div>
        ))}
    </>
);

const ItemMenu = ({items, gameContext, selectedAction, onActionSelect, onBack, onHover}) => (
    <>
        <button onClick={onBack}>
            &lt;- Back
        </button>
        {items
            .filter(({ type }) => type === 'consumable')
            .map(({ id, name, use, description }) => (
                <div key={id} className={`ability${selectedAction === id ? ' selected' : ''}`}>
                    <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                    <button 
                        onClick={() => {
                            onActionSelect("ITEM", gameContext.itemTable[id]);
                        }}
                        onMouseOver={() => {
                            onHover("ABILITY", {
                                ...gameContext.abilityTable[use],
                                name,
                                description
                            });
                        }}
                        onMouseOut={() => {
                            onHover("ABILITY", null);
                        }}
                    >
                        {name}
                    </button>
                </div>
        ))}
    </>
);

const TestMenu = ({gameContext, onBack, onHover, onTestMenuAction}) => (
    <>
        <button onClick={onBack}>
            &lt;- Back
        </button>
        {Object.keys(gameContext?.monsterTable)
            .map((key) => (
                <div key={key}>
                    <img alt="finger" src={`${process.env.PUBLIC_URL}/finger.png`} />
                    <button 
                        onClick={() => {
                            onTestMenuAction("SPAWN", key);
                        }}
                        onMouseOver={() => onHover("MONSTER", gameContext?.monsterTable[key])}
                        onMouseOut={() => onHover("MONSTER", null)}
                    >
                        Spawn {gameContext?.monsterTable[key].name}
                    </button>
                </div>
        ))}
    </>
);

const ConfirmationMenu = ({confirmationText, onConfirm, onCancel}) => (
    <>
        <h2 style={{color: "white", fontSize: "1.2rem", margin: "0px"}}>Confirm Action</h2>
        <div style={{color: "white", marginLeft: "5px"}}>{confirmationText}</div>
        <button onClick={onConfirm}>Confirm</button><button onClick={onCancel}>Cancel</button>
    </>
)

const Menu = ({player, targets, confirmationText, gameContext, selectedAction, onActionSelect, onTestMenuAction, onHover, onConfirm}) => {
    const [menuState, setMenuState] = useState(SELECT_ACTION);

    const onBack = () => {
        setMenuState(SELECT_ACTION);
        onActionSelect(null, null);
    }

    const onSubMenuOpen = (subMenu) => {
        setMenuState(subMenu);
        onActionSelect(null, null);
    }

    const onConfirmAction = () => {
        setMenuState(SELECT_ACTION);
        onActionSelect(null, null);
        onConfirm();
    }

    const readyToConfirm = selectedAction && targets.length > 0;
    if (readyToConfirm) {
        return (
            <ConfirmationMenu 
                confirmationText={confirmationText}
                onConfirm={onConfirmAction}
                onCancel={onBack}
            />
        );
    }

    switch(menuState) {
        case SELECT_ACTION:
            return <MainMenu selectedAction={selectedAction} onActionSelect={onActionSelect} onSubMenuOpen={onSubMenuOpen} />
        case SELECT_ABILITY:
            return <AbilityMenu abilities={player.abilities} selectedAction={selectedAction} onActionSelect={onActionSelect} onBack={onBack} onHover={onHover} />
        case SELECT_ITEM:
            return <ItemMenu items={player.inventory} gameContext={gameContext} selectedAction={selectedAction} onActionSelect={onActionSelect} onBack={onBack} onHover={onHover} />
        case TEST_MENU:
            return <TestMenu gameContext={gameContext} onTestMenuAction={onTestMenuAction} onBack={onBack} onHover={onHover} />
        default:
            return <></>;
    }
}

export default Menu;