#!/bin/bash

updated_version=$OVERRIDE_UPDATED_VERSION

if [[ -z "$OVERRIDE_UPDATED_VERSION" ]]; then
    # Increment the version
    updated_version=$(semver -i $2 $1)
fi

# Return the updated version
echo "$updated_version"
