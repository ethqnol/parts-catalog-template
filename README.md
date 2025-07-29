# Robotics Parts Catalog

## Quick Start (Deploy in 5 minutes)

### Prerequisites
- **Node.js** v18+ ([Download here](https://nodejs.org/))
- **Cloudflare account** ([Sign up free](https://dash.cloudflare.com/sign-up))

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Clone & Setup
```bash
git clone <your-repo-url>
cd robotics-parts-catalog
npm install
```

### 3. Login to Cloudflare
```bash
wrangler login
```
*This will open your browser to authenticate*

### 4. Create Database
```bash
wrangler d1 create robotics_parts_db
```
**IMPORTANT**: Copy the `database_id` from the output.

### 5. Configure Database
Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "robotics_parts_db"
database_id = "your-actual-database-id-here"
```

### 6. Initialize Database
```bash
wrangler d1 execute robotics_parts_db --file=./schema.sql
```

### 7. Deploy to Production
```bash
npm run build
wrangler pages deploy dist --project-name robotics-parts-catalog
```

**Deployment Complete**: Your application is now live at the URL provided by Cloudflare.

## Local Development

```bash
npm run dev
```
Visit `http://localhost:4321` to test locally.

## User Guide

### Adding New Part Types
1. Navigate to **"Manage Part Types"**
2. Enter part name (e.g., `screw-0.5in`)
3. Add description (optional)
4. Click **"Add Part Type"**

*This creates a new part with initial count of 0*

### Managing Inventory

#### Adding Parts
1. Click **"Add Parts"** on any part card
2. Enter quantity to add
3. Enter your name (required)
4. Add description (optional)
5. Click **"Add Parts"**

#### Removing Parts
1. Click **"Remove Parts"** on any part card
2. Enter quantity to remove
3. Enter your name (required)
4. **Enter reason** (required) - e.g., "Used in robot build"
5. Add description (optional)
6. Click **"Remove Parts"**

*Note: System prevents removal of more parts than current inventory*

### Transaction History
Navigate to **"Transaction Log"** to access:
- Complete audit trail of all inventory changes
- Filter functionality by type (add/remove), user, or part
- Real-time statistics and reporting
- Timestamp records for all transactions

### Deleting Part Types
In **"Manage Part Types"**, click **"Delete"** on any part type.

**Deletion Requirements:**
- No existing transaction history for the part
- Current inventory count must equal 0
- Action cannot be reversed

## Database Management

### Reset Database (Fresh Start)
```bash
# Method 1: Delete and recreate
wrangler d1 delete robotics_parts_db
wrangler d1 create robotics_parts_db
# Update wrangler.toml with new database_id
wrangler d1 execute robotics_parts_db --file=./schema.sql

# Method 2: Clear data only
wrangler d1 execute robotics_parts_db --command "DELETE FROM transactions;"
wrangler d1 execute robotics_parts_db --command "DELETE FROM parts;"
wrangler d1 execute robotics_parts_db --command "DELETE FROM part_types;"
wrangler d1 execute robotics_parts_db --file=./schema.sql
```

### Database Queries
```bash
# List all part types
wrangler d1 execute robotics_parts_db --command "SELECT * FROM part_types;"

# Check current inventory
wrangler d1 execute robotics_parts_db --command "SELECT pt.name, p.current_count FROM parts p JOIN part_types pt ON p.part_type_id = pt.id;"

# View recent transactions
wrangler d1 execute robotics_parts_db --command "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;"
```

## Troubleshooting

### Database Connection Issues
```bash
# Verify database exists
wrangler d1 list

# Test database connection
wrangler d1 execute robotics_parts_db --command "SELECT 1;"
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.astro
npm install
npm run build
```

### Local Development Issues
Ensure you are using the correct development command:
```bash
npm run dev
# NOT npm start
```

## Technical Specifications

### Architecture
- **Frontend**: Astro.js with TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages
- **Runtime**: Cloudflare Workers

### Database Schema
```sql
part_types (id, name, description, created_at)
parts (id, part_type_id, current_count, created_at)
transactions (id, part_id, transaction_type, quantity, user_name, reason, description, created_at)
```

### API Endpoints
- `GET /api/parts` - List all parts with current counts
- `GET /api/part-types` - List all part types
- `POST /api/part-types` - Create new part type
- `DELETE /api/part-types` - Delete existing part type
- `POST /api/parts/add` - Add parts to inventory
- `POST /api/parts/remove` - Remove parts from inventory
- `GET /api/transactions` - Retrieve transaction history

## Security Features

- Input validation on all user forms
- Required user identification for accountability
- Inventory validation preventing over-removal
- Complete transaction history preservation
- Controlled part type deletion with safety constraints

## Platform Compatibility

The application is fully responsive and supports:
- Mobile devices
- Tablet devices
- Desktop computers

## Support

If you encounter technical issues:
1. Review the troubleshooting section above
2. Verify your Cloudflare account has proper access to D1 and Pages services
3. Confirm all commands were executed in the correct project directory
4. Check browser console for JavaScript error messages