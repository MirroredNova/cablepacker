# Cable Packer

This is the project for the Cable Packer, a tool designed to assist in the packing of cables into a minimum sized bore.

## Circle Packing Process

The core technical challenge is finding the smallest enclosing bore that can fit all cable cross-sections (modeled as circles) without overlap.

Implementation location:
- `src/server/utils/algo.utils.ts`

High-level process:
1. Convert input cables into circles (diameter, radius, quantity-expanded list).
2. Sort circles from largest to smallest radius (`sortCircles`).
3. Guess an enclosing diameter and test if all circles can be placed (`checkEnclose`).
4. Place each circle by scanning candidate positions:
   - radius from outer edge toward center
   - angle from `0` to `360`
   - convert polar to cartesian (`polarToCartesian`)
5. Validate each candidate placement by checking overlap against already placed circles (`circlePositionIsValid`).
6. If a full placement succeeds, diameter is valid; if not, it is too small.
7. Use binary search over diameter bounds (`findOptimalEncloseSize`) to converge to the minimum feasible bore.
8. Return:
   - `enclose`: minimum enclosing circle
   - `circles`: placed cable circles and coordinates

Detailed placement logic (`placeCircle`):
1. For the current circle, compute the furthest valid center distance:
   - `maxCenterRadius = encloseRadius - circle.radius`
   - This ensures the circle stays fully inside the enclosing bore.
2. Search candidate positions in this loop order:
   - outer loop: radius from `maxCenterRadius` down to `0`
   - inner loop: angle from `0` to `360`
3. At each candidate, convert polar to cartesian:
   - `(x, y) = polarToCartesian(angle, radius)`
4. Check overlap with all previously placed circles:
   - `distance(centerA, centerB) >= radiusA + radiusB`
   - with `almostEqual` tolerance for floating-point precision.
5. If a candidate fails, continue scanning angles at the same radius.
6. If all angles fail at that radius, decrement radius and try again.
7. If no candidate works down to radius `0`, this enclosing diameter is infeasible.

Why this approach:
- Exact optimal circle packing is hard for arbitrary inputs.
- This implementation uses a deterministic heuristic placement + binary search, which is stable and fast enough for interactive use.

Config knobs (tradeoff between speed and precision):
- `MAX_ITERATIONS`: binary search / refinement cap.
- `RADIUS_STEP_SIZE`: radial search granularity.
- `ANGLE_STEP_SIZE`: angular search granularity.
- `MIN_ENCLOSE_STEP_SIZE`: minimum binary-search refinement step.

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
