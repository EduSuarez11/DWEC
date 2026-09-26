import './TuCatalogo.css';
import { useParams } from 'react-router';
//import { useState } from 'react';

import MostrarAnuncios from './MostrarAnuncios/MostrarAnuncios';
import SubirTuAnuncio from './SubirTuAnuncio/SubirTuAnuncio';

function TuCatalogo() {
  const { operacion } = useParams(); //<--- puede valer: 'upload': para subir un producto a la venta, 'published': para mostrar los productos publicados a la venta
  //const [selectedOperation, setSelectedOperation] = useState(operacion);

  console.log('Operacion en TuCatalogo: ', operacion);
  //para hacer q se el comp.padre cuando cambie el segmento dinamico :operacion de la url, se vuelva a cargar el componente hijo correspondiente a ese segmento dinamico, se le puede poner una key al componente hijo con el valor del segmento dinamico :operacion,
  //  de esta forma, cada vez que cambie el segmento dinamico :operacion de la url, se volvera a cargar el componente hijo correspondiente a ese segmento dinamico, ya que al cambiar la key del componente hijo, React lo considera como un nuevo componente y
  //  lo vuelve a renderizar desde cero, en lugar de actualizar el componente existente, lo que es especialmente útil cuando el componente hijo tiene lógica de carga de datos o efectos secundarios que deben ejecutarse cada vez que se accede a
  //  una nueva categoría o sección dentro del catálogo. 
  
  // Si no se usara la key, al cambiar el segmento dinamico :operacion de la url, React intentaría reutilizar el mismo componente hijo, lo que podría llevar a problemas de actualización incorrecta o a que no se ejecuten los efectos secundarios
  //  necesarios para cargar los datos correspondientes a la nueva categoría o sección seleccionada por el usuario.

  //lo podria meter en el state del componente padre, pero como el segmento dinamico :operacion de la url ya lo tengo disponible con useParams, no es necesario meterlo en el state del componente padre, ya que cada vez que cambie el segmento dinamico :operacion de la url, 
  // el componente padre se volvera a renderizar con el nuevo valor de :operacion, y por lo tanto, se volvera a cargar el componente hijo correspondiente a ese nuevo valor de :operacion, sin necesidad de gestionar un estado adicional para esto.
  
  return (
    <div className="container mt-4 mb-4">
      <div className="row">
        <div className="col">

          {
            operacion === 'upload' ?
              <SubirTuAnuncio key={operacion} />
            :
              <MostrarAnuncios key={operacion}/>
          }
        </div>
      </div>
    </div>
  )
}
export default TuCatalogo;