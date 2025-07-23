import { Experiment } from '@amplitude/experiment-js-client';

// (1) Initialize the experiment client with Amplitude Analytics.
const experiment = Experiment.initializeWithAmplitudeAnalytics(
    'DEPLOYMENT_KEY'
);

// (2) Fetch variants and await the promise result.
await experiment.fetch();

// (3) Lookup a flag's variant.
const variant = experiment.variant('FLAG_KEY');
if (variant.value === 'on') {
    // Flag is on
} else {
    // Flag is off
}
// Property data for modal details
const propertyData = {
    1: {
        title: "Modern Family Home",
        price: "$350,000",
        location: "Downtown Area",
        type: "House",
        beds: 3,
        baths: 2,
        sqft: "1,800",
        description: "Beautiful modern family home in the heart of downtown. Features updated kitchen, hardwood floors, and a private backyard. Perfect for families looking for urban convenience.",
        features: ["Updated Kitchen", "Hardwood Floors", "Private Backyard", "Garage", "Central Air"]
    },
    2: {
        title: "Cozy Apartment",
        price: "$280,000",
        location: "City Center",
        type: "Apartment",
        beds: 2,
        baths: 1,
        sqft: "1,200",
        description: "Charming apartment in the bustling city center. Close to restaurants, shopping, and public transportation. Great for young professionals or small families.",
        features: ["City Views", "Modern Appliances", "In-unit Laundry", "Balcony", "Gym Access"]
    },
    3: {
        title: "Luxury Villa",
        price: "$520,000",
        location: "Suburb",
        type: "Villa",
        beds: 4,
        baths: 3,
        sqft: "2,500",
        description: "Stunning luxury villa in peaceful suburban setting. Features spacious rooms, elegant finishes, and beautifully landscaped grounds.",
        features: ["Swimming Pool", "3-Car Garage", "Master Suite", "Gourmet Kitchen", "Landscaped Garden"]
    },
    4: {
        title: "Charming Cottage",
        price: "$420,000",
        location: "Riverside",
        type: "House",
        beds: 3,
        baths: 2,
        sqft: "1,600",
        description: "Quaint cottage by the riverside. Perfect blend of rustic charm and modern amenities. Ideal for those seeking tranquility.",
        features: ["River Views", "Fireplace", "Deck", "Updated Kitchen", "Peaceful Setting"]
    },
    5: {
        title: "Studio Loft",
        price: "$180,000",
        location: "Arts District",
        type: "Apartment",
        beds: 1,
        baths: 1,
        sqft: "800",
        description: "Modern studio loft in the vibrant arts district. High ceilings, exposed brick, and contemporary design. Perfect for artists and creatives.",
        features: ["High Ceilings", "Exposed Brick", "Modern Design", "Arts District Location", "Walking Distance to Galleries"]
    },
    6: {
        title: "Executive Home",
        price: "$750,000",
        location: "Hillside",
        type: "House",
        beds: 5,
        baths: 4,
        sqft: "3,200",
        description: "Impressive executive home on prestigious Hillside. Luxury finishes throughout, expansive living spaces, and stunning city views.",
        features: ["City Views", "Home Office", "Wine Cellar", "2-Car Garage", "Premium Finishes", "Large Lot"]
    }
};

// Login Management Functions (GLOBAL SCOPE)
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    clearLoginError();
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearLoginError() {
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');
}

function login(name, userId, password) {
    
    // Store user session temporarily
    const userSession = {
        name: name.trim(),
        userId: userId.trim(),
        password: password, // In real app, never store passwords!
        loginTime: new Date().toISOString(),
        sessionId: 'session_' + Date.now()
    };
    
    localStorage.setItem('userSession', JSON.stringify(userSession));
    
    // Use Amplitude identify to set user identity and properties
    if (typeof amplitude !== 'undefined') {
        // Set the user ID
        amplitude.setUserId(userId.trim());
        
        // Create identify object with user properties
        const userObj = new amplitude.Identify();
        userObj.set('userName', name.trim());
        userObj.set('loginMethod', 'form');
        
        // Send identify call
        amplitude.track('User Logged In', userObj);
        
        console.log('Amplitude identify call sent for user login:', userId.trim());
    }
    
    console.log('User logged in:', userSession);
    return true;
}

function logout() {
    const user = getCurrentUser();
    
    // Clear session
    localStorage.removeItem('userSession');
    updateUserInterface();
    
    console.log('User logged out');
    alert('You have been logged out successfully!');
}

function getUserInfo() {
    return getCurrentUser();
}

// Custom Amplitude Event Function
function ClickFeatureProperty(propertyId) {
    const property = propertyData[propertyId];
    
    // Send custom event to Amplitude using Browser SDK 2
    if (typeof amplitude !== 'undefined') {
        amplitude.track('Clicked Feature Property', {
            propertyId: propertyId,
            propertyTitle: property.title,
            propertyPrice: property.price,
            propertyType: property.type,
            propertyLocation: property.location,
            propertyBedrooms: property.beds,
            propertyBathrooms: property.baths,
            propertySqft: property.sqft,
            pageSection: 'featured_properties',
            action: 'click',
            elementType: 'property_card'
        });
        
        console.log('Amplitude Clicked Feature Property event sent for property:', propertyId);
    } else {
        console.log('Amplitude not loaded - Clicked Feature Property event for property:', propertyId);
    }
    
    // Continue with existing functionality
    openPropertyModal(propertyId);
}

// Filter functions
function applyFilters() {
    const priceFilter = document.getElementById('priceFilter').value;
    const bedroomFilter = document.getElementById('bedroomFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    propertyCards.forEach(card => {
        let show = true;
        
        // Price filter
        if (priceFilter) {
            const price = parseInt(card.dataset.price);
            const [min, max] = priceFilter.split('-').map(p => parseInt(p));
            if (max) {
                show = show && (price >= min && price <= max);
            } else {
                show = show && (price >= min);
            }
        }
        
        // Bedroom filter
        if (bedroomFilter) {
            const bedrooms = parseInt(card.dataset.bedrooms);
            show = show && (bedrooms >= parseInt(bedroomFilter));
        }
        
        // Type filter
        if (typeFilter) {
            show = show && (card.dataset.type === typeFilter);
        }
        
        if (show) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
    
    // Track FilterApplied event with only 4 properties
    if (typeof amplitude !== 'undefined') {
        const filterEventData = {};
        
        // Add propertyTypeSelected if type filter is applied
        if (typeFilter) {
            filterEventData.propertyTypeSelected = typeFilter;
        }
        
        // Add bedroomCountSelected if bedroom filter is applied
        if (bedroomFilter) {
            filterEventData.bedroomCountSelected = parseInt(bedroomFilter);
        }
        
        // Add priceMin and priceMax if price filter is applied
        if (priceFilter) {
            if (priceFilter.includes('-')) {
                const [min, max] = priceFilter.split('-');
                filterEventData.priceMin = parseInt(min);
                filterEventData.priceMax = parseInt(max);
            } else {
                // For "500000-999999" case where it's "500000+"
                filterEventData.priceMin = parseInt(priceFilter);
            }
        }
        
        // Only send event if at least one filter is applied
        if (Object.keys(filterEventData).length > 0) {
            amplitude.track('Filter Applied', filterEventData);
            console.log('Amplitude Filter Applied event sent:', filterEventData);
        }
    } else {
        console.log('Amplitude not loaded - Filter Applied event skipped');
    }
}

function clearFilters() {
    document.getElementById('priceFilter').value = '';
    document.getElementById('bedroomFilter').value = '';
    document.getElementById('typeFilter').value = '';
    
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach(card => {
        card.classList.remove('hidden');
    });
    
    document.getElementById('noResults').style.display = 'none';
}

// Modal functions
function openPropertyModal(propertyId) {
    const property = propertyData[propertyId];
    const modal = document.getElementById('propertyModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>${property.title}</h2>
        <div style="margin: 1rem 0;">
            <span style="font-size: 1.5rem; color: #27ae60; font-weight: bold;">${property.price}</span>
            <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 1rem;">${property.type}</span>
        </div>
        <p style="color: #7f8c8d; margin-bottom: 1rem;">📍 ${property.location}</p>
        <div style="display: flex; gap: 2rem; margin-bottom: 1rem; color: #7f8c8d;">
            <span>🛏️ ${property.beds} Beds</span>
            <span>🚿 ${property.baths} Baths</span>
            <span>📐 ${property.sqft} sq ft</span>
        </div>
        <h3 style="margin: 1rem 0;">Description</h3>
        <p style="line-height: 1.6; margin-bottom: 1rem;">${property.description}</p>
        <h3 style="margin: 1rem 0;">Features</h3>
        <ul style="margin-bottom: 2rem;">
            ${property.features.map(feature => `<li style="margin: 0.5rem 0;">${feature}</li>`).join('')}
        </ul>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn" onclick="contactAboutProperty('${property.title}',${propertyId})">Contact Agent</button>
            <button class="btn-secondary" onclick="scheduleViewing('${property.title}',${propertyId})">Schedule Viewing</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none';
}

function contactAboutProperty(propertyTitle, propertyId) {

    alert(`Thank you for your interest in "${propertyTitle}"! An agent will contact you shortly.`);
    const property = propertyData[propertyId];
    
    // Send custom event to Amplitude using Browser SDK 2
    if (typeof amplitude !== 'undefined') {
        amplitude.track('Clicked Contact Agent', {
            propertyId: propertyId,
            propertyTitle: property.title,
            propertyPrice: property.price,
            propertyType: property.type,
            propertyLocation: property.location,
            propertyBedrooms: property.beds,
            propertyBathrooms: property.baths,
            propertySqft: property.sqft
      
        });
        
        console.log('Amplitude Clicked Contact Agent event sent for property:', propertyId);
    } else {
        console.log('Amplitude not loaded - Clicked Contact Agent event for property:', propertyId);
    }
    closePropertyModal();
}

function scheduleViewing(propertyTitle, propertyId) {
    alert(`Viewing scheduled for "${propertyTitle}"! We'll call you to confirm the time.`);

    const property = propertyData[propertyId];
    
    // Send custom event to Amplitude using Browser SDK 2
    if (typeof amplitude !== 'undefined') {
        amplitude.track('Clicked Schedule Viewing', {
            propertyId: propertyId,
            propertyTitle: property.title,
            propertyPrice: property.price,
            propertyType: property.type,
            propertyLocation: property.location,
            propertyBedrooms: property.beds,
            propertyBathrooms: property.baths,
            propertySqft: property.sqft
      
        });
        
        console.log('Amplitude Clicked Schedule Viewing event sent for property:', propertyId);
    } else {
        console.log('Amplitude not loaded - Clicked Schedule Viewing event for property:', propertyId);
    }
    closePropertyModal();
}

// DOM Content Loaded Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('loginName').value;
            const userId = document.getElementById('loginUserId').value;
            const password = document.getElementById('loginPassword').value;
            
            if (login(name, userId, password)) {
                closeLoginModal();
                updateUserInterface();
                this.reset();
                alert(`Welcome, ${name}! You are now logged in.`);
            }
        });
    }
    
    // Handle contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
    
    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const loginModal = document.getElementById('loginModal');
        const propertyModal = document.getElementById('propertyModal');
        
        if (event.target === loginModal) {
            closeLoginModal();
        }
        if (event.target === propertyModal) {
            closePropertyModal();
        }
    }
}); 