# 🚀 Shopping Cart Application

A modern e-commerce application built with React, Vite, Shadcn UI, and Supabase. Features a shopping cart, product catalog, and admin dashboard.

## ✨ Features

- 🛒 Shopping cart functionality
- 📦 Product catalog
- 👤 User authentication
- 👨‍💼 Admin dashboard
- 📱 Responsive design
- 🔒 Secure order processing

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **UI Components**: Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## 🚀 Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/DevmanushRaky/shoping-cart.git
    cd shoping-cart
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up Supabase**

    - Create a new Supabase project
    - Create the following tables:

      ````sql
      -- products table
      create table products (
      id serial primary key,
      name text not null,
      price decimal not null,
      description text,
      image_url text
      );
      -- Create profiles table
      CREATE TABLE profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      );

      -- orders table
      create table orders (
         id serial primary key,
         user_id uuid references auth.users not null,
         total decimal not null,
         items jsonb not null,
         status text not null,
         created_at timestamp with time zone default timezone('utc'::text, now())
      );```

      ````

    - Enable Row Level Security (RLS) on the tables
    - Set up authentication providers

4.  **Configure environment variables**
    Create a `.env` file in the root directory:

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── lib/           # Utility functions and configurations
├── pages/         # Page components
├── services/      # API and service functions
└── types/         # TypeScript type definitions
```

## 📸 Screenshots

### Shopping Cart Page

![Shopping Cart](/public/user.png)

### Admin Dashboard

![Admin Dashboard](/public/admin.png)

## 📦 Deployment

The application can be deployed on Vercel or Netlify:

1. **Vercel**

   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```
