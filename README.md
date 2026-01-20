# Pulse - Board Management Application

A modern Angular 20 application with Tailwind CSS v4, Angular Material, and PWA support.

## Features

- ✨ Angular 20 with standalone components
- 🎨 Tailwind CSS v4 with Vite integration
- 🎭 Angular Material 20
- 🌓 Dark/Light mode with CSS variables
- 📱 PWA support with service worker
- 🎯 Responsive layout with header, sidebar, and main canvas
- 📊 Sample board data with 3 pre-configured boards
- 🔥 Hot reload for development

## Project Structure

```
Pulse/
├── public/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   └── header.component.ts
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts
│   │   │   └── main-canvas/
│   │   │       └── main-canvas.component.ts
│   │   ├── models/
│   │   │   └── board.model.ts
│   │   ├── services/
│   │   │   ├── board.service.ts
│   │   │   └── theme.service.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.css
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Technologies Used

- **Angular 20**: Modern web framework with signals and standalone components
- **Tailwind CSS v4**: Utility-first CSS framework with Vite plugin
- **Angular Material 20**: Material Design components
- **Angular CDK**: Component development kit
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **UUID**: Unique identifier generation

## Features Breakdown

### Theme System
- Light and dark mode support
- CSS variable-based theming
- Persistent theme selection via localStorage
- Smooth transitions between themes

### Board Management
- Create, read, update, delete boards
- Color-coded boards
- Sample data with 3 boards:
  - Product Roadmap (Blue)
  - Marketing Campaign (Purple)
  - Design System (Pink)

### Responsive Layout
- Header with branding and theme toggle
- Collapsible sidebar with board navigation
- Main canvas with grid-based board display
- Mobile-friendly design

### PWA Support
- Service worker for offline functionality
- Web app manifest for installation
- Caching strategy for assets

## Development

The application uses Angular's latest features:
- **Signals**: For reactive state management
- **Standalone Components**: No NgModule required
- **Control Flow**: New @if, @for syntax
- **Inject Function**: Modern dependency injection

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT
