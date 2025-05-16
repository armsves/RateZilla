#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set in .env file"
    exit 1
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push the schema to the database
echo "Pushing schema to database..."
npx prisma db push

# Seed the database with initial data
echo "Seeding database with initial data..."
npx prisma db seed

echo "Database schema and initial data deployment completed successfully!" 