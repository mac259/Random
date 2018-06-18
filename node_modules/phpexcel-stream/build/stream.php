<?php

if (!defined('PHPEXCEL_ROOT')) {
  define('PHPEXCEL_ROOT', __DIR__. '/vendor/phpoffice/phpexcel/Classes/');
  require_once PHPEXCEL_ROOT . 'PHPExcel/Autoloader.php';
}

$file = $argv[1];

// Use SQLite cell cache (significantly reduces memory usage)
$cache = PHPExcel_CachedObjectStorageFactory::cache_to_sqlite3;

if (PHPExcel_Settings::setCacheStorageMethod($cache)!==true) {
  throw new Exception('SQLite3 not available');
}

$excel = PHPExcel_IOFactory::createReaderForFile($file)
  ->setReadDataOnly(true)
  ->load($file);

PHPExcel_IOFactory::createWriter($excel, 'CSV')
  ->save('php://stdout');
