let currentData = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    const categoryList = document.getElementById('categoryList');
    const sortOrder = document.getElementById('sortOrder');

    // Interactive background
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.body.style.setProperty('--mouse-x', `${x}%`);
        document.body.style.setProperty('--mouse-y', `${y}%`);
    });

    // Search on button click
    searchBtn.addEventListener('click', () => searchProduct());

    // Search on Enter key
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProduct();
    });

    // Category quick search
    categoryList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const query = li.dataset.category;
            searchBox.value = query;
            
            // Mark active
            document.querySelectorAll('#categoryList li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            
            loadResults(query);
        }
    });

    // Handle sorting
    sortOrder.addEventListener('change', () => {
        renderResults();
    });
});

function searchProduct() {
    const query = document.getElementById("searchBox").value.trim();
    if (query) loadResults(query);
}

function loadResults(query) {
    const resultsDiv = document.getElementById("results");
    const loader = document.getElementById("loader");
    const controls = document.getElementById("controls");

    currentData = [];
    resultsDiv.innerHTML = "";
    loader.style.display = "block";
    controls.style.display = "none";

    fetch(`/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
            loader.style.display = "none";
            currentData = data.results;
            
            if (currentData.length > 0) {
                controls.style.display = "flex";
                renderResults(data.product);
            } else {
                resultsDiv.innerHTML = `<p class="main-subtitle" style="text-align:center; margin-top: 40px;">No authentic prices found for "${query}". Try a different product.</p>`;
            }
        })
        .catch(err => {
            loader.style.display = "none";
            resultsDiv.innerHTML = `<p class="main-subtitle" style="color: #ef4444; text-align:center; margin-top: 40px;">Network Error: Failed to fetch live prices. Please check your connection.</p>`;
            console.error("Search error:", err);
        });
}

function renderResults(productName) {
    const resultsDiv = document.getElementById("results");
    const sortValue = document.getElementById("sortOrder").value;

    let displayData = [...currentData];

    displayData.forEach(product => {
        product.prices.sort((a, b) => a.price - b.price);
    });

    if (sortValue === "asc") {
        displayData.sort((a, b) => a.prices[0].price - b.prices[0].price);
    } else if (sortValue === "desc") {
        displayData.sort((a, b) => b.prices[0].price - a.prices[0].price);
    }

    let html = "";
    displayData.forEach(product => {
        const lowestPrice = product.prices[0].price;
        
        html += `
        <div class="product-group">
            <div class="product-visual">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info-pro">
                <span class="brand-badge">${product.brand}</span>
                <h2 class="product-name-pro">${product.name}</h2>
                
                <div class="price-options">
                    ${product.prices.map(p => `
                        <div class="price-card-pro ${p.price === lowestPrice ? "lowest" : ""}">
                            ${p.price === lowestPrice ? '<span class="lowest-badge">BEST DEAL</span>' : ''}
                            <div class="platform-label">${p.platform}</div>
                            <div class="price-value">₹${p.price.toLocaleString('en-IN')}</div>
                            <a href="${p.link}" target="_blank" class="buy-link">
                                Shop Now <span>→</span>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;
    });

    resultsDiv.innerHTML = html;
}


