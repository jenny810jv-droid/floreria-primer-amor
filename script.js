/// --- 1. LÓGICA VISUAL (CARRUSEL) ---
const imagenes = ['img/flores-inicio.jpeg', 'img/mantenimiento.jpg', 'img/detalles.jpg'];
let indice = 0;
const hero = document.querySelector('.hero-slider');

function cambiarImagen() {
    if (!hero) return;
    indice = (indice + 1) % imagenes.length;
    hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${imagenes[indice]}')`;
}
if (hero) setInterval(cambiarImagen, 10000);

// --- 2. AGREGAR AL CARRITO CON EFECTO VERDE ---
window.agregarAlCarrito = function(nombre, precio, imagen) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));

    const botones = document.querySelectorAll('button');
    const botonPresionado = Array.from(botones).find(b => 
        b.getAttribute('onclick') && b.getAttribute('onclick').includes(nombre)
    );

    if (botonPresionado) {
        const textoOriginal = botonPresionado.innerText;
        botonPresionado.innerText = "¡Añadido! ✓";
        botonPresionado.style.backgroundColor = "#28a745";
        botonPresionado.style.color = "white";
        setTimeout(() => {
            botonPresionado.innerText = textoOriginal;
            botonPresionado.style.backgroundColor = "";
            botonPresionado.style.color = "";
        }, 2000);
    }
    actualizarContador();
    if (document.getElementById('items-carrito')) renderizarCarrito();
};

// --- 3. ACTUALIZAR CONTADOR ---
function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadores = document.querySelectorAll('#cart-count, .cart-count'); 
    contadores.forEach(c => {
        c.innerText = carrito.length;
        c.style.display = carrito.length > 0 ? "flex" : "none";
    });
}

// --- 4. RENDERIZAR CARRITO ---
function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('items-carrito');
    const costoEnvio = 10000;
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; padding:20px;'>El carrito está vacío</p>";
        if (document.getElementById('total-final')) document.getElementById('total-final').innerText = "$0";
        if (document.getElementById('btn-finalizar-pago')) document.getElementById('btn-finalizar-pago').innerText = "Pagar Total: $0";
        localStorage.setItem('totalAPagar', 0);
        return;
    }

    contenedor.innerHTML = ""; 
    let subtotal = 0;
    carrito.forEach((item, index) => {
        subtotal += (item.precio * item.cantidad);
        contenedor.innerHTML += `
            <div class="cart-card" style="display: flex; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <img src="${item.imagen}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;" onerror="this.src='img/mantenimiento.jpg'">
                <div class="info-item">
                    <h4 style="margin: 0; color: #0a1a44;">${item.nombre}</h4>
                    <p style="margin: 5px 0; color: #d4a373; font-weight: bold;">$${item.precio.toLocaleString()}</p>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="margin-left: auto; color: #ff4757; background: #fff5f5; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">✕</button>
            </div>`;
    });

    const totalConEnvio = subtotal + costoEnvio;
    if (document.getElementById('total-final')) document.getElementById('total-final').innerText = `$${totalConEnvio.toLocaleString()}`;
    if (document.getElementById('btn-finalizar-pago')) document.getElementById('btn-finalizar-pago').innerText = `Pagar Total: $${totalConEnvio.toLocaleString()}`;
    localStorage.setItem('totalAPagar', totalConEnvio);
}

window.eliminarDelCarrito = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContador();
};

// --- 5. LÓGICA DE PAGO (CORREGIDA CON URL GRATUITA) ---
async function finalizarCompra() {
    const totalVenta = localStorage.getItem('totalAPagar');
    if (!totalVenta || parseInt(totalVenta) <= 10000) return alert("Agrega productos al carrito primero");

    const btn = document.getElementById('btn-finalizar-pago');
    const textoOriginal = btn.innerText;
    btn.innerText = "Conectando...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/crear-pago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total: totalVenta })
        });
        const data = await response.json();
        if (data.url) window.location.href = data.url;
        else throw new Error("Error en URL");
    } catch (e) {
        alert("Error al conectar con Mercado Pago");
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

// --- 6. INICIALIZACIÓN Y MENÚ MÓVIL (ÚNICA VERSIÓN) ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    if (document.getElementById('items-carrito')) renderizarCarrito();

    const btnPago = document.getElementById('btn-finalizar-pago');
    if (btnPago) btnPago.addEventListener('click', finalizarCompra);

    // LÓGICA DEL MENÚ (REDISEÑADA PARA NO TRABARSE)
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        // Aseguramos que empiece cerrado
        navLinks.classList.remove('active');

        mobileMenu.onclick = (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        };

        // Cerrar automáticamente al tocar un link
        navLinks.querySelectorAll('a').forEach(link => {
            link.onclick = () => navLinks.classList.remove('active');
        });

        // Cerrar si tocan fuera
        document.onclick = (e) => {
            if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        };
    }
});





