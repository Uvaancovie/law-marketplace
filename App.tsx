import React, { useState, useEffect } from 'react';
import { User, UserRole, Lawyer } from './types';
import { db } from './services/db';
import Assistant from './components/Assistant';
import { 
  MapPin, 
  Search, 
  User as UserIcon, 
  Briefcase, 
  LogOut, 
  PlusCircle, 
  DollarSign,
  Star,
  Menu,
  X,
  ArrowLeft,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

// --- Helper Components ---

const Navbar = ({ 
  user, 
  onLogout, 
  onLoginClick,
  onRegisterClick 
}: { 
  user: User | null; 
  onLogout: () => void; 
  onLoginClick: () => void;
  onRegisterClick: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="flex items-center gap-2 text-2xl font-bold text-brand-600">
               <Briefcase className="h-8 w-8" />
               JustiFind SA
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <div className="bg-brand-100 p-1.5 rounded-full text-brand-600">
                    <UserIcon size={16} />
                  </div>
                  <span>{user.name} ({user.role})</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="text-slate-600 hover:text-brand-600 font-medium text-sm px-4 py-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={onRegisterClick}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700 p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg">
           {user ? (
              <>
                <div className="text-sm font-medium text-slate-800 pb-2 border-b border-slate-100">Hi, {user.name}</div>
                <button onClick={onLogout} className="w-full text-left text-red-600 py-2 flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
           ) : (
              <>
                <button onClick={onLoginClick} className="block w-full text-left py-2 text-slate-600 font-medium">Sign In</button>
                <button onClick={onRegisterClick} className="block w-full text-center py-3 bg-brand-600 text-white rounded-lg font-medium">Get Started</button>
              </>
           )}
        </div>
      )}
    </nav>
  );
};

const LawyerCard: React.FC<{ lawyer: Lawyer; onViewProfile: () => void }> = ({ lawyer, onViewProfile }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start gap-4 mb-4">
        <img 
          src={lawyer.imageUrl} 
          alt={lawyer.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 group-hover:border-brand-100 transition-colors" 
        />
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{lawyer.name}</h3>
          <div className="flex items-center text-slate-500 text-sm mt-1 gap-1">
            <MapPin size={14} />
            {lawyer.location}
          </div>
          <div className="flex items-center gap-1 mt-1">
             <Star size={14} className="text-yellow-400 fill-yellow-400" />
             <span className="text-sm font-medium text-slate-800">{lawyer.rating}</span>
             <span className="text-xs text-slate-400">({lawyer.reviewCount} reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {lawyer.specialties && lawyer.specialties.map(tag => (
          <span key={tag} className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100">
            {tag}
          </span>
        ))}
      </div>
      
      <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">{lawyer.bio}</p>
      
      <div className="mt-auto space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Packages</h4>
        {lawyer.packages && lawyer.packages.length > 0 ? (
          lawyer.packages.slice(0, 2).map(pkg => (
            <div key={pkg.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center group/pkg hover:bg-white hover:border-brand-200 transition-colors">
              <div className="text-sm font-medium text-slate-700 truncate pr-2">{pkg.title}</div>
              <div className="text-brand-600 font-bold text-sm whitespace-nowrap">R{pkg.price}</div>
            </div>
          ))
        ) : (
          <div className="text-slate-400 text-sm italic py-2">No packages available yet.</div>
        )}
      </div>
    </div>
    <div className="p-4 bg-slate-50 border-t border-slate-100">
      <button 
        onClick={onViewProfile}
        className="w-full bg-white border border-slate-300 hover:border-brand-500 hover:text-brand-600 text-slate-700 font-medium py-2 rounded-lg transition-all text-sm"
      >
        View Profile
      </button>
    </div>
  </div>
);

const LawyerPublicProfile = ({ lawyer, onBack }: { lawyer: Lawyer, onBack: () => void }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
    <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-brand-600 transition-colors font-medium">
       <ArrowLeft size={20} className="mr-2"/> Back to Search
    </button>
    
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 h-32"></div>
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
           <img src={lawyer.imageUrl} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" alt={lawyer.name} />
           <div className="flex-1">
             <h1 className="text-3xl font-bold text-slate-900">{lawyer.name}</h1>
             <div className="flex items-center text-slate-600 mt-1">
                <MapPin size={18} className="mr-1"/> {lawyer.location}
             </div>
           </div>
           <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 mt-4 md:mt-0">
               <Star className="fill-yellow-400 text-yellow-400" size={18} />
               <span className="font-bold text-slate-800">{lawyer.rating}</span>
               <span className="text-slate-500 text-sm">({lawyer.reviewCount} reviews)</span>
           </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">About</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{lawyer.bio}</p>
              </section>
              
              <section>
                 <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Service Packages</h3>
                 <div className="space-y-4">
                    {lawyer.packages && lawyer.packages.map(pkg => (
                       <div key={pkg.id} className="border border-slate-200 rounded-xl p-5 hover:border-brand-300 transition-colors bg-slate-50/50 hover:bg-white group">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{pkg.title}</h4>
                             <span className="text-brand-600 font-bold text-lg">R{pkg.price}</span>
                          </div>
                          <p className="text-slate-600 text-sm mb-4">{pkg.description}</p>
                          <button className="w-full bg-white border border-brand-200 text-brand-700 hover:bg-brand-600 hover:text-white font-medium py-2 rounded-lg transition-colors text-sm shadow-sm">
                             Request Service
                          </button>
                       </div>
                    ))}
                    {(!lawyer.packages || lawyer.packages.length === 0) && <p className="text-slate-500 italic">No packages listed yet.</p>}
                 </div>
              </section>
           </div>
           
           <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                 <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Specialties</h3>
                 <div className="flex flex-wrap gap-2">
                    {lawyer.specialties && lawyer.specialties.map(s => (
                       <span key={s} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 font-medium">{s}</span>
                    ))}
                 </div>
              </div>
              
              <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                 <h3 className="font-bold text-brand-800 mb-2">Contact</h3>
                 <button className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-sm mb-2">
                    Message Lawyer
                 </button>
                 <p className="text-xs text-center text-brand-600/80">Response time: usually 24h</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const AuthModal = ({ isOpen, onClose, type, onAuthSuccess }: { isOpen: boolean; onClose: () => void; type: 'login' | 'register'; onAuthSuccess: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Extra fields for Lawyer Registration
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setIsLogin(type === 'login'); }, [type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Auth ID generation
    const id = Math.random().toString(36).substr(2, 9);
    const user: User = {
      id,
      name: name || email.split('@')[0],
      email,
      role: isLogin ? UserRole.CONSUMER : role 
    };

    if (!isLogin && role === UserRole.LAWYER) {
       // Register lawyer profile via API
       await db.registerLawyer(user, { location, specialties: [specialty], bio: 'New lawyer to the platform.' });
       user.lawyerProfileId = id;
    }

    onAuthSuccess(user);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500 text-sm mb-6">{isLogin ? 'Sign in to access your dashboard' : 'Join thousands of users today'}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
               <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                   <button type="button" onClick={() => setRole(UserRole.CONSUMER)} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${role === UserRole.CONSUMER ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Consumer</button>
                   <button type="button" onClick={() => setRole(UserRole.LAWYER)} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${role === UserRole.LAWYER ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Lawyer</button>
                </div>
               </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>

            {!isLogin && role === UserRole.LAWYER && (
              <>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location (City, State)</label>
                    <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="e.g. Johannesburg, Durban" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Specialty</label>
                    <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="e.g. Labour Law" />
                 </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-all mt-6 shadow-md hover:shadow-lg disabled:opacity-70">
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-brand-600 font-semibold hover:underline">
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
           <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Views ---

const ConsumerDashboard = ({ user }: { user: User | null }) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  const fetchLawyers = async (filter?: { location?: string, specialty?: string }) => {
    setLoading(true);
    const data = await db.getLawyers(filter);
    setLawyers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLawyer(null); // Reset view on search
    fetchLawyers({ location: locationTerm, specialty: searchTerm });
  };

  if (selectedLawyer) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-20">
         <LawyerPublicProfile lawyer={selectedLawyer} onBack={() => setSelectedLawyer(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-20">
      {/* Hero Search */}
      <div className="bg-brand-900 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577985051167-0d49eec21977?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Find Affordable Lawyers in <span className="text-brand-400">SA's Main Hubs</span>.
          </h1>
          <p className="text-brand-100 mb-8 text-lg max-w-2xl mx-auto">
            Connecting you with legal experts in Johannesburg, Cape Town, and Durban.
          </p>
          
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
              <Search className="text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Legal issue (e.g. Divorce, CCMA)" 
                className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
              <MapPin className="text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="e.g. Sandton, Cape Town" 
                className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400"
                value={locationTerm}
                onChange={e => setLocationTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800">Top Rated Lawyers</h2>
           <div className="text-sm text-slate-500">{lawyers.length} results found</div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lawyers.map(lawyer => (
              <LawyerCard 
                key={lawyer.id} 
                lawyer={lawyer} 
                onViewProfile={() => setSelectedLawyer(lawyer)}
              />
            ))}
          </div>
        )}
        
        {lawyers.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">No lawyers found</h3>
            <p className="text-slate-500">Try adjusting your search terms or location.</p>
          </div>
        )}
      </div>
      
      {/* Assistant is always available for consumers */}
      <Assistant onLawyersFound={(results) => setLawyers(results)} />
    </div>
  );
};

const LawyerDashboard = ({ user }: { user: User }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'packages'>('packages');
  
  // Package State
  const [packages, setPackages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  
  // Profile State
  const [profileData, setProfileData] = useState<Partial<Lawyer>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Hydrate lawyer data
  useEffect(() => {
    const fetchData = async () => {
      const lawyer = await db.getLawyerById(user.id);
      if (lawyer) {
        setPackages(lawyer.packages || []);
        setProfileData({
          name: lawyer.name,
          location: lawyer.location,
          specialties: lawyer.specialties,
          bio: lawyer.bio,
          imageUrl: lawyer.imageUrl
        });
      }
    };
    fetchData();
  }, [user.id]);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPkg = await db.addPackage(user.id, { title, description: desc, price: Number(price) });
    if (newPkg) {
      setPackages(prev => [...prev, newPkg]);
      setTitle('');
      setDesc('');
      setPrice('');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    await db.updateLawyer(user.id, profileData);
    
    setIsSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold text-slate-900">Lawyer Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your service packages and profile.</p>
         </div>
         <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg text-sm font-medium border border-brand-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Status: Active
         </div>
       </div>

       {/* Tabs */}
       <div className="flex gap-4 mb-8 border-b border-slate-200">
         <button 
           onClick={() => setActiveTab('packages')}
           className={`pb-3 px-2 font-medium text-sm transition-colors relative ${activeTab === 'packages' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Manage Packages
           {activeTab === 'packages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('profile')}
           className={`pb-3 px-2 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Edit Profile
           {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full"></div>}
         </button>
       </div>

       {activeTab === 'packages' ? (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Create Package Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                  <PlusCircle className="text-brand-600" />
                  <h2 className="text-xl font-bold">Create New Package</h2>
               </div>
               
               <form onSubmit={handleAddPackage} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Package Title</label>
                   <input 
                     type="text" 
                     required
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                     placeholder="e.g. 30-min Consultation"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                   <textarea 
                     required
                     value={desc}
                     onChange={e => setDesc(e.target.value)}
                     rows={3}
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                     placeholder="What's included?"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Price (R)</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">R</span>
                      </div>
                      <input 
                        type="number" 
                        required
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                        placeholder="0.00"
                      />
                   </div>
                 </div>
                 <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm">
                   Publish Package
                 </button>
               </form>
            </div>

            {/* Package List */}
            <div className="lg:col-span-2 space-y-6">
               <h2 className="text-xl font-bold text-slate-800 mb-4">Your Active Packages</h2>
               {packages.length === 0 ? (
                 <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                    <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>You haven't created any packages yet.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packages.map(pkg => (
                      <div key={pkg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-brand-300 transition-colors">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-900">{pkg.title}</h3>
                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-100 flex items-center">
                              R {pkg.price}
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm">{pkg.description}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                          <button className="flex-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Edit</button>
                          <button className="flex-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
         </div>
       ) : (
         <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
             <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
                <Settings className="text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900">Profile Settings</h2>
             </div>
             
             {profileSuccess && (
               <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                 Profile updated successfully!
               </div>
             )}
             
             <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name || ''}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Office Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={profileData.location || ''}
                      onChange={e => setProfileData({...profileData, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialties (comma separated)</label>
                  <input 
                    type="text" 
                    value={profileData.specialties?.join(', ') || ''}
                    onChange={e => setProfileData({...profileData, specialties: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Family Law, Divorce, Mediation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About Me</label>
                  <textarea 
                    rows={5}
                    value={profileData.bio || ''}
                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Tell clients about your experience and approach..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
                   <div className="relative">
                    <ImageIcon size={18} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={profileData.imageUrl || ''}
                      onChange={e => setProfileData({...profileData, imageUrl: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isSavingProfile}
                     className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-70"
                   >
                     {isSavingProfile ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
             </form>
         </div>
       )}
    </div>
  );
};

// --- App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, type: 'login' | 'register' }>({ isOpen: false, type: 'login' });

  // Load user from local storage (mock persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('justifind_user');
    if (storedUser) {
       setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('justifind_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('justifind_user');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setAuthModal({ isOpen: true, type: 'login' })}
        onRegisterClick={() => setAuthModal({ isOpen: true, type: 'register' })}
      />

      <main>
        {user?.role === UserRole.LAWYER ? (
          <LawyerDashboard user={user} />
        ) : (
          <ConsumerDashboard user={user} />
        )}
      </main>

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        type={authModal.type} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </div>
  );
};

export default App;