# Recruiting Platform Mobile App

React Native mobile application for the recruiting platform, built with Expo.

## Features

- **Authentication**: Secure login with JWT tokens stored in secure storage
- **Application Review**: View and manage candidate applications on the go
- **Interview Management**: View interview schedules and submit feedback
- **Communication**: Send emails to candidates directly from the app
- **Push Notifications**: Receive real-time notifications for interviews and applications
- **Offline Support**: Cache data and queue actions for offline use

## Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe development
- **Zustand**: State management
- **React Navigation**: Navigation library
- **Axios**: HTTP client
- **Expo Notifications**: Push notifications
- **Expo Secure Store**: Secure token storage

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Physical device for testing push notifications

## Installation

```bash
cd apps/mobile
npm install
```

## Configuration

Create a `.env` file in the mobile app directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/v1
```

For production, update the API URL to your production backend.

## Running the App

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Testing on Physical Device

1. Install Expo Go app on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## Project Structure

```
apps/mobile/
├── src/
│   ├── navigation/       # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── ApplicationsScreen.tsx
│   │   ├── InterviewsScreen.tsx
│   │   └── ...
│   ├── components/       # Reusable components
│   ├── services/         # API and services
│   │   ├── api.ts
│   │   ├── notificationService.ts
│   │   ├── offlineService.ts
│   │   └── syncService.ts
│   ├── store/            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── applicationStore.ts
│   │   └── interviewStore.ts
│   ├── config/           # Configuration
│   │   └── constants.ts
│   └── types/            # TypeScript types
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features Implementation

### Authentication

- JWT tokens stored securely using Expo Secure Store
- Automatic token refresh on API requests
- Logout clears all stored credentials

### Push Notifications

- Expo Push Notifications for cross-platform support
- Notification channels for Android (Default, Interviews, Applications, Urgent)
- Local notifications for interview reminders
- Background notification handling

### Offline Support

- AsyncStorage for caching data
- Queue system for pending actions
- Automatic sync when connection is restored
- Optimistic UI updates

### State Management

- Zustand for lightweight state management
- Separate stores for auth, applications, and interviews
- Async actions with error handling

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## Testing

```bash
npm test
```

## Troubleshooting

### Push Notifications Not Working

- Push notifications only work on physical devices
- Ensure notification permissions are granted
- Check that the Expo push token is registered with the backend

### API Connection Issues

- Verify the API URL in `.env` is correct
- For local development, use your computer's IP address instead of localhost
- Ensure the backend server is running

### Build Errors

- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo: `expo upgrade`

## Contributing

See the main project CONTRIBUTING.md for guidelines.

## License

Proprietary - All rights reserved
