
const API = "https://dummyjson.com/products";
let allProducts = [];

const state = {
  search: "",
  sort: "",
  minPrice: 0,
  maxPrice: 10000,
  page: 1,
  limit: 8
};

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const paginationContainer = document.getElementById("pagination");

function renderProducts(products){
  if(products.length === 0){
    productsContainer.innerHTML = "<h2>No products found</h2>";
    return;
  }

  productsContainer.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.thumbnail}" width="100%">
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
      <p>⭐ ${p.rating}</p>
    </div>
  `).join("");
}

function applyFilters(){
  let filtered = [...allProducts];

  // SEARCH
  if(state.search){
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(state.search.toLowerCase())
    );
  }

 
  filtered = filtered.filter(p =>
    p.price >= state.minPrice && p.price <= state.maxPrice
  );

  if(state.sort === "price-asc")
    filtered.sort((a,b)=>a.price-b.price);

  if(state.sort === "price-desc")
    filtered.sort((a,b)=>b.price-a.price);

  if(state.sort === "rating")
    filtered.sort((a,b)=>b.rating-a.rating);

  
  const start = (state.page - 1) * state.limit;
  const paginated = filtered.slice(start, start + state.limit);

  renderProducts(paginated);
  renderPagination(filtered.length);
  updateURL();
}


function renderPagination(total){
  const pages = Math.ceil(total / state.limit);

  paginationContainer.innerHTML = "";

  for(let i=1;i<=pages;i++){
    const btn = document.createElement("button");
    btn.textContent = i;

    if(i === state.page)
      btn.style.fontWeight = "bold";

    btn.onclick = ()=>{
      state.page = i;
      applyFilters();
    };

    paginationContainer.appendChild(btn);
  }
}

function debounce(fn, delay){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer = setTimeout(()=>fn(...args), delay);
  };
}


function updateURL(){
  const params = new URLSearchParams(state);
  history.replaceState(null,"","?"+params.toString());
}


searchInput.addEventListener(
  "input",
  debounce(e=>{
    state.search = e.target.value;
    state.page = 1;
    applyFilters();
  },300)
);

sortSelect.addEventListener("change", e=>{
  state.sort = e.target.value;
  applyFilters();
});


async function fetchProducts(){
  try{
    productsContainer.innerHTML = "<h2>Loading...</h2>";

    const response = await fetch(API);
    const data = await response.json();

    allProducts = data.products;
    applyFilters();
  }
  catch(err){
    productsContainer.innerHTML = "<h2>Failed to load products</h2>";
    console.error(err);
  }
}

fetchProducts();
