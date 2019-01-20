#!/bin/bash

# count keys
ldb --db=`echo $DB_PRIMARY` scan | wc -l
