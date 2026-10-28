import { getProductoApiUrl, productosCacheContext, productoCacheHitContext } from './routerContext.js';

export async function UrlInCacheMiddleware({ context, params }, next) {
    const urlProducto = getProductoApiUrl(params.idProducto);
    const productosCache = context.get(productosCacheContext);
    const cacheHit = productosCache.has(urlProducto);

    context.set(productoCacheHitContext, cacheHit);
    
    console.log(
        cacheHit
            ? '===> el producto ya estaba en la cache, el loader no hara fetch:'
            : '===> el producto no estaba en la cache, el loader hara fetch:',
        urlProducto,
    )

    return next();
}