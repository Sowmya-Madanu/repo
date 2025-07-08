import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Car as CarIcon, Users, Star } from 'lucide-react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: null,
    returnDate: null
  });
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const response = await axios.get('/api/cars?limit=6&sort=createdAt');
      setFeaturedCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (!searchData.location) {
      toast.error('Please enter a location');
      return;
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('location', searchData.location);
    
    if (searchData.pickupDate) {
      params.append('pickupDate', searchData.pickupDate.toISOString());
    }
    
    if (searchData.returnDate) {
      params.append('returnDate', searchData.returnDate.toISOString());
    }

    navigate(`/cars?${params.toString()}`);
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Find Your Perfect Rental Car</h1>
          <p>Choose from hundreds of cars at the best prices. Book now and drive away!</p>
          
          {/* Search Form */}
          <div className="search-form">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} className="inline mr-2" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter city or airport"
                    value={searchData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} className="inline mr-2" />
                    Pickup Date
                  </label>
                  <DatePicker
                    selected={searchData.pickupDate}
                    onChange={(date) => handleInputChange('pickupDate', date)}
                    selectsStart
                    startDate={searchData.pickupDate}
                    endDate={searchData.returnDate}
                    minDate={new Date()}
                    placeholderText="Select pickup date"
                    className="form-input"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} className="inline mr-2" />
                    Return Date
                  </label>
                  <DatePicker
                    selected={searchData.returnDate}
                    onChange={(date) => handleInputChange('returnDate', date)}
                    selectsEnd
                    startDate={searchData.pickupDate}
                    endDate={searchData.returnDate}
                    minDate={searchData.pickupDate || new Date()}
                    placeholderText="Select return date"
                    className="form-input"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                <Search size={20} />
                Search Cars
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2>Why Choose Our Car Rental Service?</h2>
            <p className="text-gray-600">Experience the best car rental service with these benefits</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                  <CarIcon size={32} className="text-white" />
                </div>
              </div>
              <h3>Wide Selection</h3>
              <p>Choose from our extensive fleet of well-maintained vehicles</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
                  <Star size={32} className="text-white" />
                </div>
              </div>
              <h3>Best Prices</h3>
              <p>Competitive pricing with no hidden fees or charges</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center">
                  <Users size={32} className="text-white" />
                </div>
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2>Featured Cars</h2>
            <p className="text-gray-600">Discover our most popular rental vehicles</p>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured cars..." />
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <div key={car._id} className="car-card">
                  <img
                    src={car.images?.[0] || '/api/placeholder/400/200'}
                    alt={`${car.make} ${car.model}`}
                    className="car-card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200/f3f4f6/6b7280?text=Car+Image';
                    }}
                  />
                  
                  <div className="car-card-content">
                    <h3 className="car-card-title">
                      {car.make} {car.model} {car.year}
                    </h3>
                    
                    <div className="car-card-details">
                      <span className="car-card-detail">
                        <Users size={16} />
                        {car.seats} seats
                      </span>
                      <span className="car-card-detail">
                        <CarIcon size={16} />
                        {car.transmission}
                      </span>
                      <span className="car-card-detail">
                        <MapPin size={16} />
                        {car.location}
                      </span>
                    </div>

                    <div className="car-card-price">
                      ${car.pricePerDay}/day
                    </div>

                    <div className="car-card-footer">
                      <Link
                        to={`/cars/${car._id}`}
                        className="btn btn-primary"
                      >
                        View Details
                      </Link>
                      
                      <span className={`booking-status ${car.isAvailable ? 'confirmed' : 'cancelled'}`}>
                        {car.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CarIcon className="empty-state-icon" />
              <h3>No Cars Available</h3>
              <p>Check back later for our featured car selection.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/cars" className="btn btn-outline btn-lg">
              View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-primary text-white text-center">
        <div className="container">
          <h2 className="text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="mb-6 text-lg opacity-90">
            Join thousands of satisfied customers who trust us with their car rental needs
          </p>
          <Link to="/cars" className="btn btn-white btn-lg">
            Book Your Car Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;