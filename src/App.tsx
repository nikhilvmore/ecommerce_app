import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, LogOut, User as UserIcon, Package, Search, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product } from './types';
import { cn } from './lib/utils';

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    outline: 'bg-transparent text-zinc-900 border border-zinc-900 hover:bg-zinc-900 hover:text-white',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100',
  };
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all',
      className
    )}
    {...props}
  />
);

// --- Pages ---

const AuthPage = ({ setUser }: { setUser: (u: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'merchant' | 'customer'>('customer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { username, password } : { username, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        navigate(data.role === 'merchant' ? '/merchant' : '/shop');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 text-white rounded-xl mb-4">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-zinc-500 mt-2">Enter your details to access the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">I want to...</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={cn(
                    "py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                    role === 'customer' ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  Shop Products
                </button>
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={cn(
                    "py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                    role === 'merchant' ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  Sell Products
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
        <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
          <Store size={20} />
        </div>
        <span>Nexus</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-600">
          <UserIcon size={16} />
          <span>{user.username}</span>
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[10px] uppercase tracking-wider">
            {user.role}
          </span>
        </div>
        <Button variant="ghost" onClick={onLogout} className="flex items-center gap-2 text-zinc-600">
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  </nav>
);

const MerchantDashboard = ({ user }: { user: User }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', imageUrl: '' });

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.filter((p: Product) => p.merchantId === user.id));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price), merchantId: user.id }),
    });
    if (res.ok) {
      setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
      setIsAdding(false);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Merchant Portal</h1>
            <p className="text-zinc-500 mt-1">Manage your inventory and track sales</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add New Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-4">
                <img
                  src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">{product.name}</h3>
              <p className="text-zinc-500 text-sm line-clamp-2 mt-1">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-zinc-900">${product.price.toFixed(2)}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs">Edit</Button>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
              <Package className="mx-auto text-zinc-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-zinc-900">No products yet</h3>
              <p className="text-zinc-500">Start by adding your first product to the store</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
                  <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all h-24"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Price ($)</label>
                    <Input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Image URL</label>
                    <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">Create Product</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomerStorefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
              Curated essentials for the modern lifestyle.
            </h1>
            <p className="text-zinc-500 text-lg mt-4">
              Explore our collection of high-quality products from trusted independent sellers.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={product.id}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 mb-4 relative">
                <img
                  src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/800`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Button className="w-full shadow-xl">Add to Cart</Button>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-zinc-900">{product.name}</h3>
                  <p className="text-zinc-500 text-sm mt-0.5">{product.description.substring(0, 40)}...</p>
                </div>
                <span className="font-bold text-zinc-900">${product.price.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 text-lg">No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <div className="font-sans text-zinc-900">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/auth" element={user ? <Navigate to={user.role === 'merchant' ? '/merchant' : '/shop'} /> : <AuthPage setUser={setUser} />} />

          <Route
            path="/merchant"
            element={
              user?.role === 'merchant' ? (
                <MerchantDashboard user={user} />
              ) : (
                <Navigate to={user ? '/shop' : '/auth'} />
              )
            }
          />

          <Route
            path="/shop"
            element={
              user?.role === 'customer' ? (
                <CustomerStorefront />
              ) : (
                <Navigate to={user ? '/merchant' : '/auth'} />
              )
            }
          />

          <Route path="/" element={<Navigate to={user ? (user.role === 'merchant' ? '/merchant' : '/shop') : '/auth'} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
