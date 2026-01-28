# Knight's Tour Visualizer

A browser-based application that visualizes the Knight's Tour problem with both auto-solve and manual play modes.

- **Demo**: [knightstour.shalusri.com](https://knightstour.shalusri.com)
- **Code**: [github.com/knightsri/KnightsTour](https://github.com/knightsri/KnightsTour)

## ✨ Features

- **Auto-Solve Mode**: Hybrid solver using Warnsdorff's heuristic with Pohl's tie-breaker, plus backtracking fallback for 100% success from any starting square.
- **Manual Mode**: Try to visit all 64 squares yourself. Includes valid move highlighting and "stuck" detection.
- **Visual Path Trace**: A dynamic line traces the knight's journey, making it easy to see the path taken.
- **Move History**: Scrollable history panel tracks every jump in algebraic notation.
- **Statistics**: Live timer, move counter, solver method display, and backtrack count.
- **Responsive Design**: Polished, responsive UI with glassmorphism effects that works on desktop and mobile.
- **Dockerized**: Fully containerized setup - no local Node.js environment required.

## 🚀 Running the App

### Using Docker (Recommended)

This project is optimized for Docker. No local `node` or `npm` is needed.

1.  Build and run the container:
    ```bash
    docker-compose up --build -d
    ```
2.  Open your browser to: **[http://localhost:3000](http://localhost:3000)**

### Local Development (Optional)

If you have Node.js installed and prefer to develop locally:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the dev server:
    ```bash
    npm run dev
    ```

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Animation**: Framer Motion
*   **Deployment**: Nginx (via Docker)
