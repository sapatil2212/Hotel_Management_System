# About Components

This directory contains the components used for the About page of the Hotel Management System.

## Components

### AboutUs.tsx
The main About page component that includes:
- Hotel introduction and description
- Location information with nearby attractions
- Integration of VisionMission and PropertyAmenities components

### VisionMission.tsx
Displays the hotel's vision, mission, and core values:
- Vision and Mission statements
- Core values grid with icons
- Responsive design with hover effects

### PropertyAmenities.tsx
Shows the hotel's amenities organized by category:
- Property Features (parking, WiFi, breakfast, security, etc.)
- Room Amenities (AC, TV, beds, bathroom, etc.)
- Uses react-icons for consistent iconography

### index.ts
Export file for easy importing of all components.

## Usage

```tsx
import { AboutUs, VisionMission, PropertyAmenities } from '@/components/AboutComponents';

// Use the main component
<AboutUs />

// Or use individual components
<VisionMission />
<PropertyAmenities />
```

## Dependencies

- `lucide-react` - For icons in AboutUs and VisionMission
- `react-icons` - For icons in PropertyAmenities
- Tailwind CSS - For styling

## Features

- Fully responsive design
- Hover effects and transitions
- Accessible navigation
- SEO-friendly structure
- Modular component architecture
