import React from 'react';

import '../styles/suggestionBox.css';

const withLeadingZero = number => number < 10 ? `0${number}` : String(number);

const SuggestionBox = ({show, mode, onChoose, referenceHour}) => {
    let valueList = [];
    if (mode === 'minutes') {
        valueList = [0, 15, 30, 45];
    } else {
        for (let r = referenceHour - 2; r <= referenceHour + 2; r++) {
            valueList.push(String(r));
        }
    }
    if (!show) {
        return null;
    }
    const actionCall = value => () =>
        onChoose(withLeadingZero(value));
    return (
        <ul className={`suggestion-box ${mode}`}>
            {valueList.map(value => 
                <li key={value}>
                    <a onClick={actionCall(value)}>
                        {withLeadingZero(value)}
                    </a>
                </li>)
            }
        </ul>
    );
}

export default SuggestionBox;