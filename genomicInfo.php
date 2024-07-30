<?php
/*
	* Copyright (c) 2024 Harvard Catalyst
	* All rights reserved. This program and the accompanying materials 
	* are made available under the terms of the i2b2 Software License v2.1 
	* which accompanies this distribution. 
	* 
*/



$GENE_DB_FILENAME = './i2b2_gene_list-FTS3.db3';


// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);


// CORS: Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    // you want to allow, and if so:
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}


function find_rsid($search){
	// this is an example function for returning hardcoded rsids to the autocomplete results
	$output = array("rsid" => $search, "alleles" => array("T=T", "T>C"));
	return json_encode($output);
}

function search_by_gene($search){
	global $GENE_DB_FILENAME;
	$db = new PDO('sqlite:'.$GENE_DB_FILENAME);
	$stmt = $db->prepare("SELECT gene_id, symbol, name FROM genes_search AS gs JOIN genes AS g ON (g.rowid = gs.rowid) WHERE gs.content MATCH :term LIMIT 20;");
	$stmt->execute(array($search.'*'));
	$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($data);
}


if(isset($_GET['op']) && isset($_GET['term'])){
	$search = $_GET['term'];
	$op = $_GET['op'];
	switch($op) {
		case 'rsid':
			print find_rsid($search);
			break;
		case 'gene':
			print search_by_gene($search);
			break;
	}
}
?>
