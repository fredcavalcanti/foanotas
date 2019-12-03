const { start } = require('../modulos/UnifoaGetData');

let getData = async (req,res,next) => {
	let { usuario , senha } = req.body;
	if(usuario && senha){
		start(usuario,senha)
		.then(resultado => res.status(200).send(resultado))
		.catch(err => res.status(500).json({msg:'Error Interno'}));
	}else{
		res.status(404).json({msg:'Parametros Faltando'})
	}
}

module.exports = { getData }