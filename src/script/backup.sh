#!/bin/bash

echo "Starting backup process..."

docker exec testmysql \
  mysqldump -uroot -proot --all-databases > ./src/sql/backup.sql
