# Transport Routes - KaribuMakazi

Comprehensive transport route data for Kenya and Tanzania coastal regions, integrated with the Makazi AI concierge.

## Features

- 60+ pre-seeded transport routes
- Kenya routes: Airport transfers, SGR transfers, ferry routes, beach transfers, island transfers
- Tanzania routes: Zanzibar airport/ferry routes, Dar es Salaam transfers, coastal routes, island routes
- AI-powered route recommendations
- Admin interface for managing routes

## Seeding Data

To populate the transport routes database:

```bash
# Seed routes (keeps existing data)
docker compose exec backend python manage.py seed_transport_routes

# Clear and reseed
docker compose exec backend python manage.py seed_transport_routes --clear
```

This will create 60 transport routes:
- 23 Kenya routes
- 37 Tanzania routes

## API Endpoint

**Endpoint**: `GET /api/taxi/routes/`

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `country` | Filter by country | `Kenya` or `Tanzania` |
| `category` | Filter by route category | `Airport Transfer`, `Ferry Route`, etc. |
| `origin` | Filter by origin | `Moi International Airport` |
| `destination` | Filter by destination | `Diani` |
| `search` | Search in origin, destination, notes | `ferry` |
| `featured` | Show only featured routes | `1` or `true` |

### Example Requests

```bash
# All Kenya airport transfers
GET /api/taxi/routes/?country=Kenya&category=Airport Transfer

# Routes to Diani
GET /api/taxi/routes/?destination=Diani

# Ferry routes
GET /api/taxi/routes/?search=ferry

# Featured routes only
GET /api/taxi/routes/?featured=1
```

### Response Format

```json
[
  {
    "id": 1,
    "country": "Kenya",
    "route_category": "Airport Transfer",
    "origin": "Moi International Airport",
    "destination": "Nyali",
    "transport_type": "Taxi",
    "estimated_time": "20-35 mins",
    "price_min": 1200.00,
    "price_max": 2500.00,
    "currency": "KES",
    "notes": "Good for hotels, apartments and beach stays in Nyali.",
    "is_featured": true
  }
]
```

## AI Concierge Integration

The Makazi AI assistant automatically detects transport-related queries and provides route recommendations.

### Example Queries

**User**: "How do I get from Moi Airport to Diani?"
**AI Response**: Returns relevant routes with pricing, transport types, and travel times.

**User**: "Show me ferry routes in Tanzania"
**AI Response**: Returns ferry routes with details about Dar-Zanzibar ferry and other options.

**User**: "Routes from Zanzibar Airport to Nungwi"
**AI Response**: Returns taxi/shuttle options with pricing and timing.

**User**: "SGR to Diani"
**AI Response**: Returns SGR terminus to Diani routes, including ferry crossing information.

### How It Works

1. User asks transport question in chat
2. AI detects transport intent using keywords: `route`, `transfer`, `ferry`, `sgr`, `airport`, `from`, `to`, `get to`
3. AI queries transport routes database
4. Returns structured results with:
   - Route information (origin → destination)
   - Transport type (Taxi, Ferry, Bus, etc.)
   - Estimated time
   - Price range
   - Helpful notes
   - Country and category

## Admin Panel

Access at: `/admin/taxi/transportroute/`

### Features

- View all routes in a sortable table
- Filter by country, category, transport type, featured status
- Search by origin, destination, or notes
- Quick-edit featured and active status
- Detailed edit view with organized fieldsets

### Field Groups

**Route Information**
- Country
- Route category
- Origin
- Destination
- Transport type

**Timing & Pricing**
- Estimated time
- Minimum price
- Maximum price
- Currency

**Details**
- Notes (helpful information for travelers)
- Is featured (show in prominent places)
- Is active (enable/disable route)

## Route Categories

### Kenya
- **Airport Transfer**: Moi International Airport to coastal destinations
- **Rail Transfer**: Mombasa SGR Terminus to hotels/beaches
- **Ferry Guide**: Likoni Ferry connections to South Coast
- **Beach Transfer**: Inter-beach transfers (Diani, Tiwi, Shimoni)
- **North Coast Transfer**: Mombasa to Watamu, Malindi, Kilifi
- **Island Transfer**: Lamu connections

### Tanzania
- **Airport Transfer**: Zanzibar Airport & Julius Nyerere Airport routes
- **Ferry Transfer**: Zanzibar Ferry Port to beach destinations
- **Ferry Route**: Dar es Salaam ↔ Zanzibar ferry
- **City Transfer**: Dar es Salaam city routes
- **Island Day Trip**: Mbudya, Bongoyo islands
- **Coastal Transfer**: Bagamoyo, Saadani, Pangani routes
- **Island Transfer**: Mafia Island routes
- **Southern Coast Transfer**: Mtwara, Lindi, Kilwa routes

## Data Structure

### Transport Types
- Taxi
- Taxi/Ferry Transfer
- Taxi/Matatu
- Taxi + Boat
- Taxi/Shuttle
- Private Transfer
- Ferry
- Bus/Private Transfer
- Boat Transfer
- Flight/Bus + Boat

### Currencies
- **KES**: Kenya Shillings
- **TZS**: Tanzania Shillings
- **USD**: US Dollars (common for Tanzania tourist routes)

## Important Notes

⚠️ **Pricing & Timing Disclaimers**
- All prices and travel times are indicative estimates
- Actual costs may vary based on:
  - Time of day
  - Traffic conditions
  - Season (high/low tourism)
  - Negotiation
  - Vehicle type
  - Number of passengers
- Always confirm current rates before booking
- Check availability, especially during peak season
- Consider traffic patterns (morning/evening rush)

## Example Use Cases

### For Guests

1. **Airport Arrivals**: Search "Zanzibar Airport to Nungwi" to find shuttle/taxi options
2. **Ferry Crossings**: Search "Dar ferry" to see Dar-Zanzibar ferry details
3. **Beach Hopping**: Search routes between beaches (Diani, Watamu, Paje)
4. **Train Arrivals**: Search "SGR to beach" for post-train transport options

### For Agents

1. Recommend transport to clients booking stays
2. Provide accurate pricing estimates
3. Share timing information for travel planning
4. Combine transport with property/package bookings

### For Admin

1. Update prices seasonally
2. Add new routes as services expand
3. Mark popular routes as "featured"
4. Disable routes that are no longer available

## Future Enhancements

Potential additions:
- Real-time availability API integration
- Direct booking through platform
- Driver assignment to routes
- User reviews for routes
- Dynamic pricing based on demand
- Integration with taxi booking system
- Multi-language route descriptions
