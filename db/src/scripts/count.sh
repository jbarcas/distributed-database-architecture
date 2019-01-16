#!/bin/bash

# sst_dump --file=`echo $DB_PRIMARY` --show_properties --command=none | grep entries | cut -c 14- | awk '{x+=$0}END{print x}'

# count keys
ldb --db=`echo $DB_PRIMARY` scan | wc -l
