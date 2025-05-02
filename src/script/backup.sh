#!/bin/bash

echo "Starting backup process..."

FILENAME="backup"

if [ ! -z "$1" ]; then
	FILENAME=$1
fi

docker exec kuwin-database \
  mysqldump -uroot -proot --all-databases > ./src/sql/$FILENAME.sql
