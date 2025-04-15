# Cable Packer

This is the project for the Cable Packer, a tool designed to assist in the packing of cables into a minimum sized bore. The project is built using Terraform and is intended for use in an Azure environment.

## Getting started

To get started with the Cable Packer project, follow these steps:
1. Clone the repository to your local machine using the following command:
   ```bash
   git clone https://gitlabp2.alliant-energy.com/cloud/business-apps/cablepacker.git
   ```
2. Navigate to the project directory:
   ```bash
    cd cablepacker
    ```
3. Install the required dependencies using the following command:
   ```bash
   npm install
   ```
4. Run the project for development using the following command:
   ```bash
   npm run dev
   ```

## Environment Variables
Create a `.env.local` file in the project root with the following variables:

### ALGORITHM
MAX_ITERATIONS=100
RADIUS_STEP_SIZE=0.01
ANGLE_STEP_SIZE=0.1
MIN_ENCLOSE_STEP_SIZE=0.001

### ADMIN
SESSION_SECRET=your_session_secret_here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

### VALIDATION
MAX_CIRCLES=25
NEXT_PUBLIC_MAX_CIRCLES=25
MAX_DIAMETER=50
NEXT_PUBLIC_MAX_DIAMETER=50

### SNOWFLAKE DB
SFDB_P8KEY=your_private_key_here
SFDB_AUTHENTICATOR=SNOWFLAKE_JWT
SFDB_ACCOUNT=your_snowflake_account
SFDB_USERNAME=your_snowflake_username
SFDB_ROLE=your_snowflake_role
SFDB_WAREHOUSE=your_snowflake_warehouse
SFDB_DATABASE=your_snowflake_database
SFDB_SCHEMA=your_snowflake_schema

### SNOWFLAKE POOL
SFDB_MIN_POOL_SIZE=0
SFDB_MAX_POOL_SIZE=1
SFDB_ACQUIRETIMEOUTMILLIS=60000
SFDB_EVICTIONRUNINTERVALMILLIS=3600000