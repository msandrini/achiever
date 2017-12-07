const strings = {
	times: [
		{
			label: 'Entrada',
			cliKeywords: [
				'entrada', 'entrando', 'entrei',
				'chegada', 'chegando', 'cheguei',
				'arrival'
			]
		}, {
			label: 'Ida para almoço',
			cliKeywords: [
				'ida', 'indo',
				'lunch', 'gone-lunch',
				'almoco', 'ida-almoco', 'indo-almoco',
				'fui-almoco', 'partiu-almoco'
			]
		}, {
			label: 'Volta do almoço',
			cliKeywords: [
				'volta', 'voltando', 'voltei',
				'back', 'back-from-lunch',
				'retorno', 'retornando', 'retornei',
				'volta-almoco', 'voltando-almoco', 'voltei-almoco',
				'chegada-almoco', 'chegando-almoco', 'cheguei-almoco'
			]
		}, {
			label: 'Saída',
			cliKeywords: [
				'saida', 'saindo', 'sai',
				'fui', 'fui-casa', 'partiu-casa',
				'leave', 'left', 'gone-home',
				'ida-casa', 'indo-casa'
			]
		}
	],
	thisTime: 'esta hora',
	hoursLabouredOnThisDay: 'Horas trabalhadas no dia: ',
	remainingHoursOnWeek: 'Saldo de horas na semana:',
	storedSuccessfully: 'gravada com sucesso',
	morningPeriod: 'Período da manhã',
	afternoonPeriod: 'Período da tarde',
	total: 'Total',
	send: 'Enviar',
	clearCliKeywords: [
		'clear', 'clean', 'reset', 'apaga'
	],
	multipleCliKeywords: [
		'multi', 'multiplos', 'varios'
	],
	sendCallFeedbacks: {
		error: 'Erro ao executar api call para inserir horas: ',
		success: 'Api call para inserir horas executada com sucesso!'
	},
	noTimesProvided: 'nenhuma hora foi fornecida',
	otherTimesIgnored: 'as outras horas fornecidas foram ignoradas',
	timesFlushed: 'As entradas de tempo foram apagadas',
	imReligious: 'Sou religioso com meus horários'
};

module.exports = strings;
