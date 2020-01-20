// const paht = '/run/user/1000/gvfs/smb-share:server=10.2.192.201,share=medidas%20drx%20panalytical/2019/';
const path = 'C:\\wamp64\\www\\scan\\medidas\\';

// Import the module
var readdirp = require('readdirp');
var fs = require('fs');
const parser= require('xml2json-light');
let i=0
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'slrx',
        port: '3306'
    }
})
 
var settings = {
  //pasta que vai ser listada os arquivos
    root: 'C:\\wamp64\\www\\scan\\medidas\\',
    entryType: 'files',
    //filtrando apenas arquivos de extensão jsp
    fileFilter: [ '*.xrdml' ],
};
 
var allFilePaths = [];
var NullUp = []
var NotNullUp = []
// Iterate recursively through a folder
readdirp(path,settings)
    .on('data', function (entry) {
        // executa toda que vez um arquivo e encontrado no diretório e adiciona ao array
        
        
        fs.readFile(entry.fullPath, 'utf-8', (err, data) => {
            let name_file = data;
            let currentFile = parser.xml2json(data)
            //Pega o nome
            let name = currentFile.xrdMeasurements.sample.name

            const query = 'SELECT name, download, status FROM solicitations WHERE name = "'+name+'"'
            knex.raw(query).then(function (results) {
                const result = JSON.parse(JSON.stringify(results))[0];
                i++
                if (result.length != 0) {
                    if (result[0].status <= 5) {
                        NullUp.push(        	
                            //pega o caminho do arquivo
                             name+' - '+entry.basename + ('\n')
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
                             name+' - '+entry.basename + ('\n')
                          );
                          fs.writeFile('amostras_com_upload_mas_nao_autorizadas.txt', NotNullUp ,function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("O arquivo foi salvo!");
                        });
                    }
                    console.log(i, result)
				}else{
                    allFilePaths.push(        	
                        //pega o caminho do arquivo
                         name+' - '+entry.basename + ('\n')
                      );
                        fs.writeFile('amostras_nao_encontradas.txt', allFilePaths ,function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log("O arquivo foi salvo!");
                        });
                }
            })
        })
    })
