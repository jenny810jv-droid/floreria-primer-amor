const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
    // Configurar cabeceras para permitir que tu web se conecte
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { total } = req.body;

        const preference = {
            items: [{
                title: "Flores - El Primer Amor",
                unit_price: Number(total),
                quantity: 1,
                currency_id: "COP"
            }],
            auto_return: "approved",
            back_urls: {
                success: "https://floreria-primer-amor.vercel.app/", 
                failure: "https://floreria-primer-amor.vercel.app/carrito.html"
                pending: "https://floreria-primer-amor.vercel.app/index.html"
            }
        };

    
        const response = await mercadopago.preferences.create(preference);
        
        // Enviamos la URL de pago a tu botón
        res.status(200).json({ url: response.body.init_point });
    } catch (error) {
        console.error("Error MP:", error);
        res.status(500).json({ error: error.message });
    }
};
