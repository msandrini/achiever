import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import TimeGroup from './components/TimeGroup.js';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/main.css';

import strings from './strings';

moment.locale('pt-br');

export default class Main extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            controlDate: moment(),
            labouredHoursOnDay: null,
            remainingHoursOnWeek: null,
            storedTimes: [{}, {}, {}, {}]
        };
        this.onDateChange = this.onDateChange.bind(this);
        this.onTimeSet = this.onTimeSet.bind(this);
    }

    componentWillMount() {
        this._checkPreEnteredValues();
    }

    onDateChange(date) {
        this.setState({
            controlDate: date
        });
        this._checkPreEnteredValues();
    }

    onTimeSet(groupIndex) {
        return (hours, minutes) => {
            let newStoredTimes = this.state.storedTimes;
            newStoredTimes[groupIndex] = { hours, minutes };
            this.setState({
                storedTimes: newStoredTimes
            });
        };
    }

    _checkPreEnteredValues() {
        // check server for pre-entered values
        // populate labouredHoursOnDay and remainingHoursOnWeek
        this.setState({
            storedTimes: [{}, {}, {}, {}]
        });
    }

    _shouldSendBeAvailable() {
        let comparisonTerm = 0;
        const isSequentialTime = time => {
            if (time && time.hours && time.minutes) {
                const date = new Date(2017, 0, 1, time.hours, time.minutes, 0, 0);
                const isLaterThanComparison = date > comparisonTerm;
                comparisonTerm = Number(date);
                console.log(comparisonTerm, date, isLaterThanComparison)
                return isLaterThanComparison;
            }
            return false;
        }

        return this.state.storedTimes.every(isSequentialTime);
    }

    render() {
        const {
            controlDate,
            labouredHoursOnDay,
            remainingHoursOnWeek,
            storedTimes
        } = this.state;

        return (
            <form>
                <h1>{strings.appName}</h1>
                <div className="column">
                    <DatePicker inline
                        selected={this.state.controlDate}
                        onChange={this.onDateChange} />
                    <p className="remaining">
                        {strings.remaining}
                        {' '}
                        <strong>{remainingHoursOnWeek}</strong>
                    </p>
                    { labouredHoursOnDay ? 
                        (
                            <p className="projection">
                                {strings.projection}
                                {' '}
                                <strong>{labouredHoursOnDay}</strong>
                            </p>
                        ) : null
                    }
                </div>
                <div className="column">
                    <h2>{controlDate.format('L')}</h2>
                    <TimeGroup label={strings.labelTime1} emphasis
                        referenceHour={9} time={storedTimes[0]}
                        onSet={this.onTimeSet(0)} />
                    <TimeGroup label={strings.labelTime2}
                        referenceHour={12} time={storedTimes[1]}
                        onSet={this.onTimeSet(1)} />
                    <TimeGroup label={strings.labelTime3}
                        referenceHour={13} time={storedTimes[2]}
                        onSet={this.onTimeSet(2)} />
                    <TimeGroup label={strings.labelTime4} emphasis
                        referenceHour={17} time={storedTimes[3]}
                        onSet={this.onTimeSet(3)} />
                    {this._shouldSendBeAvailable() ? 
                        <button type="submit"
                            className="send">{strings.send}</button> : null
                    }
                </div>
            </form>
            
    );
    }
}