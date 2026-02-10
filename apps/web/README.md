# Precium Web Application

React + TypeScript + Vite web application for Precium.

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
```

Output will be in `dist/` directory.

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Type Checking

```bash
npm run type-check
```

## Tech Stack

- React 18
- TypeScript 5.7
- Vite 6
- Tailwind CSS
- React Router
- React Query

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable components
├── pages/          # Page components
├── hooks/          # Custom hooks
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript types
└── styles/         # Global styles
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3001
```

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Lint code
- `type-check` - Type check TypeScript
- `test` - Run tests
