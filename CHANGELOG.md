# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Fixed
- **UI Render Crash**: Resolved a critical `Cannot convert object to primitive value` Native TypeError that would completely crash the React tree. This issue was triggered by `React.lazy` loading an invalid default module export (usually a Vite error overlay module or missing `export default`). 
- **Lazy Load Safety**: Safely encapsulated all lazily loaded UI components (`App.tsx`, `CinemaLayout.tsx`) with `.then(m => ({ default: m.default || m }))` to ensure graceful fallback if the module namespace object is malformed, preventing uncatchable String conversion errors.
