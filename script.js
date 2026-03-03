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
        boton.innerText = "¡Añadido! ✓";
        boton.style.backgroundColor = "#28a745"; // Verde
        boton.style.color = "white";
        
        setTimeout(() => {
            boton.innerText = textoOriginal;
            boton.style.backgroundColor = ""; // Vuelve al color original
            boton.style.color = "";
        }, 2000);
    }

    actualizarContador();
    if (document.getElementById('items-carrito')) renderizarCarrito();
};

// --- 3. ACTUALIZAR EL NUMERITO DEL CARRITO ---
function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadores = document.querySelectorAll('.cart-count'); // Asegúrate que tu HTML use esta clase
    contadores.forEach(c => {
        c.innerText = carrito.length;
        c.style.display = carrito.length > 0 ? "block" : "none";
    });
}

// --- 4. RENDERIZAR CARRITO (SIN EL ERROR DEL $0) ---
function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('items-carrito');
    const costoEnvio = 10000;
    
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>El carrito está vacío</p>";
        document.getElementById('total-final').innerText = "$0";
        document.getElementById('btn-finalizar-pago').innerText = "Pagar Total: $0";
        localStorage.setItem('totalAPagar', 0);
        return;
    }

    contenedor.innerHTML = ""; 
    let subtotal = 0;

    carrito.forEach((item, index) => {
        subtotal += (item.precio * item.cantidad);
        contenedor.innerHTML += `
            <div class="item-carrito" style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <img src="${item.imagen}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                <div class="info-item">
                    <h4 style="margin: 0;">${item.nombre}</h4>
                    <p style="margin: 5px 0;">$${item.precio.toLocaleString()}</p>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="margin-left: auto; color: red; background: none; border: none; cursor: pointer;">Eliminar</button>
            </div>`;
    });

    const totalConEnvio = subtotal + costoEnvio;
    
    // Actualizamos los textos de los totales
    document.getElementById('total-final').innerText = `$${totalConEnvio.toLocaleString()}`;
    const btnPago = document.getElementById('btn-finalizar-pago');
    if (btnPago) {
        btnPago.innerText = `Pagar Total: $${totalConEnvio.toLocaleString()}`;
    }
    
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
    if (!totalVenta || totalVenta <= 10000) return alert("Agrega productos primero");

    const btn = document.getElementById('btn-finalizar-pago');
    btn.innerText = "Conectando...";
    btn.disabled = true;

    try {
        const response = await fetch('/.netlify/functions/crear-pago', {
            method: 'POST',
            body: JSON.stringify({ total: totalVenta })
        });
        const data = await response.json();
        if (data.url) window.location.href = data.url;
    } catch (e) {
        alert("Error de conexión");
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    renderizarCarrito();
});