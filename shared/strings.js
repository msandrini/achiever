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
	clearCliKeywords: [
		'clear', 'clean', 'reset', 'apaga'
	],
	multipleCliKeywords: [
		'multi', 'multiplos', 'varios'
	],
	sendCallFeedbacks: {
		error: 'Erro ao executar api call para inserir horas:',
		success: 'Api call para inserir horas executada com sucesso!'
	},
	thisTime: 'esta hora',
	hoursLabouredOnThisDay: 'Horas trabalhadas no dia: ',
	remainingHoursOnWeek: 'Saldo de horas na semana:',
	storedSuccessfully: 'gravada com sucesso',
	morningPeriod: 'Período da manhã',
	afternoonPeriod: 'Período da tarde',
	total: 'Total',
	send: 'Enviar',
	ok: 'OK',
	cancel: 'Cancelar',
	yes: 'Sim',
	no: 'Não',
	noTimesProvided: 'nenhuma hora foi fornecida',
	otherTimesIgnored: 'as outras horas fornecidas foram ignoradas',
	timesFlushed: 'As entradas de tempo foram apagadas',
	cannotInsertDisconnectedTime: ' não pode ser inserida sem o(s) horário(s) anterior(es)',
	markConfirm: 'Quer marcar agora a',
	markNow: 'Marcar agora a',
	timeSentToday: 'As horas de hoje já foram enviadas',
	clearConfirm: 'Quer mesmo apagar o arquivo temporário de horas pra hoje?',
	cliConfirmationAllowed: 'Digite "s" ou "n"',
	cancelled: 'Cancelado',
	todayPage: 'Horas de hoje',
	editPage: 'Editar horários',
	dateBeingEdited: 'Dia sendo editado',
	todayDate: 'Dia de hoje',
	login: 'Entrada',
	logout: 'Sair',
	logoutConfirm: 'Quer mesmo sair do sistema?',
	username: 'Usuário',
	password: 'Senha',
	authenticationError: 'Credenciais inválidas.',
	pageNotFound: 'Página não encontrada',
	pageLoading: 'Carregando...',
	confirmSave: 'Existem alterações não salvas. Deseja enviar?',
	invalidTime: 'Horários inválidos',
	invalidAddTime: 'Não é possível marcar presença em um horário anterior',
	submitTimeSuccess: 'Horas registradas com sucesso!',
	goBack: 'Voltar',
	helloName: 'Olá ',
	warning: 'Atenção',
	confirmation: 'Confirmação',
	projectPhase: 'Projeto / Fase',
	activity: 'Atividade'
};

module.exports = strings;
