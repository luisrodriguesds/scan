// const paht   = '/run/user/1000/gvfs/smb-share:server=10.2.192.201,share=medidas%20drx%20panalytical/2019/';
// const paht   = '/var/www/scan/';
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
  database : 'slrx'
});
 
var settings = {
  //pasta que vai ser listada os arquivos
    root: path,
    entryType: 'files',
    //filtrando apenas arquivos de extensão jsp
    fileFilter: [ '*.xrdml' ],
};

var allFilePaths = [];
var NotFound = [];
var NullUp = []
var NotNullUp = []
// Iterate recursively through a folder
readdirp(path,settings)
    .on('data', function (entry) {
        allFilePaths.push(
            entry.fullPath
        );
    }).on('end', function(){
        Promise.all(allFilePaths.map(async (v,i) => {
            fs.readFile(v, 'utf-8', (err, data) => {
                let currentFile = parser.xml2json(data)
                let name = currentFile.xrdMeasurements.sample.name
                const query = 'SELECT name, download, status FROM solicitations WHERE name = "'+name+'"'
                connection.query(query, function (error, results, fields) {
                    if (results.length == 0) {
                        NotFound.push(        	
                            //pega o caminho do arquivo
                             name+' - '+v+ ('\n')
                          );
                            fs.writeFile('amostras_nao_encontradas.txt', NotFound ,function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                console.log("O arquivo foi salvo!");
                            });
                    }else{
                        if (results[0].status <= 5) {
                            NullUp.push(        	
                                //pega o caminho do arquivo
                                    name+' - '+v + ('\n')
                                );
                                fs.writeFile('amostras_sem_upload.txt', NullUp ,function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                console.log("O arquivo foi salvo!");
                            });
                        }
                        if (results[0].status == 6) {
                            NotNullUp.push(        	
                                //pega o caminho do arquivo
                                    name+' - '+v + ('\n')
                                );
                                fs.writeFile('amostras_com_upload_mas_nao_autorizadas.txt', NotNullUp ,function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                console.log("O arquivo foi salvo!");
                            });
                        }
                        console.log(i, results[0]);
                    }
                });
                console.log(name)
            })
        }))

    })