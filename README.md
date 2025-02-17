# 🎵 Spotify Dashboard

A modern, feature-rich dashboard for Spotify users that provides deep insights into their music listening habits and preferences. Built with React, TypeScript, and Tailwind CSS.

![image](https://github.com/user-attachments/assets/90d2f6c5-4353-4354-bad0-9c856136acef)


## ✨ Features

### 📊 Comprehensive Analytics
- Track your top artists and songs across different time periods
- View detailed listening statistics and trends
- Analyze your music preferences by genre
- Discover your unique listener personality type

### 📑 Playlist Management
- View all your playlists in both grid and list layouts
- Quick access to playlist details and tracks
- Play and share playlists directly from the dashboard
- Preview tracks before playing

### 🎧 Real-Time Playback
- Control your Spotify playback from any page
- See currently playing track information
- Quick access to play/pause and track navigation
- Preview track snippets

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark theme optimized for music browsing
- Smooth animations and transitions
- Intuitive navigation and controls

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Spotify account
- Spotify Developer credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spotify-dashboard.git
cd spotify-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Built With

- **[React](https://reactjs.org/)** - UI Framework
- **[TypeScript](https://www.typescriptlang.org/)** - Programming Language
- **[Vite](https://vitejs.dev/)** - Build Tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[React Query](https://react-query.tanstack.com/)** - Data Fetching
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)** - Music Data
- **[Lucide React](https://lucide.dev/)** - Icons

## 📱 Screenshots

### Dashboard
![image](https://github.com/user-attachments/assets/b034d129-3d5e-4d66-ae85-864e41fb07c1)

- View top tracks and artists
- See listening statistics
- Analyze genre preferences

### Playlists
![image](https://github.com/user-attachments/assets/31f9c91b-5159-42bf-83f3-2447b9c2964f)

- Grid and list views
- Quick access to playlist details
- Play and share functionality

## 🔒 Authentication

The dashboard uses Spotify's OAuth 2.0 flow for authentication:
1. Users log in with their Spotify credentials
2. Authorization is requested for specific scopes
3. Access token is stored securely
4. Token refresh is handled automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for providing the music data
- [Tailwind CSS](https://tailwindcss.com/) for the awesome styling framework
- The React community for incredible tools and libraries


## 🔮 Future Features

- Enhanced music recommendations
- Social Community Features
