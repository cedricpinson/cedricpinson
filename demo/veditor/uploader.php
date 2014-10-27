<?

/* Add the original filename to our target path.
Result is "uploads/filename.extension" */
//$target_path = $target_path . basename( $_FILES['uploadedfile']['name']);
//$target_path = "/var/www/vehicleEditor/data/template.blend";
$target_path = "uploads/template.blend";

$cmd = "bash rebuild.sh";
if(!empty($_FILES['file']['error'])) {
		switch($_FILES['file']['error'])
		{
    case '1':
				$error = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
				break;
    case '2':
				$error = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
				break;
    case '3':
				$error = 'The uploaded file was only partially uploaded';
				break;
    case '4':
				$error = 'No file was uploaded.';
				break;

    case '6':
				$error = 'Missing a temporary folder';
				break;
    case '7':
				$error = 'Failed to write file to disk';
				break;
    case '8':
				$error = 'File upload stopped by extension';
				break;
    case '999':
    default:
				$error = 'No error code avaiable';

		}
    printf($error);

} elseif(empty($_FILES['file']['tmp_name']) || $_FILES['file']['tmp_name'] == 'none') {
    $error = 'No file was uploaded..';

    printf($error);

} else {
    $tmp = $_FILES['file']['tmp_name'];
    if (is_uploaded_file($tmp)) {
        move_uploaded_file($tmp, $target_path);

        //$cmd = "cd build/ && make clean && make";
        echo "<pre>";
        $output = system($cmd);
        printf("Output: $output\n");
        echo "</pre>";
    }
}
?>
