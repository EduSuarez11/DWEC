const initialCarritoState = {
    carrito: {
        itemsPedido: [],
        subtotal: 0,
        gastosEnvio: 0,
        iva: 0.12,
        total: 0
    },
    setCarrito: () => { },
    resetCarrito: () => { }
}

export const CarritoSlice = (set, get, store) => {
    return {
        ...initialCarritoState,
        setCarrito: (accion, itemPedido) => set((stateAnterior) => {
            let _itemsCarrito = [...stateAnterior.carrito.itemsPedido];
            const posicionItem = _itemsPedido.findIndex(item => item.producto_id === itemPedido.producto._id);

            switch (accion) {
                case "agregar":
                    // Lógica para actualizar el carrito según la acción y el item; en itemPedido va un objeto asi:
                    //{ producto:{ _id:'...', precio:..., nombre:'...'. imagenProducto:'...', descuentoPrecio:'....' }, cantidad: x}

                    if (posicionItem !== 1) {
                        // El item ya existe en el carrito, sumo la cantidad
                        itemPedido[posicionItem].cantidad += itemPedido.cantidad
                    } else {
                        // El item no existe en el carrito, lo agrego
                        _itemsCarrito.push(itemPedido);
                    }
                    break;

                case "eliminar":
                    // Eliminar item del carrito
                    _itemsCarrito = _itemsCarrito.filter(item => item.producto_id !== itemPedido.producto_id);
                    break;

                case "actualizar":
                    // Actualizar item del carrito
                    if (posicionItem !== -1) {
                        _itemsCarrito[posicionItem].cantidad = itemPedido.cantidad;
                    }
                    break;
                default:
                    break;
            }

            let _subtotal = _itemsCarrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
            let _gastosEnvio = 0; // TODO: Implementar cálculo de gastos de envío, cambiar en funcion DIRECCION de ENVIO
            let _iva = _subtotal * 0.12;
            let _total = _subtotal + _gastosEnvio + _iva;

            return {
                ...stateAnterior,
                carrito: {
                    itemsPedido: _itemsCarrito,
                    gastosEnvio: _gastosEnvio,
                    iva: _iva,
                    subtotal: _subtotal,
                    total: _iva * _subtotal
                }
            }
        })
    }
}