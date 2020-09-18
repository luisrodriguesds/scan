// const path   = '/run/user/1000/gvfs/smb-share:server=10.2.192.201,share=medidas%20drx%20panalytical/2019/';
// const path   = '/var/www/scan/2019/';
const path      = 'C:\\wamp64\\www\\scan\\medidas\\';

// Import the module
var readdirp    = require('readdirp');
var fs          = require('fs');
const parser    = require('xml2json-light');
var mysql       = require('mysql');
var connection  = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'slrx',
  port:3306,
  connectTimeout: 100000
});

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'slrx',
        port: '3306'
    },
    pool: {
        max: 300,
        min: 2,
        // acquireTimeout: 60 * 1000,
        // createTimeoutMillis: 30000,
        // acquireTimeoutMillis: 30000,
        // idleTimeoutMillis: 30000,
        // reapIntervalMillis: 1000,
        // createRetryIntervalMillis: 100,
        propagateCreateError: false // <- default is true, set to false
    },
    // acquireConnectionTimeout: 1000
})

var allFilePaths = [];
var NotFound = [];
var NullUp = []
var NotNullUp = []
var i=0
let files = [];//Vetor para armazenar todos os nomes dos arquivos lidos

//Lendo todos os arquivos existenstes na pasta files de forma síncrona
fs.readdirSync(path).forEach(file => {
	//Efetuando a leitura do arquivo
	fs.readFile(path+file,'utf8', async (err,data) =>{
        //Enviando para o console o resultado da leitura
        let currentFile = parser.xml2json(data)
        let name = currentFile.xrdMeasurements.sample.name
        const query = 'SELECT name, download, status FROM solicitations WHERE name = "'+name+'"'
		console.log(name);
       
        await knex.raw(query).then(function (results) {
            const result = JSON.parse(JSON.stringify(results))[0];
            if (result) {
                if (result.length == 0) {
                    NotFound.push(        	
                        //pega o caminho do arquivo
                        name+' - '+file+ ('\n')
                    );
                        fs.writeFile('amostras_nao_encontradas.txt', NotFound ,function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("O arquivo foi salvo!");
                        });
                }else{
                    if (result[0].status <= 5) {
                        NullUp.push(        	
                            //pega o caminho do arquivo
                                name+' - '+file + ('\n')
                            );
                            fs.writeFile('amostras_sem_upload.txt', NullUp ,function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("O arquivo foi salvo!");
                        });
                    }
                    if (result[0].status == 6) {
                        NotNullUp.push(        	
                            //pega o caminho do arquivo
                                name+' - '+file + ('\n')
                            );
                            fs.writeFile('amostras_com_upload_mas_nao_autorizadas.txt', NotNullUp ,function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("O arquivo foi salvo!");
                        });
                    }
                    i++
                    console.log(i, result[0])
                }
            }else{
                console.log(error)
            }
        })
	});
});
