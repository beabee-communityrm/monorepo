#!/bin/bash
# retry.sh

# The script to be repeated as the first argument
script_name=$1

i=1
while [ $i -le 3 ]; do
  yarn $script_name && break || sleep 5
  i=$((i + 1))
done
