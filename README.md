# Cable Packer

This is the project for the Cable Packer, a tool designed to assist in the packing of cables into a minimum sized bore.

## Getting started

To get started with the Cable Packer project, follow these steps:
1. Clone the repository to your local machine using the following command:
   ```bash
   git clone x
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

```bash
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

### SUPABASE
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```