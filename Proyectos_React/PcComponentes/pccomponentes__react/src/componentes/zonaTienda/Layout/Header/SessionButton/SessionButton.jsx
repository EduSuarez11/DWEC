function SessionButton({ saltarAUrl, email, icono }) {
    return (
        <button className="btn btn-light btn-sm" onClick={() => email === null && saltarAUrl('/Cliente/LoginRegistro')}>
            {email !== null && icono !== null ?
                <div className="d-flex align-items-center gap-2">
                    <img className='img-avatar rounded-circle' src={icono} style={{ width: '30px', height: '30px' }} referrerPolicy="no-referrer" />
                    <span className='text-account'>{email}</span>
                </div>
                :
                <>
                    <i className="fa-regular fa-user"></i> Mi Cuenta
                </>
            }       
        </button>
    )
}

export default SessionButton;