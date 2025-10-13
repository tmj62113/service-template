#!/bin/bash

# ==================================================================
# Template Validation Script
# ==================================================================
# Run this script before cloning the template for a new client
# to ensure everything is working correctly.
#
# Usage: ./validate-template.sh
# ==================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Output functions
print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

print_section() {
    echo ""
    echo "${BLUE}▶ $1${NC}"
    echo "------------------------------------------"
}

print_success() {
    echo "${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_fail() {
    echo "${RED}✗${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_warning() {
    echo "${YELLOW}⚠${NC} $1"
    ((WARNING_CHECKS++))
}

print_info() {
    echo "  $1"
}

# ==================================================================
# VALIDATION CHECKS
# ==================================================================

print_header "🚀 WHITELABEL E-COMMERCE TEMPLATE VALIDATION"
echo "Starting validation checks..."
echo "Timestamp: $(date)"

# ------------------------------------------------------------------
# 1. Environment & Dependencies Check
# ------------------------------------------------------------------
print_section "1. Environment & Dependencies"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_fail "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_fail "npm not installed"
fi

# Check dependencies
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_fail "node_modules directory missing - run 'npm install'"
fi

# Check .env file
if [ -f ".env" ]; then
    print_success ".env file exists"

    # Check for required environment variables
    REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET" "RESEND_API_KEY" "CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET")

    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env; then
            VALUE=$(grep "^${VAR}=" .env | cut -d '=' -f2)
            if [ -n "$VALUE" ] && [ "$VALUE" != "your_value_here" ]; then
                print_success "  $VAR is set"
            else
                print_fail "  $VAR is not configured"
            fi
        else
            print_fail "  $VAR is missing from .env"
        fi
    done
else
    print_fail ".env file missing"
    print_info "Create .env file from .env.example"
fi

# ------------------------------------------------------------------
# 2. Test Suite Validation
# ------------------------------------------------------------------
print_section "2. Running Test Suite"

print_info "Running all tests..."
if npm run test:run > /dev/null 2>&1; then
    TEST_OUTPUT=$(npm run test:run 2>&1)
    TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -o "Tests.*passed" | head -1)
    print_success "All tests passing: $TEST_COUNT"
else
    print_fail "Some tests are failing"
    print_info "Run 'npm run test:run' to see details"
fi

# ------------------------------------------------------------------
# 3. File Structure Validation
# ------------------------------------------------------------------
print_section "3. File Structure"

# Key files
KEY_FILES=(
    "server.js"
    "package.json"
    ".env.example"
    "vite.config.js"
    "src/main.jsx"
    "src/App.jsx"
    "src/config/theme.js"
    "src/styles/design-system.css"
    "src/styles/template.css"
    "src/styles/client.css"
    "NEW_CLIENT.md"
    "CSS_CUSTOMIZATION.md"
    ".claude/CLAUDE.md"
)

for FILE in "${KEY_FILES[@]}"; do
    if [ -f "$FILE" ] || [ -d "$FILE" ]; then
        print_success "$FILE exists"
    else
        print_fail "$FILE missing"
    fi
done

# ------------------------------------------------------------------
# 4. Build Validation
# ------------------------------------------------------------------
print_section "4. Build Check"

print_info "Running production build..."
if npm run build > /dev/null 2>&1; then
    print_success "Production build successful"
    if [ -d "dist" ]; then
        print_success "dist/ directory created"
    fi
else
    print_fail "Production build failed"
    print_info "Run 'npm run build' to see errors"
fi

# ------------------------------------------------------------------
# 5. Documentation Validation
# ------------------------------------------------------------------
print_section "5. Documentation"

# Check documentation files
DOC_FILES=(
    "README.md"
    "NEW_CLIENT.md"
    "CSS_CUSTOMIZATION.md"
    "SETUP.md"
)

for DOC in "${DOC_FILES[@]}"; do
    if [ -f "$DOC" ]; then
        print_success "$DOC exists"

        # Check if file is not empty
        if [ -s "$DOC" ]; then
            WORD_COUNT=$(wc -w < "$DOC" | xargs)
            print_info "  $WORD_COUNT words"
        else
            print_warning "  $DOC is empty"
        fi
    else
        print_fail "$DOC missing"
    fi
done

# ------------------------------------------------------------------
# 6. Git Repository Check
# ------------------------------------------------------------------
print_section "6. Git Repository"

if [ -d ".git" ]; then
    print_success "Git repository initialized"

    # Check for uncommitted changes
    if git diff-index --quiet HEAD --; then
        print_success "No uncommitted changes"
    else
        print_warning "There are uncommitted changes"
        print_info "Commit changes before cloning for new client"
    fi

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"

    # Count commits
    COMMIT_COUNT=$(git rev-list --count HEAD)
    print_info "Total commits: $COMMIT_COUNT"
else
    print_warning "Not a git repository"
fi

# ------------------------------------------------------------------
# 7. Package.json Validation
# ------------------------------------------------------------------
print_section "7. Package Configuration"

if [ -f "package.json" ]; then
    print_success "package.json exists"

    # Check scripts
    REQUIRED_SCRIPTS=("dev" "build" "test" "test:run")
    for SCRIPT in "${REQUIRED_SCRIPTS[@]}"; do
        if grep -q "\"$SCRIPT\":" package.json; then
            print_success "  Script '$SCRIPT' defined"
        else
            print_fail "  Script '$SCRIPT' missing"
        fi
    done
else
    print_fail "package.json missing"
fi

# ------------------------------------------------------------------
# 8. Security Audit
# ------------------------------------------------------------------
print_section "8. Security Audit"

print_info "Running npm audit..."
AUDIT_OUTPUT=$(npm audit 2>&1)

if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    print_success "No security vulnerabilities found"
elif echo "$AUDIT_OUTPUT" | grep -q "vulnerabilities"; then
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o "[0-9]* vulnerabilities" | head -1)
    print_warning "Security vulnerabilities found: $VULN_COUNT"
    print_info "Run 'npm audit fix' to fix automatically"
else
    print_info "Could not determine security status"
fi

# ------------------------------------------------------------------
# 9. Style Guide Validation
# ------------------------------------------------------------------
print_section "9. Design System"

# Check style guide component
if [ -f "src/pages/StyleGuide.jsx" ]; then
    print_success "StyleGuide component exists"
else
    print_fail "StyleGuide component missing"
fi

# Check CSS files
CSS_FILES=(
    "src/styles/design-system.css"
    "src/styles/template.css"
    "src/styles/client.css"
)

for CSS_FILE in "${CSS_FILES[@]}"; do
    if [ -f "$CSS_FILE" ]; then
        print_success "$CSS_FILE exists"
        LINE_COUNT=$(wc -l < "$CSS_FILE" | xargs)
        print_info "  $LINE_COUNT lines"
    else
        print_fail "$CSS_FILE missing"
    fi
done

# ------------------------------------------------------------------
# 10. Database Models Check
# ------------------------------------------------------------------
print_section "10. Database Models"

MODEL_FILES=(
    "db/models/Product.js"
    "db/models/Order.js"
    "db/models/User.js"
    "db/connection.js"
)

for MODEL in "${MODEL_FILES[@]}"; do
    if [ -f "$MODEL" ]; then
        print_success "$MODEL exists"
    else
        print_fail "$MODEL missing"
    fi
done

# ==================================================================
# SUMMARY
# ==================================================================

print_header "📊 VALIDATION SUMMARY"

echo "Total Checks:   $TOTAL_CHECKS"
echo "${GREEN}Passed:${NC}         $PASSED_CHECKS"
echo "${RED}Failed:${NC}         $FAILED_CHECKS"
echo "${YELLOW}Warnings:${NC}       $WARNING_CHECKS"
echo ""

# Calculate percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    PASS_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo "Success Rate:   ${PASS_PERCENTAGE}%"
    echo ""
fi

# Final verdict
if [ $FAILED_CHECKS -eq 0 ]; then
    echo "${GREEN}✓ VALIDATION PASSED${NC}"
    echo ""
    echo "✨ Template is ready to be cloned for new clients!"
    echo ""
    echo "Next Steps:"
    echo "  1. Clone this repo for your new client"
    echo "  2. Follow NEW_CLIENT.md setup guide"
    echo "  3. Customize theme.js with client branding"
    echo "  4. Test the complete order flow"
    echo ""
    exit 0
else
    echo "${RED}✗ VALIDATION FAILED${NC}"
    echo ""
    echo "⚠️  Please fix the failed checks before using this template."
    echo ""
    echo "Common fixes:"
    echo "  • Run 'npm install' if dependencies are missing"
    echo "  • Create .env file from .env.example"
    echo "  • Run 'npm run test:run' to fix failing tests"
    echo ""
    exit 1
fi
