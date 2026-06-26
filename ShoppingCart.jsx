import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080";

// ── helpers ────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PAYMENT_LABELS = { PIX: "Pix", DEBIT: "Débito", CREDIT: "Crédito" };
const STATUS_LABELS = { OPEN: "Aberto", SOLD: "Pago" };

// ── icons (inline svg) ─────────────────────────────────────
const IconCart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconMinus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconLoading = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ── CATEGORY IMAGES from Platzi Fake Store ─────────────────
const categoryImages = {
  "Clothes": "👕",
  "Electronics": "💻",
  "Furniture": "🛋️",
  "Shoes": "👟",
  "Miscellaneous": "🎁",
};

// ── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [clientId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [payModal, setPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState("PIX");
  const [addingId, setAddingId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load products
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoading(false); showToast("Não foi possível carregar produtos. Verifique se o backend está rodando.", "error"); });
  }, []);

  const cartItems = basket?.products || [];
  const cartCount = cartItems.reduce((s, p) => s + p.quantity, 0);

  // Build basket payload from local cart state
  const buildPayload = useCallback((items) => ({
    id: clientId,
    products: items.map((p) => ({ id: p.id, quantity: p.quantity })),
  }), [clientId]);

  const syncBasket = async (items) => {
    setCartLoading(true);
    try {
      let res;
      if (!basket) {
        res = await fetch(`${API_BASE}/basket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(items)),
        });
      } else {
        res = await fetch(`${API_BASE}/basket/${basket.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(items)),
        });
      }
      if (res.ok) { const data = await res.json(); setBasket(data); }
    } catch {
      // backend offline — keep local state
    } finally { setCartLoading(false); }
  };

  const addToCart = async (product) => {
    setAddingId(product.id);
    const existing = cartItems.find((p) => p.id === product.id);
    const newItems = existing
      ? cartItems.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      : [...cartItems, { id: product.id, title: product.title, price: product.price, quantity: 1 }];

    // Optimistic UI
    setBasket((prev) => ({ ...(prev || {}), products: newItems }));
    await syncBasket(newItems);
    showToast(`${product.title} adicionado ao carrinho`);
    setAddingId(null);
  };

  const changeQty = async (productId, delta) => {
    const newItems = cartItems
      .map((p) => p.id === productId ? { ...p, quantity: p.quantity + delta } : p)
      .filter((p) => p.quantity > 0);
    setBasket((prev) => ({ ...prev, products: newItems }));
    await syncBasket(newItems);
  };

  const removeItem = async (productId) => {
    const newItems = cartItems.filter((p) => p.id !== productId);
    setBasket((prev) => ({ ...prev, products: newItems }));
    await syncBasket(newItems);
    showToast("Item removido");
  };

  const handlePay = async () => {
    setPayLoading(true);
    try {
      const res = await fetch(`${API_BASE}/basket/${basket.id}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payMethod),
      });
      if (res.ok) {
        const data = await res.json();
        setBasket(data);
        setPayModal(false);
        setCartOpen(false);
        showToast("Pagamento realizado com sucesso! 🎉");
      }
    } catch { showToast("Erro ao processar pagamento.", "error"); }
    finally { setPayLoading(false); }
  };

  const deleteBasket = async () => {
    if (!basket) return;
    await fetch(`${API_BASE}/basket/${basket.id}`, { method: "DELETE" });
    setBasket(null);
    setCartOpen(false);
    showToast("Carrinho esvaziado");
  };

  const total = cartItems.reduce((s, p) => s + p.price * p.quantity, 0);
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #0a0a0f;
          color: #e8e8f0;
          min-height: 100vh;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* ── HEADER ── */
        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem; font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .logo span { color: #10b981; }
        .header-right { display: flex; align-items: center; gap: 1rem; }
        .search-bar {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: #e8e8f0;
          font-size: 0.875rem;
          width: 240px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-bar::placeholder { color: #666; }
        .search-bar:focus { border-color: #10b981; }

        .cart-btn {
          position: relative;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 10px;
          padding: 0.5rem 1rem;
          color: #10b981;
          cursor: pointer;
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; font-weight: 600;
          transition: all 0.2s;
        }
        .cart-btn:hover { background: rgba(16,185,129,0.25); border-color: #10b981; }
        .badge {
          position: absolute; top: -6px; right: -6px;
          background: #10b981; color: #000;
          border-radius: 999px; width: 20px; height: 20px;
          font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          animation: pulse 0.3s ease;
        }

        /* ── MAIN GRID ── */
        .main { padding: 2.5rem 2rem; max-width: 1280px; margin: 0 auto; }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem; font-weight: 800;
          color: #fff; margin-bottom: 0.5rem;
        }
        .section-sub { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }

        /* ── PRODUCT CARD ── */
        .card {
          background: #12121a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          display: flex; flex-direction: column;
          animation: fadeUp 0.35s ease both;
          transition: border-color 0.2s, transform 0.2s;
        }
        .card:hover { border-color: rgba(16,185,129,0.3); transform: translateY(-2px); }
        .card-img {
          background: #1a1a24;
          height: 160px;
          display: flex; align-items: center; justify-content: center;
          font-size: 3.5rem;
        }
        .card-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
        .card-title { font-size: 0.875rem; font-weight: 600; color: #e8e8f0; line-height: 1.4; margin-bottom: 0.5rem; }
        .card-price { font-size: 1.1rem; font-weight: 700; color: #10b981; margin-bottom: 1rem; }
        .add-btn {
          margin-top: auto;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 8px;
          padding: 0.6rem;
          color: #10b981;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.2s;
          width: 100%;
        }
        .add-btn:hover:not(:disabled) { background: #10b981; color: #000; }
        .add-btn:disabled { opacity: 0.5; cursor: wait; }

        /* ── CART DRAWER ── */
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 200; backdrop-filter: blur(4px);
        }
        .drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 420px; max-width: 100vw;
          background: #0f0f18;
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 201;
          animation: slideIn 0.3s ease;
          display: flex; flex-direction: column;
        }
        .drawer-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .drawer-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 800; color: #fff;
        }
        .close-btn {
          background: rgba(255,255,255,0.06); border: none;
          border-radius: 8px; padding: 0.4rem;
          color: #888; cursor: pointer; display: flex;
          transition: all 0.2s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .drawer-body { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
        .drawer-body::-webkit-scrollbar { width: 4px; }
        .drawer-body::-webkit-scrollbar-track { background: transparent; }
        .drawer-body::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

        .empty-cart { text-align: center; padding: 3rem 1rem; color: #444; }
        .empty-cart svg { opacity: 0.2; margin-bottom: 1rem; }
        .empty-cart p { font-size: 0.875rem; }

        .cart-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.875rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          animation: fadeUp 0.2s ease;
        }
        .item-emoji { font-size: 1.75rem; width: 44px; text-align: center; }
        .item-info { flex: 1; min-width: 0; }
        .item-name { font-size: 0.8rem; font-weight: 600; color: #e8e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .item-price { font-size: 0.75rem; color: #10b981; margin-top: 2px; }
        .qty-ctrl { display: flex; align-items: center; gap: 0.4rem; }
        .qty-btn {
          background: rgba(255,255,255,0.07); border: none;
          border-radius: 6px; width: 28px; height: 28px;
          color: #e8e8f0; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .qty-btn:hover { background: rgba(255,255,255,0.15); }
        .qty-num { font-size: 0.875rem; font-weight: 600; min-width: 20px; text-align: center; }
        .remove-btn {
          background: transparent; border: none;
          color: #444; cursor: pointer; padding: 0.25rem;
          border-radius: 6px; display: flex;
          transition: color 0.15s;
        }
        .remove-btn:hover { color: #ef4444; }

        .drawer-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .total-label { font-size: 0.875rem; color: #888; }
        .total-value { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #10b981; }

        .basket-status {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; font-weight: 600;
          padding: 0.25rem 0.75rem; border-radius: 999px;
          margin-bottom: 1rem;
        }
        .status-open { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .status-sold { background: rgba(16,185,129,0.15); color: #10b981; }

        .pay-btn {
          width: 100%; padding: 0.875rem;
          background: #10b981; border: none;
          border-radius: 10px; color: #000;
          font-size: 0.9rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s, transform 0.1s;
        }
        .pay-btn:hover:not(:disabled) { background: #0d9868; }
        .pay-btn:active:not(:disabled) { transform: scale(0.98); }
        .pay-btn:disabled { opacity: 0.5; cursor: wait; }
        .clear-btn {
          width: 100%; margin-top: 0.75rem; padding: 0.6rem;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #666;
          font-size: 0.8rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
        }
        .clear-btn:hover { border-color: #ef4444; color: #ef4444; }

        /* ── PAY MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 300; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .modal {
          background: #13131e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 2rem;
          width: 340px; animation: fadeUp 0.25s ease;
        }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
        .modal-sub { font-size: 0.8rem; color: #666; margin-bottom: 1.5rem; }
        .pay-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pay-option {
          padding: 0.875rem 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; gap: 0.75rem;
          transition: all 0.15s; background: transparent;
          text-align: left; color: #e8e8f0;
        }
        .pay-option:hover { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.05); }
        .pay-option.selected { border-color: #10b981; background: rgba(16,185,129,0.12); }
        .pay-option-icon { font-size: 1.25rem; }
        .pay-option-label { font-size: 0.875rem; font-weight: 600; }
        .pay-option-desc { font-size: 0.75rem; color: #666; margin-top: 1px; }
        .check { margin-left: auto; color: #10b981; opacity: 0; transition: opacity 0.15s; }
        .selected .check { opacity: 1; }
        .confirm-btn {
          width: 100%; padding: 0.875rem;
          background: #10b981; border: none; border-radius: 10px;
          color: #000; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s;
        }
        .confirm-btn:hover:not(:disabled) { background: #0d9868; }
        .confirm-btn:disabled { opacity: 0.5; cursor: wait; }
        .cancel-link {
          display: block; text-align: center; margin-top: 0.75rem;
          color: #555; font-size: 0.8rem; cursor: pointer;
          transition: color 0.15s;
        }
        .cancel-link:hover { color: #e8e8f0; }

        /* ── TOAST ── */
        .toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          z-index: 400;
          padding: 0.75rem 1.25rem;
          border-radius: 10px; font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; gap: 0.5rem;
          animation: toastIn 0.25s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          white-space: nowrap;
        }
        .toast-success { background: #10b981; color: #000; }
        .toast-error { background: #ef4444; color: #fff; }

        /* ── SKELETON ── */
        .skeleton { background: linear-gradient(90deg, #1a1a24 25%, #22222e 50%, #1a1a24 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .skeleton-card { height: 280px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .header { padding: 0 1rem; }
          .search-bar { width: 140px; }
          .main { padding: 1.5rem 1rem; }
          .drawer { width: 100vw; }
        }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="logo">shop<span>.</span>cart</div>
        <div className="header-right">
          <input
            className="search-bar"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            <IconCart />
            Carrinho
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        <h1 className="section-title">Produtos</h1>
        <p className="section-sub">
          {loading ? "Carregando catálogo..." : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""} disponível${filtered.length !== 1 ? "eis" : ""}`}
        </p>

        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.05}s` }} />
              ))
            : filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={addToCart}
                  adding={addingId === p.id}
                  style={{ animationDelay: `${i * 0.04}s` }}
                />
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#444" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</p>
            <p>Nenhum produto encontrado para "<strong style={{color:"#666"}}>{search}</strong>"</p>
          </div>
        )}
      </main>

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div className="overlay" onClick={() => setCartOpen(false)} />
          <aside className="drawer">
            <div className="drawer-header">
              <div className="drawer-title">
                Meu Carrinho {cartLoading && <IconLoading />}
              </div>
              <button className="close-btn" onClick={() => setCartOpen(false)}><IconX /></button>
            </div>

            <div className="drawer-body">
              {basket?.status && (
                <div className={`basket-status ${basket.status === "OPEN" ? "status-open" : "status-sold"}`}>
                  {basket.status === "OPEN" ? "●" : <IconCheck />}
                  {STATUS_LABELS[basket.status]}
                  {basket.paymentMethod && ` — ${PAYMENT_LABELS[basket.paymentMethod]}`}
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div><IconCart /></div>
                  <p>Seu carrinho está vazio.<br/>Adicione produtos para começar.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="item-emoji">{categoryImages["Miscellaneous"]}</div>
                    <div className="item-info">
                      <div className="item-name">{item.title}</div>
                      <div className="item-price">{fmt(item.price * item.quantity)}</div>
                    </div>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => changeQty(item.id, -1)}><IconMinus /></button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.id, 1)}><IconPlus /></button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}><IconTrash /></button>
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer">
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">{fmt(total)}</span>
              </div>

              {cartItems.length > 0 && basket?.status !== "SOLD" && (
                <>
                  <button className="pay-btn" onClick={() => setPayModal(true)} disabled={cartLoading}>
                    <IconCheck />
                    Finalizar pedido
                  </button>
                  <button className="clear-btn" onClick={deleteBasket}>
                    Limpar carrinho
                  </button>
                </>
              )}
              {basket?.status === "SOLD" && (
                <div style={{textAlign:"center", padding:"0.75rem", color:"#10b981", fontSize:"0.875rem", fontWeight:600}}>
                  ✓ Pedido finalizado com sucesso!
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* PAYMENT MODAL */}
      {payModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Forma de pagamento</div>
            <div className="modal-sub">Escolha como deseja pagar seu pedido de {fmt(total)}</div>
            <div className="pay-options">
              {[
                { id: "PIX", icon: "⚡", label: "Pix", desc: "Aprovação instantânea" },
                { id: "DEBIT", icon: "💳", label: "Débito", desc: "Debitado imediatamente" },
                { id: "CREDIT", icon: "🪙", label: "Crédito", desc: "Parcele em até 12x" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={`pay-option ${payMethod === opt.id ? "selected" : ""}`}
                  onClick={() => setPayMethod(opt.id)}
                >
                  <span className="pay-option-icon">{opt.icon}</span>
                  <div>
                    <div className="pay-option-label">{opt.label}</div>
                    <div className="pay-option-desc">{opt.desc}</div>
                  </div>
                  <span className="check"><IconCheck /></span>
                </button>
              ))}
            </div>
            <button className="confirm-btn" onClick={handlePay} disabled={payLoading}>
              {payLoading ? <IconLoading /> : <IconCheck />}
              Confirmar pagamento
            </button>
            <span className="cancel-link" onClick={() => setPayModal(false)}>Cancelar</span>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? <IconCheck /> : "⚠"}
          {toast.msg}
        </div>
      )}
    </>
  );
}

function ProductCard({ product, onAdd, adding, style }) {
  const fmt = (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const emoji = ["👕","💻","🛋️","👟","🎁","📱","⌚","🎮","📷","🎧"][product.id % 10];

  return (
    <div className="card" style={style}>
      <div className="card-img">{emoji}</div>
      <div className="card-body">
        <div className="card-title">{product.title}</div>
        <div className="card-price">{fmt(product.price)}</div>
        <button className="add-btn" onClick={() => onAdd(product)} disabled={adding}>
          {adding ? <IconLoading /> : <IconPlus />}
          {adding ? "Adicionando..." : "Adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );

  function IconLoading() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    );
  }
  function IconPlus() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  }
}
