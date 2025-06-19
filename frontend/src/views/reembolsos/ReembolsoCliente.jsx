import React, { useState } from 'react';

const ReembolsoCliente = () => {
 return (
    <div>
        <div>
          <label htmlFor="">Motivo de reembolso</label>
          <input type="text" id="motivo" name="motivo" placeholder="Motivo de reembolso" />
          <button>Guardar</button>
        </div>

    </div>
  );
};

export default ReembolsoCliente;    