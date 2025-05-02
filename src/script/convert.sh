#!/bin/bash

echo "Starting convert charset process..."

FILENAME=$1

// if filename is not provided, throw error and end script
if [ -z "$1" ]; then
	echo "No sourcefile provided. Please provide a filename as the first argument."
	exit 1
fi

iconv -f iso-8859-11 -t utf8 ./src/sql/$FILENAME-utf-blob.sql > ./src/sql/$FILENAME-converted.sql
