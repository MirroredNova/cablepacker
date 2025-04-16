#!/bin/bash

gitlab_base_url="https://gitlabp2.alliant-energy.com/api/v4/projects/$CI_PROJECT_ID"
release_type=$BUILD_RELEASE_TYPE

if [[ -z "$release_type" ]]; then
     release_type=$(case $CI_COMMIT_MESSAGE in
          "bump-patch") echo "patch" ;;
          "bump-minor") echo "minor" ;;
          "bump-major") echo "major" ;;
          *) echo "patch" ;;
     esac)
fi

# Get all existing tags in GitLab
existing_tags=$(curl --header "PRIVATE-TOKEN: $GITLAB_TOKEN" --request GET "$gitlab_base_url/repository/tags?order_by=version&sort=desc")

# Map the name to get the latest tag version
# If existing_tags are empty, use 0.0.1 as initial version
# Using map, select, test and not will ignore all tags that have "prod_" prefix
last_version=$(echo "$existing_tags" | jq -r 'map(select(.name | test("(?i)^prod_") | not))[0].name  // "0.0.1"')

updated_version=$last_version

# Bump version if new commit is added to branch, else use last version only
if [ "$CI_PIPELINE_SOURCE" == "push" ]; then
     # Bumping the version
     updated_version=$(bash ./bump_version.sh $last_version $release_type)

     # Create a new Git tag with the updated version
     curl --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
          --request POST "$gitlab_base_url/repository/tags?tag_name=$updated_version&ref=$CI_COMMIT_REF_NAME&description=Release%20$updated_version" > /dev/null
fi

echo "$updated_version"
