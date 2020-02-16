var request = require("request").defaults({ jar: true });
const btoa = require('btoa');
const cheerio = require('cheerio');

let loginApi = (cookieJar,b64) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Authorization":`Basic ${b64}`,
					"Accept-Language": "en-US,en;q=0.9",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'http://portal.unifoa.edu.br/Mobile/SagresApi/eu?redirecionar=false',
			}, (error, response, body) => error || (JSON.parse(body).responseStatus) ? reject(error):resolve(JSON.parse(body)['$link']['href'].split('/')[3]))
		}catch(err){
			reject(err);
		}
	});
}


let getPeriodosLetivos = (cookieJar,b64,userId) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Authorization":`Basic ${b64}`,
					"Accept-Language": "en-US,en;q=0.9",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:`http://portal.unifoa.edu.br/Mobile/SagresApi/diario/periodos-letivos?idPessoa=${userId}&perfil=1&campos=itens(id%2Ccodigo%2Cdescricao)&quantidade=0`,
			}, (error, response, body) => error ? reject(error):resolve(JSON.parse(body)['itens'][0].id))
		}catch(err){
			reject(err);
		}
	});
}

let getMaterias = (cookieJar,b64,userId,periodoAtual) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Authorization":`Basic ${b64}`,
					"Accept-Language": "en-US,en;q=0.9",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:`http://portal.unifoa.edu.br/Mobile/SagresApi/diario/periodos-letivos/${periodoAtual}?idPessoa=${userId}&perfil=1&quantidade=0&embutir=turmas(itens(resultado%2Cclasses%2CatividadeCurricular%2CultimaAula%2CproximaAula%2Cavaliacoes(itens(avaliacoes(itens(nota))))%2CperiodoLetivo(codigo)))&campos=codigo%2Cturmas(itens(id%2ClimiteFaltas%2Cresultado(-%24link)%2Cclasses(itens(id%2Cdescricao%2Ctipo))%2CatividadeCurricular(nome%2Ccodigo%2CcargaHoraria)%2CultimaAula(data)%2CproximaAula(data)%2Cavaliacoes(itens(nome%2CnomeResumido%2Cnota%2Cavaliacoes(itens(ordinal%2CnomeResumido%2Cdata%2Cpeso%2Cnota(valor)))))%2CperiodoLetivo(codigo)))`,
			}, (error, response, body) => error ? reject(error):resolve(JSON.parse(body)))
		}catch(err){
			reject(err);
		}
	});
}


let getStatusMateria = (cookieJar,b64,userId,turmaId) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Authorization":`Basic ${b64}`,
					"Accept-Language": "en-US,en;q=0.9",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:`http://portal.unifoa.edu.br/Mobile/SagresApi/diario/turmas/${turmaId}?idPessoa=${userId}&perfil=1&embutir=classes(itens(aulas(itens(materiaisApoio))%2Cprofessores(itens(pessoa))%2Calocacoes(itens(horario))))%2Cultimaaula%2CatividadeCurricular(departamento)%2Cresultado%2CperiodoLetivo&campos=id%2Cresultado(-%24link)%2ClimiteFaltas%2Cclasses(itens(id%2Cdescricao%2Ctipo%2Cprofessores(itens(pessoa(nome)))%2Calocacoes%2Caulas(proximaPagina%2Citens(planoAula%2Cordinal%2Cdata%2Csituacao%2Cassunto%2CmateriaisApoio%2Ctarefa))))%2CatividadeCurricular(codigo%2Cnome%2CcargaHoraria%2Cdepartamento)%2CultimaAula(data)%2CproximaAula(data)%2CperiodoLetivo(codigo%2Cdescricao%2CinicioAulas%2CfimAulas)`,
			}, (error, response, body) => error ? reject(error):resolve(JSON.parse(body)))
		}catch(err){
			reject(err);
		}
	});
}

let start = (login,senha) => {
	return new Promise( async (resolve,reject) =>{
		try{
			let promises = []
			let cookieJar = request.jar();
			let b64 = await btoa(`${login}:${senha}`);
			let userId = await loginApi(cookieJar,b64);
			let periodoAtual = await getPeriodosLetivos(cookieJar,b64,userId);
			let materias = await getMaterias(cookieJar,b64,userId,periodoAtual)
			await (materias.turmas.itens).map( turma => promises.push(getStatusMateria(cookieJar,b64,userId,turma.id)));
			let response = await Promise.all(promises);
			let responseAll = await response.map(classe =>{
				/* Não estão sendo retornados (Aguardando Primera Nota para analisar API) */
				let media = classe.resultado.media ? classe.resultado.media.trim() : "" ; // (Media Geral => 9.8 ... 5.3 ...)
				let ResultadoDescricao =  classe.resultado.descricao ? classe.resultado.descricao : ""; // ( descricao do resultado => Aprovado ; Aprovado com Exame Final ; )
				let aprovadoBoolean = classe.resultado.aprovado ? classe.resultado.aprovado : ""; // Aprovado => True / False 
				/* Não estão sendo retornados (Aguardando Primera Nota para analisar API) */
				let materia = (classe.atividadeCurricular.nome).trim() || "";
				let codMateria = (classe.atividadeCurricular.codigo).trim() || "";
				let limiteFaltas = classe.limiteFaltas || "";
				let suasFaltas = classe.resultado.totalFaltas || "";
				let nextPage = classe.classes.itens[0].aulas.proximaPagina ? classe.classes.itens[0].aulas.proximaPagina['$link']['href'] : "" ;
				let materialApoio = classe.classes.itens[0].aulas.itens || "";
				let diaSemana = classe.classes.itens[0].alocacoes.itens[0] ? classe.classes.itens[0].alocacoes.itens[0].horario.dia : "";
				let horarioInicio = classe.classes.itens[0].alocacoes.itens[0] ? classe.classes.itens[0].alocacoes.itens[0].horario.inicio : "";
				let horarioFim = classe.classes.itens[0].alocacoes.itens[0] ? classe.classes.itens[0].alocacoes.itens[0].horario.fim : "";
				let materaisDeApoio = materialApoio.map(material =>{  return { assunto:material.assunto, data:material.data, apoio:material.materiaisApoio.itens }}).filter( a => (a.apoio).length > 0 );
				return { materia, codMateria, limiteFaltas, suasFaltas, nextPage, diaSemana, horarioInicio, horarioFim, materaisDeApoio }
			})
			resolve(responseAll);
		}catch(err){
			await reject(err);
		}
		
	})
}

module.exports = { start }
