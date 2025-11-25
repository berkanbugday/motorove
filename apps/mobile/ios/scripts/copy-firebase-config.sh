#!/bin/bash

# Script to copy the correct GoogleService-Info.plist based on build configuration
# This script should be added as a Run Script phase in Xcode before "Copy Bundle Resources"

# Determine which Firebase config to use based on CONFIGURATION
if [ "${CONFIGURATION}" == "Debug" ]; then
    FIREBASE_ENV="dev"
elif [ "${CONFIGURATION}" == "Staging" ]; then
    FIREBASE_ENV="staging"
elif [ "${CONFIGURATION}" == "Release" ]; then
    FIREBASE_ENV="prod"
else
    echo "Warning: Unknown configuration ${CONFIGURATION}, defaulting to Dev"
    FIREBASE_ENV="Dev"
fi

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIREBASE_DIR="${SCRIPT_DIR}/../firebase"
SOURCE_FILE="${FIREBASE_DIR}/${FIREBASE_ENV}/GoogleService-Info.plist"
TARGET_FILE="${SCRIPT_DIR}/../GoogleService-Info.plist"
TARGET_DIR="${SCRIPT_DIR}/../motorove"

# Check if source file exists
if [ ! -f "${SOURCE_FILE}" ]; then
    echo "Error: Firebase config file not found at ${SOURCE_FILE}"
    echo "Please ensure you have downloaded the GoogleService-Info.plist for ${FIREBASE_ENV} environment"
    exit 1
fi

# Copy the file to the root ios directory
cp "${SOURCE_FILE}" "${TARGET_FILE}"
echo "Copied GoogleService-Info.plist from firebase/${FIREBASE_ENV}/ for ${CONFIGURATION} configuration"

# Also copy to motorove directory if it exists (for Xcode project reference)
if [ -d "${TARGET_DIR}" ]; then
    cp "${SOURCE_FILE}" "${TARGET_DIR}/GoogleService-Info.plist"
    echo "Copied GoogleService-Info.plist to motorove directory"
fi

