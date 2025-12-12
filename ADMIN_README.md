# JustiFind SA Admin Documentation

## Admin Access
- **Email:** admin@justifind.com
- **Password:** admin123

## Admin Features
- Delete lawyers from the platform
- View all lawyer profiles
- Access consumer dashboard with moderation tools

## How to Login as Admin
1. Click "Sign In" on the homepage
2. Enter the admin credentials above
3. You'll see "(ADMIN)" next to your name in the navbar
4. Red "Delete" buttons will appear on lawyer cards

## JWT Authentication
The application now uses JWT tokens for secure authentication:
- Tokens expire after 24 hours
- Automatic login persistence
- Role-based access control (Consumer, Lawyer, Admin)

## Lawyer Features
Lawyers can:
- Edit their profile information
- Add and manage service packages
- Use AI to generate package descriptions and profile bios
- View their public profile

## API Endpoints
- `POST /api/auth` - Login/Register
- `GET /api/lawyers` - Get lawyers (with optional filters)
- `POST /api/lawyers` - Register lawyer
- `PUT /api/lawyers` - Update lawyer profile
- `DELETE /api/lawyers` - Delete lawyer (admin only)
- `POST /api/packages` - Add package
- `PUT /api/packages` - Update package
- `DELETE /api/packages` - Delete package