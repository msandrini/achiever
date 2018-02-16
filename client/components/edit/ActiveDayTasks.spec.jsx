import React from 'react';
import { shallow } from 'enzyme';

import ActiveDayTasks from './ActiveDayTasks';

import strings from '../../../shared/strings';

describe('ActiveDayTasks', () => {
	let onPhaseSelect;
	let onActivitySelect;
	let projectPhasesQuery;
	let selectedActivity;
	let selectedPhase;

	beforeEach(() => {
		projectPhasesQuery = {
			error: false,
			loading: true,
			phases: {
				default: 456,
				options: [
					{
						id: 456,
						name: 'Project Phase Name',
						activities: {
							default: 7,
							options: [
								{
									id: 6,
									name: 'BugFix'
								},
								{
									id: 7,
									name: 'Code/ Document Reviews'
								},
								{
									id: 9,
									name: 'Coding'
								},
								{
									id: 65,
									name: 'Absence / Compensation'
								}
							]
						}
					},
					{
						id: 445,
						name: 'Super cool project that just has bugs!',
						activities: {
							default: 6,
							options: [
								{
									id: 6,
									name: 'BugFix'
								},
								{
									id: 10,
									name: 'Test fix'
								}
							]
						}
					}
				]
			}
		};
		selectedPhase = projectPhasesQuery.phases.options[0];		// eslint-disable-line
		selectedActivity = selectedPhase.activities.options[2];		// eslint-disable-line
		onPhaseSelect = jest.fn((value) => {
			const id = parseInt(value.id, 10);
			selectedPhase = projectPhasesQuery.phases.options.find(option => option.id === id);
		});
		onActivitySelect = jest.fn((value) => {
			const id = parseInt(value, 10);
			selectedActivity = selectedPhase.activities.options.find(option => option.id === id);
		});
	});

	describe('render', () => {
		it('should render two SelectGroups components with min props', (done) => {
			const wrapper = shallow(<ActiveDayTasks
				onPhaseSelect={onPhaseSelect}
				onActivitySelect={onActivitySelect}
				projectPhasesQuery={projectPhasesQuery}
				selectedActivity={selectedActivity}
				selectedPhase={selectedPhase}
			/>);
			expect(wrapper).toMatchSnapshot();

			const wrapperHolliday = shallow(<ActiveDayTasks
				onPhaseSelect={onPhaseSelect}
				onActivitySelect={onActivitySelect}
				projectPhasesQuery={projectPhasesQuery}
				selectedActivity={selectedActivity}
				selectedPhase={selectedPhase}
				isHoliday
			/>);
			expect(wrapperHolliday).toMatchSnapshot();
			done();
		});
		it('should render the name and not a select if only option', (done) => {
			const aloneProjectPhase = {
				error: false,
				loading: false,
				phases: {
					default: 456,
					options: [
						{
							id: 456,
							name: 'Project Phase Name',
							activities: {
								default: 7,
								options: [
									{
										id: 6,
										name: 'BugFix'
									}
								]
							}
						}
					]
				}
			};
			const wrapper = shallow(<ActiveDayTasks
				onPhaseSelect={onPhaseSelect}
				onActivitySelect={onActivitySelect}
				projectPhasesQuery={aloneProjectPhase}
				selectedActivity={selectedActivity}
				selectedPhase={selectedPhase}
			/>);
			expect(wrapper.find('SelectGroup').at(0).prop('showTextInstead'))
				.toEqual('Project Phase Name');
			done();
		});
	});
	describe('onSelect', () => {
		it('should call the props selected function with the selected element', () => {
			const wrapper = shallow(<ActiveDayTasks
				onPhaseSelect={onPhaseSelect}
				onActivitySelect={onActivitySelect}
				projectPhasesQuery={projectPhasesQuery}
				selectedActivity={selectedActivity}
				selectedPhase={selectedPhase}
			/>);
			const projectSelect = wrapper.find('[name="projectPhase"]');
			projectSelect.simulate('change', { id: 445 });

			expect(onPhaseSelect).toHaveBeenCalled();
			expect(selectedPhase).toEqual(projectPhasesQuery.phases.options[1]);

			const activitySelect = wrapper.find('[name="activity"]');
			activitySelect.simulate('change', 10);
			expect(onPhaseSelect).toHaveBeenCalled();
			expect(selectedActivity).toEqual(selectedPhase.activities.options[1]);
		});
	});
});
