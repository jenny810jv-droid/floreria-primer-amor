// --- 1. LÓGICA VISUAL (CARRUSEL Y MENÚ) ---
const imagenes = ['img/flores-inicio.jpeg', 'img/mantenimiento.jpg', 'img/detalles.jpg'];
let indice = 0;
const hero = document.querySelector('.hero-slider');

function cambiarImagen() {
    if (!hero) return;
    indice = (indice + 1) % imagenes.length;
    hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${imagenes[indice]}')`;
}
if (hero) setInterval(cambiarImagen, 10000);

// --- 2. AGREGAR AL CARRITO (AUTOMÁTICO Y CON EFECTO VERDE) ---
window.agregarAlCarrito = function(nombre, precio, imagen) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Guardamos el producto en el almacenamiento local
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // LÓGICA PARA BUSCAR EL BOTÓN Y PONERLO VERDE
    // Buscamos en todos los botones de la página cuál contiene el nombre del producto
    const botones = document.querySelectorAll('button');
    const botonPresionado = Array.from(botones).find(b => 
        b.getAttribute('onclick') && b.getAttribute('onclick').includes(nombre)
    );

    if (botonPresionado) {
        const textoOriginal = botonPresionado.innerText;
        
        botonPresionado.innerText = "¡Añadido! ✓";
        botonPresionado.style.backgroundColor = "#28a745"; // Verde
        botonPresionado.style.color = "white";
        
        setTimeout(() => {
            botonPresionado.innerText = textoOriginal;
            botonPresionado.style.backgroundColor = ""; // Vuelve al color original del CSS
            botonPresionado.style.color = "";
        }, 2000);
    }

    actualizarContador();
    // Si estamos en la página del carrito, lo actualizamos visualmente de inmediato
    if (document.getElementById('items-carrito')) renderizarCarrito();
};

// --- 3. ACTUALIZAR EL NÚMERO DEL CARRITO EN EL MENÚ ---
function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadores = document.querySelectorAll('.cart-count'); 
    contadores.forEach(c => {
        c.innerText = carrito.length;
        c.style.display = carrito.length > 0 ? "block" : "none";
    });
}

// --- 4. RENDERIZAR CARRITO (DIBUJAR PRODUCTOS) ---
function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('items-carrito');
    const costoEnvio = 10000;
    
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; padding:20px;'>El carrito está vacío</p>";
        const totalFinalElem = document.getElementById('total-final');
        const btnPagoElem = document.getElementById('btn-finalizar-pago');
        
        if (totalFinalElem) totalFinalElem.innerText = "$0";
        if (btnPagoElem) btnPagoElem.innerText = "Pagar Total: $0";
        
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
    const totalFinalElem = document.getElementById('total-final');
    const btnPagoElem = document.getElementById('btn-finalizar-pago');

    if (totalFinalElem) totalFinalElem.innerText = `$${totalConEnvio.toLocaleString()}`;
    if (btnPagoElem) btnPagoElem.innerText = `Pagar Total: $${totalConEnvio.toLocaleString()}`;
    
    localStorage.setItem('totalAPagar', totalConEnvio);
}

window.eliminarDelCarrito = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContador();
};

// --- 5. LÓGICA DE PAGO CON MERCADO PAGO ---
async function finalizarCompra() {
    const totalVenta = localStorage.getItem('totalAPagar');
    
    if (!totalVenta || parseInt(totalVenta) <= 10000) {
        return alert("Agrega productos al carrito primero");
    }

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
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error("No se recibió la URL de pago");
        }
    } catch (e) {
        console.error("Error en el pago:", e);
        alert("Hubo un problema al conectar con Mercado Pago.");
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

// --- 6. INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    
    if (document.getElementById('items-carrito')) {
        renderizarCarrito();
    }

    const btnPago = document.getElementById('btn-finalizar-pago');
    if (btnPago) {
        btnPago.addEventListener('click', finalizarCompra);
    }
});

function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    // Buscamos el contador ya sea por ID o por Clase para que nunca falle
    const contadores = document.querySelectorAll('#cart-count, .cart-count'); 
    
    contadores.forEach(c => {
        c.innerText = carrito.length;
        // Solo mostramos el número si hay algo en el carrito
        c.style.display = carrito.length > 0 ? "flex" : "none";
    });
}
// --- LÓGICA DEL MENÚ MÓVIL (LAS TRES RAYITAS) ---
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        // Esto le pone o le quita la clase "active" al menú
        navLinks.classList.toggle('active');
        // Esto anima las rayitas para que se conviertan en una X (si tienes el CSS)
        mobileMenu.classList.toggle('is-active');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Forzamos a que el menú esté cerrado al iniciar
    if (navLinks) {
        navLinks.classList.remove('active');
    }

    if (mobileMenu && navLinks) {
        mobileMenu.onclick = (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        };
    }
});



