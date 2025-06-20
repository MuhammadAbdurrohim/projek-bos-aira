# Airastore API CMS Admin Panel

[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-13.x-000000?logo=next.js)](https://nextjs.org)
[![Android](https://img.shields.io/badge/Android-7.0+-3DDC84?logo=android)](https://developer.android.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive e-commerce platform with live streaming capabilities, built using Laravel (backend), Next.js (React Admin Panel), and Android mobile app integration.

### Project Status
![Status](https://img.shields.io/badge/Status-Active-success)
![PHP](https://img.shields.io/badge/PHP->8.1-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Kotlin](https://img.shields.io/badge/Kotlin-1.8-7F52FF?logo=kotlin)

### Requirements
- PHP 8.1 or higher
- Node.js 16.x or higher
- MySQL 8.0 or higher
- Android Studio (latest version)
- Composer 2.x
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/airastore.git

# Backend setup
cd airastore-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend setup (in new terminal)
cd airastore-api
npm install
cp .env.example .env.local
npm run dev

# Android setup
# Open android-airastore in Android Studio
# Update local.properties with your API URL
# Run the app in an emulator or device
```

Visit:
- Admin Panel: http://localhost:3000
- API Documentation: http://localhost:8000/api/docs
- API Base URL: http://localhost:8000/api

Default Admin Credentials:
- Email: admin@airastore.com
- Password: password

### Demo & Screenshots

#### Admin Dashboard
```
┌─ Dashboard Overview ─────┐  ┌─ Live Stream Management ─┐
│                         │  │                          │
│   [Screenshot of main   │  │  [Screenshot of live     │
│    dashboard stats]     │  │   streaming interface]   │
│                         │  │                          │
└─────────────────────────┘  └──────────────────────────┘

┌─ Product Management ────┐  ┌─ Order Processing ───────┐
│                         │  │                          │
│   [Screenshot of        │  │  [Screenshot of order    │
│    product listing]     │  │   management interface]  │
│                         │  │                          │
└─────────────────────────┘  └──────────────────────────┘
```

#### Mobile App
```
┌─ Live Stream View ──────┐  ┌─ Product Details ────────┐
│                         │  │                          │
│   [Screenshot of        │  │  [Screenshot of product  │
│    mobile streaming]    │  │   detail page]          │
│                         │  │                          │
└─────────────────────────┘  └──────────────────────────┘
```

Key Features Demonstrated:
- Real-time product showcase during streams
- Interactive chat with reactions
- Order processing workflow
- Mobile-responsive design
- Multi-platform synchronization

[Note: Replace the placeholder boxes with actual screenshots of your running application]

### Development Roadmap

#### Current Release (v1.0.0)
✅ Core Features
- [x] User authentication & authorization
- [x] Product management system
- [x] Basic live streaming functionality
- [x] Order processing
- [x] Mobile app integration

#### Next Release (v1.1.0) - Q1 2024
🚧 In Progress
- [ ] Advanced stream analytics
- [ ] Multi-vendor support
- [ ] Payment gateway integration
- [ ] Enhanced mobile notifications
- [ ] Performance optimizations

#### Future Plans (v2.0.0) - Q2 2024
📋 Planned
- [ ] AI-powered product recommendations
- [ ] Social features integration
- [ ] Advanced inventory management
- [ ] Multi-language support
- [ ] Mobile app for iOS

#### Long-term Vision
🎯 Strategic Goals
- Global marketplace expansion
- AI/ML integration for personalization
- Enhanced social commerce features
- Cross-platform compatibility
- Blockchain integration for payments

### API Documentation

#### Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/user
```

#### Products
```http
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
```

#### Live Streaming
```http
GET    /api/live-streams
POST   /api/live-streams
GET    /api/live-streams/{id}
PUT    /api/live-streams/{id}/start
PUT    /api/live-streams/{id}/end
POST   /api/live-streams/{id}/products
GET    /api/live-streams/{id}/analytics
```

#### Orders
```http
GET    /api/orders
POST   /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}/status
POST   /api/orders/{id}/payment-confirmation
```

#### Payment
```http
GET    /api/payment-accounts
POST   /api/payment-accounts
GET    /api/payment-confirmations
PUT    /api/payment-confirmations/{id}/verify
```

#### Response Format
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        // Response data here
    },
    "errors": null
}
```

#### Error Response
```json
{
    "success": false,
    "message": "Operation failed",
    "data": null,
    "errors": {
        "field": ["Error message"]
    }
}
```

For detailed API documentation, visit: http://localhost:8000/api/docs

### Testing

#### Backend Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run with coverage report
php artisan test --coverage
```

#### Frontend Testing
```bash
# Run Jest tests
npm run test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run cypress
```

#### Android Testing
```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Run specific test class
./gradlew test --tests "com.airastore.app.ExampleTest"
```

#### Test Coverage Requirements
- Backend: Minimum 80% coverage
- Frontend: Minimum 70% coverage
- Android: Minimum 70% coverage

#### Continuous Integration
- GitHub Actions workflow for automated testing
- Tests run on every pull request
- Coverage reports generated automatically
- Integration with SonarQube for code quality

#### Manual Testing Checklist
- [ ] Cross-browser compatibility
- [ ] Responsive design on various devices
- [ ] Live streaming functionality
- [ ] Payment processing flow
- [ ] User authentication flows
- [ ] Error handling scenarios
- [ ] Performance under load

### Performance Optimization

#### Backend Optimization
- Database Indexing:
  ```sql
  -- Example indexes for common queries
  CREATE INDEX idx_products_category ON products(category_id);
  CREATE INDEX idx_orders_user ON orders(user_id, created_at);
  CREATE INDEX idx_live_streams_status ON live_streams(status, scheduled_at);
  ```

- Caching Strategy:
  ```php
  // Redis caching for frequently accessed data
  Cache::remember('products', 3600, function () {
      return Product::active()->get();
  });
  ```

- Queue Configuration:
  ```env
  QUEUE_CONNECTION=redis
  REDIS_QUEUE=default
  QUEUE_TIMEOUT=90
  ```

#### Frontend Optimization
- Code Splitting:
  ```javascript
  // Dynamic imports for route-based code splitting
  const LiveStream = dynamic(() => import('@/components/live-stream/stream-player'), {
    loading: () => <LoadingSpinner />
  });
  ```

- Image Optimization:
  ```jsx
  // Using Next.js Image component with optimization
  <Image
    src="/product.jpg"
    width={800}
    height={600}
    placeholder="blur"
    priority={true}
  />
  ```

- Bundle Size Optimization:
  ```bash
  # Analyze bundle size
  npm run analyze
  
  # Tree shaking unused code
  npm run build
  ```

#### Mobile Optimization
- Image Loading:
  ```kotlin
  // Using Glide with caching
  Glide.with(context)
      .load(imageUrl)
      .diskCacheStrategy(DiskCacheStrategy.ALL)
      .placeholder(R.drawable.placeholder)
      .into(imageView)
  ```

- Memory Management:
  ```kotlin
  // Implementing ViewBinding with lifecycle
  private var _binding: ActivityMainBinding? = null
  private val binding get() = _binding!!
  
  override fun onDestroy() {
      super.onDestroy()
      _binding = null
  }
  ```

#### Live Streaming Optimization
- Adaptive Bitrate:
  ```javascript
  const streamConfig = {
    videoQuality: {
      width: 1280,
      height: 720,
      bitrate: 1500,
      frameRate: 30,
      adaptiveBitrate: true
    }
  };
  ```

- Connection Handling:
  ```javascript
  const handleNetworkChange = (event) => {
    if (event.type === 'slow-network') {
      reduceStreamQuality();
    }
  };
  ```

#### Monitoring Tools
- Server Monitoring:
  - Laravel Telescope for debugging
  - New Relic for performance monitoring
  - Prometheus for metrics collection

- Frontend Monitoring:
  - Sentry for error tracking
  - Google Analytics for user behavior
  - Lighthouse for performance metrics

- Mobile Analytics:
  - Firebase Analytics
  - Crashlytics for crash reporting
  - Performance Monitoring

### Security Measures

#### Authentication & Authorization
```php
// API Authentication with Laravel Sanctum
protected $middleware = [
    'auth:sanctum',
    \App\Http\Middleware\VerifyCsrfToken::class,
];

// Role-based Authorization
public function update(Request $request, Product $product)
{
    $this->authorize('update', $product);
    // Update logic here
}
```

#### Data Protection
```php
// Encryption at Rest
protected $encryptable = [
    'payment_details',
    'personal_info'
];

// Secure File Storage
Storage::disk('s3')->put(
    $path, 
    $file, 
    ['encryption' => 'AES256']
);
```

#### Frontend Security
```typescript
// XSS Prevention
const config = {
    headers: {
        'Content-Security-Policy': "default-src 'self'",
        'X-XSS-Protection': '1; mode=block',
        'X-Frame-Options': 'SAMEORIGIN'
    }
};

// Secure Form Handling
const handleSubmit = async (data: FormData) => {
    const sanitizedData = DOMPurify.sanitize(data);
    await api.post('/endpoint', sanitizedData);
};
```

#### Mobile Security
```kotlin
// Secure Storage
private val encryptedPrefs by lazy {
    EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
}

// Certificate Pinning
val client = OkHttpClient.Builder()
    .certificatePinner(
        CertificatePinner.Builder()
            .add("api.airastore.com", "sha256/XXXX")
            .build()
    )
    .build()
```

#### Live Stream Security
```typescript
// Secure Stream Token Generation
const generateStreamToken = (userId: string): string => {
    return jwt.sign(
        { userId, timestamp: Date.now() },
        process.env.STREAM_SECRET,
        { expiresIn: '1h' }
    );
};

// Stream Access Control
const validateStreamAccess = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // Validation logic
};
```

#### Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Rate limiting on APIs
- Input validation on all endpoints
- Secure password hashing (Bcrypt)
- Two-factor authentication
- Session management
- HTTPS enforcement
- Regular backups with encryption
- Security monitoring and logging

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Android Setup](#android-setup)
  - [Configuration](#configuration)
    - [Core Setup](#core-setup)
    - [Live Streaming](#live-streaming-configuration)
    - [Payment System](#payment-configuration)
- [Project Structure](#project-structure)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Organization](#frontend-organization)
  - [Android Components](#android-components)
- [Quick Start](#quick-start)
- [Demo & Screenshots](#demo--screenshots)
- [Development Roadmap](#development-roadmap)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Security Measures](#security-measures)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License & Support](#license--support)

### Project Structure

#### Backend Architecture
```
airastore-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── ZegoTokenController.php
│   │   │   │   ├── PaymentConfirmationController.php
│   │   │   │   └── PaymentAccountController.php
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   └── Order.php
│   └── Services/
├── database/
│   └── migrations/
└── routes/
    └── api.php

#### Frontend Organization
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.jsx
│   ├── dashboard/
│   │   ├── live-stream/
│   │   ├── produk/
│   │   └── layout.jsx
│   └── live/
├── components/
│   ├── live-stream/
│   │   ├── stream-player.tsx
│   │   ├── product-showcase.tsx
│   │   └── stream-chat.tsx
│   └── ui/
└── lib/
    ├── api.js
    ├── utils.ts
    └── hooks.ts
```

#### Android Components
```
android-airastore/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/airastore/app/
│           │   ├── api/
│           │   │   └── ApiConfig.kt
│           │   ├── services/
│           │   │   └── ZegoLiveHelper.kt
│           │   ├── views/
│           │   │   ├── LiveStreamActivity.kt
│           │   │   └── ProductDetailActivity.kt
│           │   └── fragments/
│           └── res/
│               ├── layout/
│               │   ├── activity_live_stream.xml
│               │   └── fragment_home.xml
│               └── navigation/
│                   └── nav_graph.xml
```

Each component follows established architectural patterns:
- Backend: Laravel MVC with Service Layer
- Frontend: Next.js Pages Router with Component-based Architecture
- Android: MVVM with Clean Architecture

Key Design Principles:
- Separation of Concerns
- SOLID Principles
- DRY (Don't Repeat Yourself)
- Clean Code Guidelines

Directory Structure Highlights:
- Backend: Controllers handle business logic, Models define data structure
- Frontend: Pages for routing, Components for UI, Lib for utilities
- Android: Activities for screens, Fragments for UI components

Development Guidelines:
- Follow consistent naming conventions
- Write comprehensive unit tests
- Document complex logic and APIs
- Regular code reviews and refactoring
- Performance optimization at each layer

## Overview

Airastore is a modern e-commerce platform that revolutionizes online shopping through interactive live streaming. It combines traditional e-commerce features with real-time engagement capabilities, creating an immersive shopping experience.

### Core Components

#### Backend (Laravel API)
- RESTful API architecture
- Real-time WebSocket integration
- Secure payment processing
- Media storage and streaming
- Authentication and authorization

#### Frontend (Next.js)
- Server-side rendering
- Dynamic routing
- Real-time updates
- Responsive design
- Interactive UI components

#### Mobile App (Android)
- Native Kotlin implementation
- Live streaming integration
- Push notifications
- Offline capabilities
- Secure transactions

### Key Features

#### E-commerce Capabilities
- Product Management & Categorization
- Order Processing & Tracking
- Secure Payment Integration
- Inventory Management
- Analytics Dashboard
- User Authentication & Authorization
- Mobile Responsiveness

#### Live Streaming Features
Powered by ZegoCloud:
- High-quality Video Streaming
- Real-time Chat & Reactions
- Product Showcase During Streams
- Stream Recording & Playback
- Network Quality Adaptation
- Performance Monitoring
- Multi-platform Support
- Low Latency Communication

#### Admin Dashboard
- Sales & Revenue Analytics
- Order Management
- Product Catalog Management
- User Management
- Live Stream Scheduling
- Content Moderation
- System Configuration

### Technology Stack

#### Core Technologies
- **Backend Framework**: Laravel 10 (PHP 8.2)
- **Frontend Framework**: Next.js 13 (React 18)
- **Mobile Platform**: Android (Kotlin)
- **Database**: MySQL 8.0
- **Cache Layer**: Redis

#### Live Streaming
- **Streaming SDK**: ZegoCloud
- **WebRTC Integration**
- **Real-time Messaging**
- **Media Processing**

#### Infrastructure
- **Cloud Storage**: AWS S3
- **CDN**: CloudFront
- **Server**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: New Relic

#### Development Tools
- **Version Control**: Git
- **API Testing**: Postman
- **Code Quality**: SonarQube
- **Documentation**: Swagger
- **Package Managers**: Composer, npm

### Analytics & Monitoring

#### Stream Analytics
- Real-time Viewer Metrics
  - Concurrent viewer count
  - Watch time duration
  - Peak viewer numbers
- Engagement Tracking
  - Chat activity rates
  - Reaction frequencies
  - Product interaction metrics
- Performance Metrics
  - Stream quality stats
  - Network performance
  - Error rate monitoring

#### Business Analytics
- Sales Performance
  - Revenue tracking
  - Conversion rates
  - Average order value
- User Behavior
  - Shopping patterns
  - Live stream engagement
  - Feature usage stats
- Platform Health
  - System performance
  - Error tracking
  - Resource utilization

### Content Moderation

#### Real-time Moderation
- **Chat Filtering**
  - Profanity detection
  - Spam prevention
  - Link control
  - Language detection
- **User Management**
  - Temporary muting
  - User banning
  - Warning system
  - Appeal process

#### Stream Moderation
- **Content Control**
  - Stream preview monitoring
  - Thumbnail verification
  - Product verification
  - Age restriction
- **Quality Assurance**
  - Stream quality checks
  - Audio monitoring
  - Visual content screening
  - Technical compliance

#### Automated Systems
- **AI-powered Detection**
  - Inappropriate content
  - Suspicious behavior
  - Policy violations
  - Automated warnings
- **Reporting System**
  - User reports handling
  - Moderator escalation
  - Resolution tracking
  - Analytics dashboard

### Stream Configuration

#### Quality Settings
- **Video Configuration**
  - Resolution presets (720p, 1080p)
  - Bitrate management
  - Frame rate control
  - Aspect ratio settings
- **Audio Settings**
  - Sample rate options
  - Bitrate configuration
  - Echo cancellation
  - Noise suppression

#### Stream Customization
- **Visual Elements**
  - Custom overlays
  - Branding elements
  - Product showcase layout
  - Chat window position
- **Interactive Features**
  - Reaction animations
  - Poll overlays
  - Product highlights
  - Viewer counters

#### Technical Controls
- **Network Management**
  - Adaptive bitrate
  - Connection resilience
  - Fallback settings
  - CDN configuration
- **System Integration**
  - API endpoints
  - WebSocket connections
  - Event handlers
  - Error recovery

### Product Integration

#### Live Stream Commerce
- **Product Showcase**
  - Real-time product display
  - Dynamic pricing updates
  - Stock level indicators
  - Purchase countdown timers
- **Interactive Elements**
  - One-click purchase
  - Add to cart during stream
  - Product quick view
  - Size/variant selection

#### Product Management
- **Inventory Control**
  - Real-time stock updates
  - Reserved quantities
  - Low stock alerts
  - Automatic unpublish
- **Pricing Features**
  - Flash sale pricing
  - Bundle discounts
  - Stream-exclusive offers
  - Quantity-based pricing

#### Analytics Integration
- **Sales Tracking**
  - Stream conversion rates
  - Product performance
  - Viewer engagement
  - Purchase patterns
- **Inventory Analytics**
  - Stock movement
  - Popular variations
  - Restock predictions
  - Category performance

### Order Processing

#### Checkout System
- **Cart Management**
  - Real-time cart updates
  - Multi-item handling
  - Save for later
  - Quick checkout
- **Checkout Flow**
  - Guest checkout option
  - Address management
  - Shipping options
  - Order summary

#### Payment Integration
- **Payment Methods**
  - Credit/debit cards
  - Digital wallets
  - Bank transfers
  - COD options
- **Payment Processing**
  - Secure transactions
  - Payment confirmation
  - Refund handling
  - Invoice generation

#### Order Management
- **Order Tracking**
  - Real-time status updates
  - Shipping integration
  - Delivery estimates
  - Order history
- **Order Administration**
  - Status management
  - Order modification
  - Cancellation handling
  - Return processing

#### Customer Communication
- **Order Notifications**
  - Confirmation emails
  - Status updates
  - Shipping alerts
  - Delivery confirmation
- **Customer Support**
  - Order inquiries
  - Issue resolution
  - Return requests
  - Feedback collection

### Mobile Integration

#### Core Features
- **Live Stream Viewing**
  - HD video playback
  - Adaptive streaming
  - Picture-in-picture
  - Background audio
- **Shopping Experience**
  - Native product browsing
  - Quick purchase flow
  - Cart management
  - Order tracking

#### Platform Integration
- **Authentication**
  - Biometric login
  - Social sign-in
  - Session management
  - Secure storage
- **Data Sync**
  - Offline capabilities
  - Real-time updates
  - Cross-device sync
  - Background refresh

#### User Experience
- **UI Components**
  - Native gestures
  - Custom animations
  - Dark mode support
  - Responsive layouts
- **Performance**
  - Image optimization
  - Cache management
  - Memory efficiency
  - Battery optimization

## User Roles

### Administrator
- **System Management**
  - Platform configuration
  - User management
  - Role assignment
  - System monitoring
- **Content Control**
  - Content moderation
  - Stream management
  - Product approval
  - Category management
- **Analytics Access**
  - Performance metrics
  - Sales reports
  - User analytics
  - System health

### Merchant/Seller
- **Product Management**
  - Product listings
  - Inventory control
  - Price management
  - Category assignment
- **Live Streaming**
  - Stream scheduling
  - Live broadcasting
  - Product showcasing
  - Chat interaction
- **Order Handling**
  - Order processing
  - Shipping management
  - Payment tracking
  - Customer support

### Customer
- **Shopping Features**
  - Product browsing
  - Cart management
  - Order placement
  - Payment processing
- **Live Stream Access**
  - Stream viewing
  - Chat participation
  - Product interaction
  - Real-time purchase
- **Account Management**
  - Profile settings
  - Order history
  - Saved items
  - Payment methods

### Moderator
- **Stream Moderation**
  - Chat monitoring
  - Content filtering
  - User management
  - Report handling
- **Quality Control**
  - Stream quality
  - Content compliance
  - Technical support
  - Issue escalation

### Permission System

#### Access Levels
- **Super Admin**
  - Full system access
  - Role management
  - System configuration
  - API key management
- **Admin**
  - User management
  - Content moderation
  - Analytics access
  - Settings management
- **Moderator**
  - Stream monitoring
  - Content filtering
  - User reports
  - Chat moderation
- **Seller**
  - Product management
  - Stream management
  - Order processing
  - Analytics (own data)
- **Customer**
  - Profile management
  - Order placement
  - Stream viewing
  - Chat participation

#### Security Controls
- Role-based access control (RBAC)
- Multi-factor authentication
- Session management
- IP restrictions
- Activity logging
- Audit trails

### Payment System

#### Payment Methods
- **Digital Wallets**
  - PayPal
  - Google Pay
  - Apple Pay
  - Local e-wallets
- **Card Payments**
  - Credit cards
  - Debit cards
  - Virtual cards
  - Tokenization
- **Bank Transfers**
  - Direct bank transfer
  - Virtual accounts
  - SWIFT transfers
  - Local bank networks

#### Payment Processing
- **Transaction Flow**
  - Payment initiation
  - Verification process
  - Confirmation system
  - Refund handling
- **Security Measures**
  - PCI DSS compliance
  - 3D Secure
  - Fraud detection
  - Encryption

#### Financial Management
- **Accounting Integration**
  - Transaction records
  - Revenue tracking
  - Tax calculations
  - Financial reports
- **Settlement System**
  - Automated payouts
  - Split payments
  - Fee management
  - Currency conversion

### Live Streaming Management

#### Stream Administration
- **Stream Setup**
  - Schedule management
  - Quality settings
  - Thumbnail configuration
  - Product integration
- **Live Controls**
  - Stream start/stop
  - Quality monitoring
  - Viewer management
  - Chat moderation

#### Engagement Features
- **Interactive Elements**
  - Live chat system
  - Reaction system
  - Product showcasing
  - Polls and surveys
- **Social Features**
  - Share functionality
  - Follow/Subscribe
  - Notifications
  - Stream reminders

#### Analytics & Reporting
- **Real-time Metrics**
  - Viewer count
  - Engagement rates
  - Sales conversion
  - Chat activity
- **Performance Reports**
  - Stream duration
  - Peak viewership
  - Revenue generated
  - Product performance

#### Technical Infrastructure
- **Streaming Technology**
  - WebRTC integration
  - Low-latency delivery
  - Multi-bitrate support
  - Network adaptation
- **Storage & CDN**
  - Stream recording
  - VOD processing
  - Global distribution
  - Cache optimization

### Customer Experience

#### Shopping Interface
- **Product Discovery**
  - Smart search
  - Category navigation
  - Personalized recommendations
  - Featured products
- **Product Details**
  - High-quality images
  - Detailed descriptions
  - Reviews and ratings
  - Stock availability

#### Live Shopping Experience
- **Stream Interaction**
  - One-click purchase
  - Real-time chat
  - Product inquiries
  - Stream favorites
- **Social Features**
  - Follow sellers
  - Share streams
  - Save products
  - Wishlist management

#### Account Management
- **Profile Settings**
  - Personal information
  - Payment methods
  - Shipping addresses
  - Preferences
- **Order Management**
  - Order history
  - Track shipments
  - Return requests
  - Purchase analytics

#### Customer Support
- **Help Center**
  - FAQ section
  - Live chat support
  - Email support
  - Knowledge base
- **Issue Resolution**
  - Ticket system
  - Refund requests
  - Dispute handling
  - Feedback system

### Security & Compliance

#### Data Protection
- **User Privacy**
  - GDPR compliance
  - Data encryption
  - Privacy controls
  - Data portability
- **Information Security**
  - SSL/TLS encryption
  - Data backups
  - Access logging
  - Breach prevention

#### Authentication & Authorization
- **Access Control**
  - Multi-factor authentication
  - Role-based access
  - Session management
  - API security
- **Identity Management**
  - User verification
  - Password policies
  - Account recovery
  - Login monitoring

#### Compliance Framework
- **Standards**
  - PCI DSS
  - ISO 27001
  - OWASP guidelines
  - Local regulations
- **Audit & Reporting**
  - Security audits
  - Compliance reports
  - Risk assessments
  - Incident tracking

#### Infrastructure Security
- **Network Security**
  - Firewall protection
  - DDoS mitigation
  - Intrusion detection
  - Traffic monitoring
- **System Security**
  - Regular updates
  - Vulnerability scanning
  - Security patches
  - Penetration testing

## Prerequisites

### System Requirements
- **Backend**
  - PHP 8.2 or higher
  - Laravel 10.x
  - MySQL 8.0
  - Redis 6.x
  - Composer 2.x
- **Frontend**
  - Node.js 18.x or higher
  - npm 9.x
  - Next.js 13.x
  - React 18.x
- **Mobile**
  - Android Studio Arctic Fox
  - Kotlin 1.6.x
  - Gradle 7.x
  - JDK 11

### External Services
- **Cloud Services**
  - AWS S3 account
  - CloudFront CDN
  - ZegoCloud account
  - New Relic monitoring
- **Payment Services**
  - Payment gateway account
  - Merchant account
  - SSL certificate
  - PCI compliance

### Development Tools
- **Version Control**
  - Git 2.x
  - GitHub account
  - SSH key setup
- **IDE & Tools**
  - VSCode or PhpStorm
  - Postman
  - Docker (optional)
  - Database management tool

### Installation Guide

#### Backend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/airastore.git

# Install PHP dependencies
composer install

# Set up environment
cp .env.example .env
php artisan key:generate

# Configure database
php artisan migrate
php artisan db:seed

# Start development server
php artisan serve
```

#### Frontend Setup
```bash
# Install Node.js dependencies
cd frontend
npm install

# Start development server
npm run dev
```

#### Mobile Setup
```bash
# Open Android Studio
cd android-airastore
./gradlew build

# Run on emulator/device
./gradlew installDebug
```

#### Environment Configuration
1. Configure AWS credentials
2. Set up ZegoCloud API keys
3. Configure payment gateway
4. Set up SSL certificates

### Development Workflow

#### Code Standards
- **Backend**
  - PSR-12 coding standard
  - PHPUnit for testing
  - Laravel best practices
  - API documentation
- **Frontend**
  - ESLint configuration
  - Jest for testing
  - TypeScript standards
  - Component documentation
- **Mobile**
  - Kotlin coding conventions
  - Android architecture guidelines
  - Unit/UI testing
  - Documentation standards

#### Version Control
- **Branch Strategy**
  - main/master (production)
  - develop (staging)
  - feature/* (features)
  - hotfix/* (urgent fixes)
- **Commit Guidelines**
  - Conventional commits
  - Clear descriptions
  - Issue references
  - Change documentation

#### CI/CD Pipeline
- **Automated Testing**
  - Unit tests
  - Integration tests
  - E2E tests
  - Code coverage
- **Deployment Stages**
  - Development
  - Staging
  - Production
  - Rollback procedures

### Project Structure

#### Backend Architecture
```
airastore-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── api.php
```

#### Frontend Architecture
```
src/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   └── live/
├── components/
│   ├── ui/
│   └── live-stream/
├── lib/
│   ├── api.js
│   └── utils.js
└── middleware.js
```

#### Mobile Architecture
```
android-airastore/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── res/
│   │   └── test/
│   └── build.gradle
└── gradle/
```

#### Documentation Structure
```
docs/
├── api/
├── deployment/
├── development/
└── testing/
```

### Contributing

#### Getting Started
1. Fork the repository
2. Create a feature branch
3. Set up development environment
4. Make your changes
5. Write/update tests
6. Update documentation

#### Pull Request Process
1. **Branch Naming**
   - feature/feature-name
   - bugfix/bug-description
   - hotfix/urgent-fix
   - release/version-number

2. **Commit Messages**
   - Use conventional commits
   - Reference issues
   - Be descriptive
   - Keep it concise

3. **Code Review**
   - Follow review guidelines
   - Address feedback
   - Update as needed
   - Request re-review

4. **Quality Checks**
   - Run all tests
   - Update documentation
   - Check code style
   - Verify builds

#### Development Guidelines
- Follow coding standards
- Write unit tests
- Update documentation
- Keep PRs focused

### License

#### MIT License

Copyright (c) 2024 Airastore

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Support

For support and inquiries:
- GitHub Issues
- Documentation Wiki
- Community Forums
- Email Support

### Contact

#### Development Team
- **Lead Developer**
  - Email: lead@airastore.com
  - GitHub: [@airastore-lead](https://github.com/airastore-lead)

- **Frontend Team**
  - Email: frontend@airastore.com
  - Discord: #frontend-team

- **Backend Team**
  - Email: backend@airastore.com
  - Discord: #backend-team

- **Mobile Team**
  - Email: mobile@airastore.com
  - Discord: #mobile-team

#### Community
- Discord Server: [Join](https://discord.gg/airastore)
- Twitter: [@airastore](https://twitter.com/airastore)
- Blog: [blog.airastore.com](https://blog.airastore.com)
- YouTube: [Airastore Channel](https://youtube.com/airastore)

#### Business Inquiries
- Email: business@airastore.com
- Phone: +1 (555) 123-4567
- Location: San Francisco, CA

### Acknowledgments

#### Technologies
- **Frontend**
  - Next.js
  - React
  - TailwindCSS
  - TypeScript
- **Backend**
  - Laravel
  - MySQL
  - Redis
  - WebSocket
- **Mobile**
  - Kotlin
  - Android SDK
  - ZegoCloud SDK
  - Jetpack Components

#### Third-Party Services
- **Cloud Services**
  - AWS S3
  - CloudFront CDN
  - ZegoCloud
  - New Relic
- **Payment Processing**
  - Stripe
  - PayPal
  - Local Payment Gateways

#### Open Source Projects
We're grateful to these projects that helped make Airastore possible:
- Laravel Framework
- Next.js Framework
- TailwindCSS
- Android Jetpack
- And many more...

#### Community
Special thanks to our amazing community of:
- Contributors
- Beta Testers
- Early Adopters
- Documentation Writers

### Changelog

#### Version 1.0.0 (2024-01-15)
- **Initial Release**
  - Core e-commerce functionality
  - Live streaming features
  - Mobile app launch
  - Payment integration

#### Version 1.1.0 (2024-02-01)
- **Features**
  - Multi-vendor support
  - Enhanced analytics
  - Improved mobile UI
  - New payment methods
- **Bug Fixes**
  - Stream stability improvements
  - Payment processing fixes
  - Mobile app performance
  - UI/UX refinements

#### Version 1.2.0 (2024-03-01)
- **Features**
  - Social features
  - Advanced moderation
  - API improvements
  - Mobile notifications
- **Enhancements**
  - Stream quality upgrade
  - Search optimization
  - Cache management
  - Security updates

#### Upcoming (Version 1.3.0)
- Enhanced mobile features
- AI-powered recommendations
- Advanced analytics
- Performance optimizations

## Quick Start Guide

### Prerequisites Check
```bash
# Check PHP version
php -v  # Should be >= 8.2

# Check Node.js version
node -v  # Should be >= 18.x

# Check npm version
npm -v   # Should be >= 9.x

# Check Composer version
composer -v  # Should be >= 2.x
```

### Installation Steps

#### 1. Clone Repository
```bash
# Clone main repository
git clone https://github.com/airastore/airastore.git
cd airastore

# Install all dependencies
composer install
npm install
```

#### 2. Backend Setup
```bash
# Configure environment
cp .env.example .env
php artisan key:generate

# Set up database
php artisan migrate
php artisan db:seed

# Start Laravel server
php artisan serve
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Mobile Setup
```bash
# Open Android Studio
cd android-airastore

# Build project
./gradlew build

# Run on emulator/device
./gradlew installDebug
```

#### 5. Configuration
1. Set up environment variables
2. Configure database connection
3. Set up AWS credentials
4. Configure payment gateways
5. Set up ZegoCloud integration

### Troubleshooting Guide

#### Common Issues

##### Backend Issues
- **Database Connection**
  ```bash
  # Check database connection
  php artisan db:monitor
  
  # Reset database
  php artisan migrate:fresh --seed
  ```

- **Server Issues**
  ```bash
  # Clear cache
  php artisan cache:clear
  php artisan config:clear
  
  # Restart server
  php artisan serve --port=8000
  ```

##### Frontend Issues
- **Build Errors**
  ```bash
  # Clear npm cache
  npm cache clean --force
  
  # Reinstall dependencies
  rm -rf node_modules
  npm install
  ```

- **Development Server**
  ```bash
  # Check port availability
  lsof -i :3000
  
  # Force kill process
  kill -9 $(lsof -t -i:3000)
  ```

##### Mobile Issues
- **Build Failures**
  ```bash
  # Clean project
  ./gradlew clean
  
  # Clear Android Studio cache
  rm -rf .gradle
  rm -rf build
  ```

- **Emulator Issues**
  ```bash
  # Reset ADB
  adb kill-server
  adb start-server
  ```

#### Error Messages
- Check logs in `storage/logs`
- Review browser console
- Monitor Android logcat
- Check server responses
cd airastore-api

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=airastore
DB_USERNAME=root
DB_PASSWORD=

# Run migrations and seeders
php artisan migrate --seed

# Link storage
php artisan storage:link

# Start the server
php artisan serve
```

### 2. React Admin Panel

```bash
# Navigate to project directory
cd airastore-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Android App

```bash
# Open android-airastore in Android Studio

# Update gradle dependencies
./gradlew build

# Configure API endpoint in ApiConfig.kt
```

## Testing

### Backend Testing
```bash
# Run PHP unit tests
php artisan test

# Run specific test suite
php artisan test --filter=AuthTest
```

### Frontend Testing
```bash
# Run React component tests
npm run test

# Run with coverage
npm run test:coverage
```

### Android Testing

#### Emulator Requirements
- Recommended Emulator: Pixel 4 or newer
- RAM: 2GB minimum
- API Level: 24-33
- Architecture: x86_64

```bash
# Run Android tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

## Configuration

### Core Setup
1. Backend Environment (.env)
```
APP_NAME=Airastore
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=airastore
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_jwt_secret
JWT_TTL=60
```

2. Frontend Environment (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Android Configuration (local.properties)
```
api.base.url=http://10.0.2.2:8000/api
```

### Live Streaming Configuration

#### ZegoCloud Setup
1. Create account at [ZegoCloud Console](https://console.zegocloud.com)
2. Get AppID and AppSign
3. Configure in respective environment files
4. Features available:
   - Real-time video streaming
   - Stream chat with reactions
   - Product showcase during streams
   - Stream analytics and viewer metrics
   - Moderation tools and logs

#### Environment Variables
1. Backend (.env)
```
ZEGO_APP_ID=your_app_id
ZEGO_SERVER_SECRET=your_server_secret
```

2. Frontend (.env.local)
```
NEXT_PUBLIC_ZEGO_APP_ID=your_app_id
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your_server_secret
```

3. Android (local.properties)
```
zego.app.id=your_app_id
zego.app.sign=your_app_sign
```

#### Stream Management API
1. Create new stream:
```bash
POST /api/live-streams
{
  "title": "Stream Title",
  "description": "Stream Description",
  "scheduled_at": "2024-01-01 10:00:00",
  "products": [1, 2, 3]  # Product IDs to showcase
}
```

2. Start stream:
```bash
PUT /api/live-streams/{id}/start
```

3. End stream:
```bash
PUT /api/live-streams/{id}/end
```

### Payment Configuration

#### Environment Variables
```
PAYMENT_GATEWAY_KEY=your_payment_key
PAYMENT_GATEWAY_SECRET=your_payment_secret
```

#### Setup Steps
1. Configure payment provider credentials in `.env`
2. Set webhook endpoints
3. Configure success/failure redirect URLs

#### Payment Flow
1. User places order
2. System generates payment instructions
3. User uploads payment proof
4. Admin verifies payment
5. Order status updated
6. Notification sent to user

#### Available Payment Methods
- Bank Transfer
- E-Wallet
- Credit Card (if configured)

## Deployment

### Backend Deployment

1. **Server Requirements**
   - Ubuntu 20.04 LTS or newer
   - Nginx/Apache
   - PHP-FPM 8.1+
   - MySQL 8.0+
   - SSL Certificate

2. **Deployment Steps**
```bash
# On production server
git clone https://github.com/your-repo/airastore-api.git
cd airastore-api

# Install dependencies
composer install --no-dev

# Configure environment
cp .env.example .env
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

### Frontend Deployment

1. **Build the Next.js app**
```bash
npm run build

# For production PM2 deployment
pm2 start npm --name "airastore-admin" -- start
```

2. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Android App Release
1. Generate signed APK/Bundle
2. Configure ProGuard rules
3. Test on multiple devices
4. Submit to Play Store

## Project Structure

### Backend Structure
```
airastore-api/
├── app/                    # Laravel application code
│   ├── Http/              # Controllers, Middleware
│   │   └── Controllers/   # API and Web Controllers
│   ├── Models/            # Eloquent models
│   └── Traits/            # Shared traits
├── database/              # Migrations and seeders
└── routes/                # API and web routes
```

### Frontend Structure
```
airastore-api/src/
├── app/                   # Next.js pages
│   ├── (auth)/           # Authentication pages
│   └── dashboard/        # Admin dashboard pages
├── components/           # React components
│   ├── live-stream/     # Streaming components
│   └── ui/              # Shared UI components
└── lib/                 # Utilities and helpers
```

### Admin Dashboard Pages
- Product Management (`/dashboard/produk/`):
  - List, create, edit, and delete products
  - Manage product categories
  - Upload product images
- Live Streaming (`/dashboard/live-stream/`):
  - Create and schedule streams
  - Start/stop live broadcasts
  - View stream analytics
  - Moderate chat and comments
- Order Management (`/dashboard/pesanan/`):
  - View and process orders
  - Handle payment confirmations
  - Update order status
- User Management (`/dashboard/pengguna/`):
  - Manage customer accounts
  - Handle seller applications
  - Set user roles and permissions
- Settings (`/dashboard/pengaturan/`):
  - Configure payment methods
  - Manage system settings
  - Update notification preferences

### Android Structure
```
android-airastore/app/src/main/
├── java/                 # Kotlin source files
│   ├── views/           # Activities and Views
│   ├── fragments/       # UI Fragments
│   ├── adapters/        # RecyclerView Adapters
│   └── services/        # Background Services
└── res/                 # Android resources
```

### Technology Stack

#### Backend
- Laravel 10.x Framework
- MySQL/PostgreSQL Database
- Redis for Caching & Queue
- Laravel Sanctum for Authentication
- RESTful API Architecture
- PHP 8.1+

#### Frontend
- Next.js 13+ with App Router
- TypeScript & JavaScript
  - Strong typing with TypeScript
  - Legacy support with JavaScript
- UI/UX:
  - TailwindCSS for Styling
  - ShadcnUI Components
  - Custom UI Components
  - Responsive Design
- State Management:
  - React Context
  - Custom Hooks
- API Integration:
  - Axios for HTTP Requests
  - WebSocket for Real-time Features

#### Live Streaming
- ZegoCloud Integration
- Real-time Chat System
- Stream Analytics
- Product Integration
- Moderation Tools

#### Mobile (Android)
- Kotlin Programming Language
- Architecture:
  - MVVM Pattern
  - Repository Pattern
  - LiveData & ViewModel
- UI Components:
  - Navigation Component
  - ViewBinding
  - Material Design
  - Custom Views
- Network:
  - Retrofit for API Calls
  - OkHttp for Interceptors
  - WebSocket for Real-time Features

## Error Handling

### Backend Error Handling
- Logging:
  - Application errors in `storage/logs/laravel.log`
  - Queue worker logs
  - Database query logs
- API Response Format:
  - Consistent error structure via ApiResponse trait
  - HTTP status codes
  - Detailed error messages
  - Validation error responses
- Exception Handling:
  - Custom exception handlers
  - Database transaction rollbacks
  - Queue job retries

### Frontend Error Handling
- UI Notifications:
  - Toast messages for user feedback
  - Error boundaries for React components
  - Form validation messages
- API Error Handling:
  - Axios interceptors
  - Request retry logic
  - Session expiration handling
- Live Stream Errors:
  - Connection loss recovery
  - Stream quality degradation handling
  - Automatic reconnection

### Mobile Error Handling
- Network Errors:
  - Retrofit error handling
  - Offline mode support
  - Automatic retry mechanisms
- UI Error States:
  - Error views for failed states
  - Loading indicators
  - Retry options
- Live Stream Issues:
  - Connection monitoring
  - Quality adjustment
  - Graceful degradation

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes:
   - Follow coding standards for each platform
   - Add/update tests as needed
   - Update documentation
4. Test your changes:
   - Run backend tests: `php artisan test`
   - Run frontend tests: `npm run test`
   - Run Android tests: `./gradlew test`
5. Commit changes:
   - Use conventional commits format
   - Include component prefix (e.g., `feat(api):`, `fix(android):`)
   - Example: `git commit -m 'feat(api): add new payment method'`
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

### Code Standards

#### Backend (Laravel)
- Follow PSR-12 coding standards
- Use type hints and return types
- Document methods with PHPDoc
- Write unit tests for new features

#### Frontend (Next.js)
- Use TypeScript for new components
- Follow ESLint configuration
- Implement component tests
- Use ShadcnUI components when possible

#### Android
- Follow Kotlin coding conventions
- Implement MVVM architecture
- Add unit tests for ViewModels
- Use Material Design components

### Pull Request Process

1. Ensure all tests pass
2. Update relevant documentation
3. Add screenshots for UI changes
4. Link related issues
5. Get review from at least one maintainer

## Troubleshooting

### Backend Issues

1. **Database Connection**
   - Verify credentials in `.env`
   - Check MySQL service status: `sudo systemctl status mysql`
   - Ensure proper permissions: `GRANT ALL PRIVILEGES ON airastore.* TO 'user'@'localhost'`
   - Run migrations with `--verbose`: `php artisan migrate --verbose`

2. **Storage Permissions**
   - Set proper ownership: `chown -R www-data:www-data storage bootstrap/cache`
   - Set permissions: `chmod -R 775 storage bootstrap/cache`
   - Verify symbolic links: `php artisan storage:link`
   - Check storage paths in `config/filesystems.php`

3. **Queue/Redis Issues**
   - Verify Redis connection: `redis-cli ping`
   - Check queue status: `php artisan queue:status`
   - Monitor failed jobs: `php artisan queue:failed`
   - Restart queue worker: `php artisan queue:restart`

### Frontend Issues

1. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Update dependencies: `npm update`
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables

2. **Live Streaming Issues**
   - Check ZegoCloud credentials
   - Verify WebSocket connection
   - Monitor browser console logs
   - Test with different browsers

3. **Performance Issues**
   - Enable performance monitoring
   - Check bundle size: `npm run analyze`
   - Optimize image loading
   - Implement code splitting

### Android Issues

1. **Build Problems**
   - Clear Gradle cache: `./gradlew cleanBuildCache`
   - Sync project with Gradle files
   - Update Android Studio
   - Check SDK versions

2. **Runtime Errors**
   - Check Logcat for exceptions
   - Verify API endpoints in `ApiConfig.kt`
   - Test with different Android versions
   - Monitor memory usage

3. **Live Stream Issues**
   - Check ZegoCloud initialization
   - Verify permissions (camera, microphone)
   - Monitor network connectivity
   - Test on different devices

### Network Issues

1. **API Connection**
   - Verify base URLs in configurations
   - Check CORS settings
   - Test API endpoints with Postman
   - Monitor network requests

2. **WebSocket Connection**
   - Check WebSocket server status
   - Verify connection URLs
   - Monitor connection lifecycle
   - Implement reconnection logic

## License & Support

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Support Channels

#### Developer Support
- GitHub Issues: Report bugs and feature requests
- Documentation: [docs.airastore.com](https://docs.airastore.com)
- API Reference: [api.airastore.com/docs](https://api.airastore.com/docs)
- Developer Discord: [Join our community](https://discord.gg/airastore)

#### Technical Support
- Email: support@airastore.com
- Support Portal: [help.airastore.com](https://help.airastore.com)
- Response Time: 24-48 hours

#### Live Stream Support
- ZegoCloud Dashboard: Monitor stream health
- Real-time Support: Available during business hours
- Technical Documentation: [docs.airastore.com/streaming](https://docs.airastore.com/streaming)

#### Business Hours
- Monday-Friday: 9:00 AM - 6:00 PM (UTC+7)
- Weekend Support: Emergency issues only

### Security

#### Reporting Security Issues
- Email: security@airastore.com
- Encryption: [PGP Key](https://airastore.com/pgp-key.txt)
- Bug Bounty Program: [security.airastore.com](https://security.airastore.com)

#### Security Best Practices
- Keep all dependencies updated
- Enable two-factor authentication
- Follow security guidelines in documentation
- Regular security audits
