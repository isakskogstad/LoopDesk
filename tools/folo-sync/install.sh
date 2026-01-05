#!/bin/bash
#
# Folo Sync Daemon - Quick Install Script
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash
#   or
#   ./install.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.config/folo-sync"
LOG_DIR="$HOME/Library/Logs/folo-sync"
LAUNCH_AGENTS="$HOME/Library/LaunchAgents"
LABEL="com.loopdesk.folo-sync"

echo "==================================="
echo "  Folo Sync Daemon Installer"
echo "==================================="
echo ""

# Check prerequisites
check_prereqs() {
    echo "[1/5] Checking prerequisites..."

    if ! command -v node &> /dev/null; then
        echo "ERROR: Node.js is not installed."
        echo "Install with: brew install node"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "ERROR: Node.js 18+ required (found v$NODE_VERSION)"
        exit 1
    fi

    echo "  - Node.js: $(node -v)"

    FOLO_PATH="$HOME/Library/Containers/is.follow/Data/Library/Application Support/Folo"
    if [ ! -d "$FOLO_PATH" ]; then
        echo "  - WARNING: Folo app not found"
    else
        echo "  - Folo: Found"
    fi
}

# Get configuration
get_config() {
    echo ""
    echo "[2/5] Configuration..."

    if [ -z "$FOLO_SYNC_API_KEY" ]; then
        read -p "  Enter FOLO_SYNC_API_KEY: " FOLO_SYNC_API_KEY
    fi

    if [ -z "$LOOPDESK_USER_EMAIL" ]; then
        read -p "  Enter LoopDesk email: " LOOPDESK_USER_EMAIL
    fi

    if [ -z "$LOOPDESK_API_URL" ]; then
        LOOPDESK_API_URL="https://loopdesk-production.up.railway.app"
    fi

    if [ -z "$FOLO_SYNC_API_KEY" ] || [ -z "$LOOPDESK_USER_EMAIL" ]; then
        echo "ERROR: API key and email are required"
        exit 1
    fi
}

# Install files
install_files() {
    echo ""
    echo "[3/5] Installing files..."

    # Create directories
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$LAUNCH_AGENTS"

    # Copy files
    cp "$SCRIPT_DIR/daemon.js" "$INSTALL_DIR/"
    cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"

    echo "  - Files copied to $INSTALL_DIR"

    # Install dependencies
    echo "  - Installing npm dependencies..."
    cd "$INSTALL_DIR"
    npm install --production --silent
}

# Create and load launchd plist
setup_launchd() {
    echo ""
    echo "[4/5] Setting up launchd..."

    NODE_PATH=$(which node)
    PLIST_PATH="$LAUNCH_AGENTS/$LABEL.plist"

    cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$INSTALL_DIR/daemon.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$INSTALL_DIR</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>FOLO_SYNC_API_KEY</key>
        <string>$FOLO_SYNC_API_KEY</string>
        <key>LOOPDESK_USER_EMAIL</key>
        <string>$LOOPDESK_USER_EMAIL</string>
        <key>LOOPDESK_API_URL</key>
        <string>$LOOPDESK_API_URL</string>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>ThrottleInterval</key>
    <integer>60</integer>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/folo-sync.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/folo-sync.error.log</string>
    <key>Nice</key>
    <integer>10</integer>
    <key>LowPriorityIO</key>
    <true/>
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF

    echo "  - Created $PLIST_PATH"

    # Unload if already loaded
    launchctl unload "$PLIST_PATH" 2>/dev/null || true

    # Load daemon
    launchctl load "$PLIST_PATH"
    echo "  - Daemon loaded"
}

# Show summary
show_summary() {
    echo ""
    echo "[5/5] Installation complete!"
    echo ""
    echo "==================================="
    echo "  Summary"
    echo "==================================="
    echo ""
    echo "  Install dir: $INSTALL_DIR"
    echo "  Logs:        $LOG_DIR/folo-sync.log"
    echo "  Status:      launchctl list | grep folo-sync"
    echo ""
    echo "  The daemon is now running and will start automatically on login."
    echo ""
    echo "  View logs:"
    echo "    tail -f $LOG_DIR/folo-sync.log"
    echo ""
    echo "  Uninstall:"
    echo "    launchctl unload $LAUNCH_AGENTS/$LABEL.plist"
    echo "    rm -rf $INSTALL_DIR"
    echo ""
}

# Main
check_prereqs
get_config
install_files
setup_launchd
show_summary
