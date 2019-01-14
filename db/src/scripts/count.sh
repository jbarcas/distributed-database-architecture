#!/bin/bash

# sst_dump --file=/tmp/userdb/ --show_properties --command=none | grep entries | cut -c 14- | awk '{x+=$0}END{print x}'

# count keys
ldb --db=/tmp/userdb scan | wc -l
