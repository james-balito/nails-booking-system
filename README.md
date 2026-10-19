# 💅 GlossX Claw - Nails Booking Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

A modern, responsive, and dynamic booking system designed for nail salons and technicians. Built with a dark, high-end Y2K aesthetic, GlossX Claw allows clients to browse custom nail art, check availability, and book appointments seamlessly.

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema & Security](#-database-schema--security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

### For Clients
- **User Authentication:** Secure sign-up and login via Supabase Auth.
- **Dynamic Gallery:** Browse a curated collection of nail designs with active category filtering.
- **Smart Booking System:** View available time slots based on the technician's working hours.
- **Automated Buffers:** The system automatically blocks out 4-5 hours of buffer time around an approved booking to ensure quality preparation and cleanup.
- **Nail Inspiration Upload:** Upload reference images for custom nail sets directly to the booking.

### For Admins
- **Dashboard:** Monitor upcoming bookings and real-time sales tracking.
- **Booking Management:** Approve, reject, or reschedule appointment requests based on availability and suitability.
- **Role-Based Access Control (RBAC):** Secure admin routes powered by Supabase RLS (Row Level Security).

---

## 🛠 Tech Stack

- **Frontend:** React.js (Create React App)
- **Language:** TypeScript (`.tsx`)
- **Styling:** Tailwind CSS (v3) with custom design tokens
- **Routing:** React Router DOM
- **Backend / Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for nail inspo images)
- **Fonts:** Google Fonts (Playfair Display, Poppins, Montserrat, Cormorant Garamond)

---

## 🔒 Database Schema & Security

The application uses Supabase's **Row Level Security (RLS)** to ensure data privacy. 

### Tables
1.  **Users (`auth.users`):** Managed by Supabase. Roles (`admin` / `client`) are stored in the `raw_user_meta_data` JSON column.
2.  **Services:** Holds nail service details (title, price, duration).
3.  **Bookings:** Stores appointment requests (date, time, status, client ID, image URL).

### RLS Policies
- **Bookings:** Clients can only `SELECT` and `UPDATE` their own bookings. Admins can view and manage all bookings.
- **Services:** Anyone authenticated can view; only admins can modify.

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/nails-booking-system.git
   cd nails-booking-system