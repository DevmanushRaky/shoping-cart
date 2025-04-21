# 🚀 Shopping Cart Application

A modern e-commerce application built with React, Vite, Shadcn UI, and Supabase. Features a shopping cart, product catalog, and admin dashboard.

## ✨ Features

- 🛒 Shopping cart functionality
- 📦 Product catalog
- 👤 User authentication
- ��‍💼 Admin dashboard with order management
- 📊 Analytics and reporting
- 📱 Responsive design
- 🔒 Secure order processing

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **UI Components**: Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## 🚀 Getting Started

1. **Clone the repository**

    ```bash
    git clone https://github.com/DevmanushRaky/shoping-cart.git
    cd shoping-cart
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up Supabase**

    - Create a new Supabase project
    - Create the following tables:

      ```sql
      -- products table
      create table products (
        id serial primary key,
        name text not null,
        price decimal not null,
        description text,
        image_url text
      );

      -- profiles table
      CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- orders table
      create table orders (
        id serial primary key,
        user_id uuid references auth.users not null,
        total decimal not null,
        items jsonb not null,
        status text not null,
        created_at timestamp with time zone default timezone('utc'::text, now())
      );

      --trigger a function when user register via email or lign via google 
      CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
        INSERT INTO public.profiles (id, user_id, is_admin, created_at)
        VALUES (
            NEW.id,         -- id from auth.users
            NEW.id,         -- user_id (same as id)
            FALSE,          -- default is_admin to false
            NOW()           -- current timestamp
        );
        RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        --trigger a function
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();

      -- adding dummy products 
                DO $$
          DECLARE
              i INTEGER;
              categories TEXT[] := ARRAY[
                  'Electronics', 'Clothing', 'Books', 'Home',
                  'Toys', 'Sports', 'Beauty', 'Garden',
                  'Automotive', 'Grocery'
              ];
              base_urls TEXT[] := ARRAY[
                  'https://source.unsplash.com/featured/?electronics',
                  'https://source.unsplash.com/featured/?clothing',
                  'https://source.unsplash.com/featured/?books',
                  'https://source.unsplash.com/featured/?home',
                  'https://source.unsplash.com/featured/?toys',
                  'https://source.unsplash.com/featured/?sports',
                  'https://source.unsplash.com/featured/?beauty',
                  'https://source.unsplash.com/featured/?garden',
                  'https://source.unsplash.com/featured/?automotive',
                  'https://source.unsplash.com/featured/?grocery'
              ];
          BEGIN
              FOR i IN 1..5000 LOOP
                  INSERT INTO products (
                      name, price, description, image_url,
                      created_at, updated_at, category, stock
                  )
                  VALUES (
                      'Product ' || i,
                      ROUND((random() * 100)::numeric, 2),
                      'This is the description for Product ' || i,
                      base_urls[(i - 1) % 10 + 1] || '&sig=' || i,
                      NOW(),
                      NOW(),
                      categories[(i - 1) % 10 + 1],
                      FLOOR(random() * 100)
                  );
              END LOOP;
          END $$;```

    - Enable Row Level Security (RLS) on the tables
    - Set up authentication providers

4. **Configure environment variables**
    Create a `.env` file in the root directory:

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

5. **Run the development server**
    ```bash
    npm run dev
    ```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── lib/            # Utility functions and configurations
├── pages/          # Page components
├── services/       # API and service functions
└── types/          # TypeScript type definitions
```

## 📸 Screenshots


![Shopping Cart](public/task5-shopping-cart.gif)


 ### chatbot 
### Chatbot Integration with Google Gemini

1. **Set up Google Gemini API**
   ```env
   VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Install required dependencies**
   ```bash
   npm install react-markdown react-icons @radix-ui/react-scroll-area
   ```

3. **Create chat service**
   - Set up chat interfaces and types
   - Implement local storage for chat persistence
   - Add Gemini API integration functions

4. **Build chat components**
   - Create main Chatbot component with message history
   - Add ChatButton component for navigation
   - Style with Tailwind CSS

5. **Add to your routes**
   ```tsx
   import Chatbot from './pages/Chatbot';
   
   // In your router configuration
   {
     path: '/chatbot',
     element: <Chatbot />
   }
   ```

6. **Place ChatButton component**
   ```tsx
   // In your layout/App component
   import ChatButton from './components/ChatButton';
   
   // Add to JSX
   <ChatButton />
   ```

The chatbot provides:
- Real-time conversation with Gemini AI
- Markdown rendering for bot responses
- Chat history persistence
- Multiple chat sessions management
- Responsive design with dark mode support