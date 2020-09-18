<?php
include 'sistemaPHP/system.php';

$path = "2019/";
$diretorio = dir($path);
 
echo "Lista de Arquivos do diretório '<strong>".$path."</strong>':<br />";
$sample_not_found = [];
$sample_without_upload = [];
$sample_with_upload_but_unauth = [];
$sample = [];
$link = DBconnec();
while($arquivo = $diretorio -> read()){
    try {
        if ($arquivo != '.' || $arquivo != '..' || $arquivo != 'Thumbs.db') {
            # code...
            $xml = simplexml_load_file($path.$arquivo);
            $json = json_encode($xml);
            $array = json_decode($json,TRUE);
            $name = $array['sample']['name'];
            //Seleciona 
            $res = DBread($link, 'solicitations', "WHERE name = '".$name."'", 'name, status, download, user_id');
            // var_dump($res);
            if ($res) {
                if ($res[0]['status'] <= 5) {
                    //Colocar em amostra sem upload
                    array_push($sample_without_upload, array('arquivo' => $arquivo, 'name' => $name, 'user_id' => $res[0]['user_id']));
                    
                }else if ($res[0]['status'] == 6) {
                    //amostras_com_upload_mas_nao_autorizadas
                    array_push($sample_with_upload_but_unauth, array('arquivo' => $arquivo, 'name' => $name, 'user_id' => $res[0]['user_id']));
                }else{
                    array_push($sample, array('arquivo' => $arquivo, 'name' => $name, 'user_id' => $res[0]['user_id']));
                }
            }else{
                //Colocar em arquivo amostras_nao_encontrada
                array_push($sample_not_found, array('arquivo' => $arquivo, 'name' => $name, 'user_id' => $res[0]['user_id']));  
            }
        }
    } catch (\Throwable $th) {
        //throw $th;
    }
    
    //Banco
}
$diretorio -> close();

echo '<br><strong>Amostras realizadas com sucesso</strong><br>';
?>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">


<?php

echo '<br><strong>Amostras não encontradas</strong><br>';
?>
<table style="width:100%;" class="table">
    <tr>
        <th>Nome da amostra</th>
        <th>Nome do arquivo</th>
        <th>Ano</th>
        <th class="text-center">Dono da Aomstra</th>
        <th>Email</th>
    </tr>
    <?php 
        for ($i=0; $i < count($sample_not_found); $i++) { 
            $dono = DBread($link, 'users', "WHERE id = '".$sample_not_found[$i]['user_id']."'");
    ?>
    <tr style="text-align: center;">
        <td><?php echo $sample_not_found[$i]['name'] ?></td>
        <td><?php echo $sample_not_found[$i]['arquivo'] ?></td>
        <td><?php echo '2019' ?></td>
        <td><?php echo ($dono ? $dono[0]['name'] : '-') ?></td>
        <td><?php echo ($dono ? $dono[0]['email'] : '-') ?></td>
    </tr>
        <?php } ?>
</table>
<br>Total = (<?php echo count($sample_not_found) ?>)<br><br>
<?php

echo '<br><strong>Sem Upload</strong><br>';
?>
<table style="width:100%;" class="table">
    <tr>
        <th>Nome da amostra</th>
        <th>Nome do arquivo</th>
        <th>Ano</th>
        <th class="text-center">Dono da Aomstra</th>
        <th>Email</th>
    </tr>
    <?php 
        for ($i=0; $i < count($sample_without_upload); $i++) { 
            $dono = DBread($link, 'users', "WHERE id = '".$sample_without_upload[$i]['user_id']."'");
    ?>
    <tr style="text-align: center;">
        <td><?php echo $sample_without_upload[$i]['name'] ?></td>
        <td><?php echo $sample_without_upload[$i]['arquivo'] ?></td>
        <td><?php echo '2019' ?></td>
        <td><?php echo ($dono ? $dono[0]['name'] : '-') ?></td>
        <td><?php echo ($dono ? $dono[0]['email'] : '-') ?></td>
    </tr>
        <?php } ?>
</table>
Total = (<?php echo count($sample_without_upload) ?>)<br><br>
<?php 
//Vai inserir o novo nome, mudar o status para 7 e mover para a pasta uploads
// for ($i=0; $i < count($sample_without_upload); $i++) { 
//     $up['status'] = 7;
//     $up['updated_at'] = date('Y-m-d H:i:s');
//     $up['download'] = $sample_without_upload[$i]['name'].'_'.( time () + rand(10, 1000) ).'.xrdml';
//     copy('2019/'.$sample_without_upload[$i]['arquivo'], 'uploads/'.$up['download']);
//     DBUpDate($link, 'solicitations', $up,"name = '".$sample_without_upload[$i]['name']."'");
//     var_dump($up);
// }
?>


<?php

echo '<br><strong>Com upload, mas não autorizada</strong><br>';
?>

<table style="width:100%;" class="table">
    <tr>
        <th>Nome da amostra</th>
        <th>Nome do arquivo</th>
        <th>Ano</th>
        <th class="text-center">Dono da Aomstra</th>
        <th>Email</th>
    </tr>
    <?php 
        for ($i=0; $i < count($sample_with_upload_but_unauth); $i++) { 
            $dono = DBread($link, 'users', "WHERE id = '".$sample_with_upload_but_unauth[$i]['user_id']."'");
    ?>
    <tr style="text-align: center;">
        <td><?php echo $sample_with_upload_but_unauth[$i]['name'] ?></td>
        <td><?php echo $sample_with_upload_but_unauth[$i]['arquivo'] ?></td>
        <td><?php echo '2019' ?></td>
        <td><?php echo ($dono ? $dono[0]['name'] : '-') ?></td>
        <td><?php echo ($dono ? $dono[0]['email'] : '-') ?></td>
    </tr>
        <?php } ?>
</table>
Total = (<?php echo count($sample_with_upload_but_unauth) ?>)<br><br>

<?php

DBclose($link);
