import React from 'react';
// import moment from 'moment';
// import { Link } from 'react-router-dom';

import 'react-datepicker/dist/react-datepicker.css';

import StaticTime from './today/StaticTime';
import strings from '../../shared/strings';

const onMark = (event) => {
	event.preventDefault();
	// trigger storage
};

const _getTime = () => '00:00';

const _shouldMarkBeAvailable = () => true;

const Today = () => (
	<div className="page-wrapper">
		<h2 className="current-date">
			{strings.dateBeingEdited}:{' '}
			<strong>00/00/0000</strong>
		</h2>
		<form onSubmit={e => onMark(e)}>
			<div className="column">
				<div className="time-management-content" />
			</div>
			<div className="column">
				<div className="time-management-content">
					{Array(4).map(index => (
						<StaticTime
							key={index}
							time={_getTime(index)}
						/>
					))}
					<button
						type="submit"
						className="send"
						disabled={!_shouldMarkBeAvailable()}
					>
						{strings.send}
					</button>
				</div>
			</div>
			{ /* <Link to="/edit">Edit</Link> */ }
		</form>
	</div>
);

export default Today;
