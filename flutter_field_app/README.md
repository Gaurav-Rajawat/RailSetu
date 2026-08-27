# RailSetu Field App (Flutter)

A cross-platform standalone Flutter application designed for RailSetu field inspectors to report railway safety, operations, and maintenance issues.

## Supported Platforms
- **Windows (Desktop)** — Primary development & testing platform.
- **Android (Mobile)** — Production mobile field target.
- **Web (Chrome)** — Browser preview.

---

## Technical Architecture

The application follows a clean, backend-ready architecture separating UI representation from the data layer:

```
UI (Screens & Widgets)
       ↓
State Management (Provider)
       ↓
Repository Layer (Abstract Interfaces)
       ↓
Service/API Layer (Swappable Implementations)
       ├─ MockReportRepository (Currently active)
       └─ ApiReportRepository (Future backend link)
```

- **Location of Future Backend Integration**: All API calls, authentication requests, and network synchronization logic should be integrated by creating a concrete implementation of `ReportRepository` (under `lib/repositories/`) and swapping it in `lib/main.dart` inside the `MultiProvider` configuration.

---

## Getting Started

Follow these steps to set up and run the application on any development machine.

### Prerequisites

#### Windows Development Setup
1. **Flutter SDK**: Install Flutter version `^3.47.0` (stable channel) or later.
2. **Visual Studio**: Download and install [Visual Studio](https://visualstudio.microsoft.com/downloads/).
   - During installation, check the **"Desktop development with C++"** workload.
   - Ensure you enable the default options (MSVC, Windows SDK, CMake).
3. **Developer Mode**: Enable Developer Mode in Windows (Settings → Privacy & security → For developers → Developer Mode).

#### Android Development Setup
1. **Android Studio**: Install Android Studio and configure the Android toolchain.
2. Ensure you have the Android SDK Platform and Command-line tools installed.

### Setup Commands

1. **Verify environment setup**:
   ```bash
   flutter doctor
   ```
   Ensure Windows/Android/Web development environments are checked.

2. **Get dependencies**:
   ```bash
   flutter pub get
   ```

3. **Verify connected devices**:
   ```bash
   flutter devices
   ```

### Running the App

- **Run on Windows (Desktop)**:
  ```bash
  flutter run -d windows
  ```
- **Run on Android**:
  ```bash
  flutter run
  ```
- **Run on Chrome (Web)**:
  ```bash
  flutter run -d chrome
  ```

---

## Development Workflows

- **Hot Reload**: Press `r` in the terminal to inject code changes without losing the application state.
- **Hot Restart**: Press `R` in the terminal to restart the application, resetting state while keeping it running.
- **Static Analysis**: Run `flutter analyze` to check for syntax and type safety issues.
- **Unit Testing**: Run `flutter test` to execute all mock repository and model validation tests.

---

## Directory Structure

```
flutter_field_app/
├── android/            - Native Android build setup
├── windows/            - Native Windows build setup
├── web/                - Web build setup
├── lib/
│   ├── main.dart       - Main entry point & Dependency Injection
│   ├── core/           - Theme details & constants
│   ├── models/         - Aligned with backend data schemas
│   ├── repositories/   - Abstract data boundaries (swappable)
│   ├── screens/        - Splash, Login, Home, Forms, List, Details
│   └── widgets/        - Reusable stat cards, status timelines, responsive scaffolds
├── test/               - Mock data unit tests
└── pubspec.yaml        - App dependency configurations
```
