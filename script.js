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

// --- 2. AGREGAR AL CARRITO (CON EFECTO VERDE) ---
window.agregarAlCarrito = function(nombre, precio, imagen, boton) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Guardamos el producto
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // EFECTO VISUAL EN EL BOTÓN
    if (boton) {
        const textoOriginal = boton.innerText;
        const colorOriginal = boton.style.backgroundColor;

        boton.innerText = "¡Añadido! ✓";
        boton.style.backgroundColor = "#28a745"; // Verde
        boton.style.color = "white";
        
        setTimeout(() => {
            boton.innerText = textoOriginal;
            boton.style.backgroundColor = colorOriginal;
            boton.style.color = "";
        }, 2000);
    }

    actualizarContador();
    if (document.getElementById('items-carrito')) renderizarCarrito();
};

// --- 3. ACTUALIZAR EL NUMERITO DEL CARRITO ---
function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadores = document.querySelectorAll('.cart-count'); 
    contadores.forEach(c => {
        c.innerText = carrito.length;
        c.style.display = carrito.length > 0 ? "block" : "none";
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
            <div class="item-carrito" style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <img src="${item.image || item.imagen}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                <div class="info-item">
                    <h4 style="margin: 0;">${item.nombre}</h4>
                    <p style="margin: 5px 0;">$${item.precio.toLocaleString()}</p>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="margin-left: auto; color: red; background: none; border: none; cursor: pointer;">Eliminar</button>
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

// --- 5. PAGO SEGURO ---
async function finalizarCompra() {
    const totalVenta = localStorage.getItem('totalAPagar');
    // Si el total es solo el envío o menos, no dejar pagar
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
        alert("Hubo un problema al conectar con Mercado Pago. Revisa tu conexión.");
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

// --- 6. INICIALIZACIÓN ---
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

