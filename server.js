const express = require("express");
const app = express();

app.use(express.static("public"));

const axios = require("axios");
const cheerio = require("cheerio");

// Function to fetch simulated real prices from major platforms
async function fetchPrices(query) {
    const platforms = [
        { name: "Amazon", url: `https://www.amazon.in/s?k=${encodeURIComponent(query)}` },
        { name: "Flipkart", url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}` },
        { name: "Reliance Digital", url: `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}` }
    ];

    // Note: Direct scraping of Amazon/Flipkart is often blocked without specific headers or proxies.
    // For a real-world "Pro" developer project, we use a search aggregator or an API like Rainforest.
    // Here we'll implement a robust simulation that reflects actual market prices for common items.
    
    const results = [];
    // Base prices for common categories and brands
    const basePrices = {
        // High-end electronics
        "iphone": 79000,
        "macbook": 92000,
        "samsung": 65000,
        "laptop": 45000,
        "phone": 15000,

        // High-end shoes
        "nike": 8999,
        "adidas": 7499,
        "puma": 4999,
        "jordans": 15999,
        "shoes": 1200,

        // Other categories
        "watch": 2500,
        "headphones": 1500,
        "shirt": 800,
        "groceries": 200
    };

    const queryLower = query.toLowerCase();
    
    // Priority matching: check brands first, then general categories
    const brands = ["iphone", "macbook", "samsung", "nike", "adidas", "puma", "jordans"];
    const matchedBrand = brands.find(brand => queryLower.includes(brand));
    
    let basePrice;
    if (matchedBrand) {
        basePrice = basePrices[matchedBrand];
    } else {
        const sortedPriceKeys = Object.keys(basePrices).filter(k => !brands.includes(k)).sort((a, b) => b.length - a.length);
        const matchedPriceKey = sortedPriceKeys.find(key => queryLower.includes(key));
        basePrice = matchedPriceKey ? basePrices[matchedPriceKey] : 5000;
    }

    // Add a unique price factor based on the search query length and characters
    const queryHash = queryLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dynamicFactor = 0.9 + ((queryHash % 20) / 100); // 0.9 to 1.1 multiplier

    return platforms.map(p => {
        // Platform specific variance (Amazon might be slightly cheaper or more expensive)
        const platformFactor = p.name === "Amazon" ? 0.98 : (p.name === "Flipkart" ? 1.02 : 1.0);
        return {
            platform: p.name,
            price: Math.floor(basePrice * dynamicFactor * platformFactor * (0.98 + Math.random() * 0.04)), 
            link: p.url
        };
    });
}

const productData = [
    // ... existing hardcoded products can stay for quick access
];

app.get("/search", async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase().trim() : "";
    if (!query) return res.json({ product: "", results: [] });

    // Fetch prices (simulated real-time fetch)
    const livePrices = await fetchPrices(query);

    // Priority matching for categories and images
    const brands = ["iphone", "macbook", "samsung", "nike", "adidas", "puma", "jordans"];
    const matchedBrand = brands.find(brand => query.includes(brand));

    // Image mappings
    const imageMap = {
        nike: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
        adidas: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=600",
        puma: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
        iphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
        macbook: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600",
        headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
        laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600",
        phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
        watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
        camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600",
        groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
        shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
        shirt: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
        default: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
    };

    let matchedKey;
    if (matchedBrand) {
        matchedKey = matchedBrand;
    } else {
        const sortedKeys = Object.keys(imageMap).filter(k => k !== "default" && !brands.includes(k)).sort((a, b) => b.length - a.length);
        matchedKey = sortedKeys.find(key => query.includes(key)) || "default";
    }

    const finalProduct = {
        name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: matchedKey.toUpperCase(),
        brand: matchedBrand ? matchedBrand.toUpperCase() : "Global Search",
        image: imageMap[matchedKey],
        prices: livePrices
    };

    res.json({ product: query, results: [finalProduct] });
});

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
