#!/bin/bash

# =====================================================
# Whitelabel E-commerce Setup Script
# =====================================================
# Interactive script to help set up a new store instance
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN} $1${NC}"
}

print_error() {
    echo -e "${RED} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  $1${NC}"
}

print_info() {
    echo -e "${BLUE}9 $1${NC}"
}

# Welcome message
clear
print_header "Whitelabel E-commerce Setup Wizard"
echo "This script will help you set up your new e-commerce store."
echo "Press CTRL+C at any time to cancel."
echo ""
read -p "Press Enter to continue..."

# =====================================================
# Step 1: Check Prerequisites
# =====================================================
print_header "Step 1: Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check Stripe CLI
if command -v stripe &> /dev/null; then
    STRIPE_VERSION=$(stripe --version)
    print_success "Stripe CLI installed: $STRIPE_VERSION"
else
    print_warning "Stripe CLI not found. You'll need this for webhook testing."
    echo "Install with: brew install stripe/stripe-cli/stripe (on Mac)"
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git installed: $GIT_VERSION"
else
    print_warning "Git not found. Recommended for version control."
fi

echo ""
read -p "All prerequisites checked. Press Enter to continue..."

# =====================================================
# Step 2: Install Dependencies
# =====================================================
print_header "Step 2: Installing Dependencies"

if [ -d "node_modules" ]; then
    print_info "node_modules directory already exists."
    read -p "Reinstall dependencies? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Skipping dependency installation"
    fi
else
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

echo ""
read -p "Press Enter to continue..."

# =====================================================
# Step 3: Environment Configuration
# =====================================================
print_header "Step 3: Environment Configuration"

if [ -f ".env" ]; then
    print_warning ".env file already exists!"
    read -p "Overwrite existing .env? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
        echo ""
        read -p "Press Enter to continue..."
    else
        cp .env.example .env
        print_success "Created .env from .env.example"
    fi
else
    cp .env.example .env
    print_success "Created .env from .env.example"
fi

print_info "You'll need to configure the following services:"
echo ""
echo "  1. MongoDB Atlas - Database"
echo "  2. Stripe - Payment processing"
echo "  3. Resend - Email service"
echo "  4. Cloudinary - Image uploads"
echo ""

read -p "Do you want to configure these now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # MongoDB Configuration
    print_header "MongoDB Configuration"
    print_info "Get your connection string from: https://cloud.mongodb.com/"
    read -p "Enter MongoDB URI (or press Enter to skip): " MONGODB_URI
    if [ ! -z "$MONGODB_URI" ]; then
        sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI|" .env
        print_success "MongoDB URI saved"
    fi

    read -p "Enter database name [ecommerce]: " MONGODB_DB_NAME
    MONGODB_DB_NAME=${MONGODB_DB_NAME:-ecommerce}
    sed -i.bak "s|MONGODB_DB_NAME=.*|MONGODB_DB_NAME=$MONGODB_DB_NAME|" .env
    print_success "Database name saved: $MONGODB_DB_NAME"

    # Stripe Configuration
    print_header "Stripe Configuration"
    print_info "Get your secret key from: https://dashboard.stripe.com/test/apikeys"
    read -p "Enter Stripe Secret Key (or press Enter to skip): " STRIPE_SECRET_KEY
    if [ ! -z "$STRIPE_SECRET_KEY" ]; then
        sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" .env
        print_success "Stripe secret key saved"
    fi

    # Resend Configuration
    print_header "Resend Configuration"
    print_info "Get your API key from: https://resend.com/api-keys"
    read -p "Enter Resend API Key (or press Enter to skip): " RESEND_API_KEY
    if [ ! -z "$RESEND_API_KEY" ]; then
        sed -i.bak "s|RESEND_API_KEY=.*|RESEND_API_KEY=$RESEND_API_KEY|" .env
        print_success "Resend API key saved"
    fi

    # Cloudinary Configuration
    print_header "Cloudinary Configuration"
    print_info "Get your credentials from: https://console.cloudinary.com/"
    read -p "Enter Cloudinary Cloud Name (or press Enter to skip): " CLOUDINARY_CLOUD_NAME
    if [ ! -z "$CLOUDINARY_CLOUD_NAME" ]; then
        sed -i.bak "s|CLOUDINARY_CLOUD_NAME=.*|CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME|" .env
        print_success "Cloudinary cloud name saved"
    fi

    read -p "Enter Cloudinary API Key (or press Enter to skip): " CLOUDINARY_API_KEY
    if [ ! -z "$CLOUDINARY_API_KEY" ]; then
        sed -i.bak "s|CLOUDINARY_API_KEY=.*|CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY|" .env
        print_success "Cloudinary API key saved"
    fi

    read -p "Enter Cloudinary API Secret (or press Enter to skip): " CLOUDINARY_API_SECRET
    if [ ! -z "$CLOUDINARY_API_SECRET" ]; then
        sed -i.bak "s|CLOUDINARY_API_SECRET=.*|CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET|" .env
        print_success "Cloudinary API secret saved"
    fi

    # JWT Secret
    print_header "JWT Secret Generation"
    print_info "Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    print_success "JWT secret generated and saved"

    # Clean up backup files
    rm -f .env.bak

    print_success "Environment configuration complete!"
else
    print_warning "Skipped environment configuration."
    print_info "Please manually edit .env before starting the servers."
fi

echo ""
read -p "Press Enter to continue..."

# =====================================================
# Step 4: Branding Configuration
# =====================================================
print_header "Step 4: Branding Configuration"

print_info "You should customize the branding in: src/config/theme.js"
echo ""
echo "Things to update:"
echo "  - Brand name and tagline"
echo "  - Company information and contact details"
echo "  - Social media links"
echo "  - Color scheme"
echo "  - Logo and favicon"
echo ""

read -p "Do you want to open theme.js now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code src/config/theme.js
        print_success "Opened theme.js in VS Code"
    elif command -v nano &> /dev/null; then
        nano src/config/theme.js
    else
        print_info "Please manually open: src/config/theme.js"
    fi
fi

echo ""
read -p "Press Enter to continue..."

# =====================================================
# Step 5: Next Steps
# =====================================================
print_header "Setup Complete!"

echo ""
print_success "Basic setup is complete!"
echo ""
print_info "Next steps:"
echo ""
echo "  1. Start the backend server:"
echo "     ${YELLOW}node server.js${NC}"
echo ""
echo "  2. In a new terminal, start the frontend:"
echo "     ${YELLOW}npm run dev${NC}"
echo ""
echo "  3. In a third terminal, start Stripe webhooks:"
echo "     ${YELLOW}stripe listen --forward-to localhost:3001/api/webhook${NC}"
echo ""
echo "  4. Copy the webhook secret and add to .env as STRIPE_WEBHOOK_SECRET"
echo ""
echo "  5. Restart the backend server"
echo ""
print_info "For detailed instructions, see: ${YELLOW}SETUP.md${NC}"
print_info "For deployment instructions, see: ${YELLOW}DEPLOYMENT.md${NC}"
echo ""

read -p "Do you want to start the backend server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting backend server..."
    print_warning "Press CTRL+C to stop the server"
    echo ""
    node server.js
else
    print_info "Setup wizard complete. Happy building! =€"
fi
