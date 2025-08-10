# CryptoReels - External Slot Machine Game

CryptoReels is a crypto/NFT-themed slot machine game designed as an external third-party game that integrates with the Naffles platform through the wagering API. The game features modern Megaways mechanics, cascading reels, and NFT-based bonus features.

## Project Structure

```
crypto-reels/
├── backend/                 # Node.js/Express game engine
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services (to be implemented)
│   ├── models/             # Data models (to be implemented)
│   └── utils/              # Utility functions (to be implemented)
├── frontend/               # Next.js/React game interface
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── styles/         # CSS and styling
│   │   └── utils/          # Frontend utilities (to be implemented)
│   └── public/             # Static assets
└── docker-compose.development.yml
```

## Features

- **Modern Slot Mechanics**: 6-reel Megaways with up to 117,649 ways to win
- **Crypto Theme**: Bitcoin, Ethereum, Solana, and NFT-themed symbols
- **NFT Integration**: Player-owned NFTs provide gameplay bonuses
- **Test Mode**: Standalone testing with free credits when Naffles unavailable
- **Iframe Embedding**: Designed for seamless integration into Naffles platform
- **Session-based Gaming**: Integrates with Naffles house slot system

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend on http://localhost:3003
   - Frontend on http://localhost:3002

3. **Individual service development:**
   ```bash
   # Backend only
   npm run backend:dev
   
   # Frontend only
   npm run frontend:dev
   ```

### Docker Development

```bash
# Start with Docker Compose
docker-compose -f docker-compose.development.yml up

# Build and start
docker-compose -f docker-compose.development.yml up --build
```

## Environment Configuration

### Backend (.env)
```
PORT=3003
NODE_ENV=development
NAFFLES_API_URL=http://localhost:3000
NAFFLES_FRONTEND_URL=http://localhost:3000
NAFFLES_ADMIN_URL=http://localhost:3001
```

### Frontend (.env.local)
```
BACKEND_URL=http://localhost:3003
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
NAFFLES_API_URL=http://localhost:3000
NAFFLES_FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Game API (`/api/game`)
- `POST /api/game/initialize` - Initialize game session
- `POST /api/game/spin` - Process slot spin
- `GET /api/game/status/:gameId` - Get game status

### Configuration API (`/api/config`)
- `GET /api/config` - Get game configuration
- `PUT /api/config` - Update game configuration (admin)

### Naffles Integration API (`/api/naffles`)
- `GET /api/naffles/health` - Check Naffles platform connection
- `POST /api/naffles/session` - Create session with wagering API
- `POST /api/naffles/vrf` - Request VRF randomness

## Test Mode

When the Naffles platform is unavailable, CryptoReels automatically enters test mode:

- **Free Credits**: 10,000 test credits provided
- **Local PRNG**: Uses pseudo-random number generation
- **Simulated NFTs**: Random NFT collection for testing bonuses
- **Full Functionality**: All game mechanics work identically to live mode
- **No Real Money**: Completely isolated from financial systems

## Iframe Integration

The game is designed for iframe embedding in the Naffles platform:

- **Security Headers**: Proper X-Frame-Options and CSP configuration
- **Responsive Design**: Adapts to various iframe sizes
- **Cross-Origin Communication**: Secure messaging with parent frame
- **No Scrollbars**: Optimized for iframe display

## Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, Jest

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS with crypto-themed design
- **Animations**: Framer Motion
- **State Management**: React Hooks (Zustand to be added)
- **TypeScript**: Full TypeScript support

## Implementation Status

✅ **Task 1: Project Structure Setup** (Current)
- [x] Backend Node.js/Express setup
- [x] Frontend Next.js/React setup
- [x] Docker development environment
- [x] Basic iframe embedding capability
- [x] Test mode framework

🔄 **Next Tasks** (To be implemented):
- Task 2: Core slot machine mechanics
- Task 3: Crypto-themed symbol system
- Task 4: NFT integration system
- Task 5: Bonus features and special mechanics
- Task 6: Naffles API integration layer
- Task 7: Session-based house slot integration
- Task 8: Admin configuration system
- Task 9: Game statistics and UI
- Task 10: Testing and quality assurance
- Task 11: Test mode functionality
- Task 12: Deployment and integration

## Development Notes

- All API endpoints currently return placeholder responses
- Game mechanics will be implemented in subsequent tasks
- Test mode detection and activation is functional
- Iframe embedding headers and security are configured
- Crypto-themed styling and animations are ready for game content

## Contributing

This is part of the Naffles platform ecosystem. Follow the established patterns from the main Naffles codebase for consistency.

## License

MIT License - Part of the Naffles Platform