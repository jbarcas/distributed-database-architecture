#!/bin/bash

# Print entities to screen
ldb --db=`echo $DB_PRIMARY` scan | cut -d ':' -f 2- | tr '\n' , | sed 's/.$//'
