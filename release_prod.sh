#!/bin/bash

gitlab_base_url="https://gitlabp2.alliant-energy.com/api/v4/projects/$CI_PROJECT_ID"

# Get all existing tags in GitLab
existing_tags=$(curl --header "PRIVATE-TOKEN: $GITLAB_TOKEN" --request GET "$gitlab_base_url/repository/tags?order_by=version&sort=desc&search=prod")

# If existing_tags are empty, use 0.0.1 as initial version 
last_version=$(echo "$existing_tags" | jq -r '(.[0].name // "0.0.1") | sub("^prod_"; ""; "i")')

echo "$last_version"
