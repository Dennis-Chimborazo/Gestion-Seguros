import React, {useEffect,useState} from "react";
import Select from "react-select";
import SegurosAdminFun from "./SegurosAdminFun.js";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {Toaster,toast} from "sonner";
import swal from "sweetalert2";
import "../estilos/CrearSeguroAdmin.css";

export function CrearSeguroAdmin({ mostrarSeccion }){
    const [categorias,setCategorias]= useState([]);
    const [beneficios,setBeneficios]= useState([]);
    const [formulario,setFormulario]= useState({ 
        nom_tip_seg:'',
        descrip_tip_seg:'',
        pago_tip_seg:'',
        suma_tip_seg:''
    });
    const [errores, setErrores] = useState({});
    const [listbeneficios,setListBeneficios]= useState([]);
    const navigate= useNavigate();

    useEffect(()=>{
        const apiCateg= async()=>{
            let api= await SegurosAdminFun.categoria(navigate);
            const apiConv = api.map((datos) => ({
                value: datos.id_categoria,
                label: datos.nom_categoria,
              }));
            setCategorias(apiConv);
        }
        apiCateg();
    },[navigate]);

    // Funciones de validación
    const validarSoloLetras = (valor) => {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return regex.test(valor);
    };

    const validarSoloNumeros = (valor) => {
        const regex = /^\d+(\.\d{1,2})?$/;
        return regex.test(valor);
    };

    const validarCampo = (nombre, valor) => {
        let error = '';
        
        switch(nombre) {
            case 'nom_tip_seg':
                if (!valor.trim()) {
                    error = 'El nombre del seguro es obligatorio';
                } else if (valor.length < 3) {
                    error = 'El nombre debe tener al menos 3 caracteres';
                } else if (valor.length > 100) {
                    error = 'El nombre no puede exceder 100 caracteres';
                } else if (!validarSoloLetras(valor)) {
                    error = 'El nombre solo puede contener letras y espacios';
                }
                break;
                
            case 'descrip_tip_seg':
                if (!valor.trim()) {
                    error = 'La descripción es obligatoria';
                } else if (valor.length < 10) {
                    error = 'La descripción debe tener al menos 10 caracteres';
                } else if (valor.length > 500) {
                    error = 'La descripción no puede exceder 500 caracteres';
                } else if (!validarSoloLetras(valor)) {
                    error = 'La descripción solo puede contener letras y espacios';
                }
                break;
                
            case 'pago_tip_seg':
                if (!valor.trim()) {
                    error = 'La prima mensual es obligatoria';
                } else if (!validarSoloNumeros(valor)) {
                    error = 'La prima solo puede contener números (ej: 50.00)';
                } else if (parseFloat(valor) <= 0) {
                    error = 'La prima debe ser mayor a 0';
                } else if (parseFloat(valor) > 999999.99) {
                    error = 'La prima no puede exceder $999,999.99';
                }
                break;
                
            case 'suma_tip_seg':
                if (!valor.trim()) {
                    error = 'La suma asegurada es obligatoria';
                } else if (!validarSoloNumeros(valor)) {
                    error = 'La suma asegurada solo puede contener números (ej: 50000.00)';
                } else if (parseFloat(valor) <= 0) {
                    error = 'La suma asegurada debe ser mayor a 0';
                } else if (parseFloat(valor) > 99999999.99) {
                    error = 'La suma asegurada no puede exceder $99,999,999.99';
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };

    const comulasBeneficios = [
        {
          name: "Seleccionar",
          cell: (row,index) => (
            <input
              type="checkbox"
              data-testid={`checkbox-${index}`}
              onChange={(e) => selecionBeneficio(e, row)}
            />
          ),
          ignoreRowClick: true,
          allowOverflow: true,
          button: true,
        },
        {
          name: "Descripción",
          selector: (row) => row.nom_beneficios,
          sortable: true,
        },
    ];

    const selecionBeneficio = (e, row) => {
      setListBeneficios(prev => {
        const exists = prev.some(item => item.id_beneficios === row.id_beneficios);
        if (exists) {
          return prev.filter(item => item.id_beneficios !== row.id_beneficios);
        } else {
          return [...prev, row];
        }
      });
    };
       
    const cargarBeneficios=async(val)=>{
        let apiBeneficio= await SegurosAdminFun.beneficios(val.value,navigate);
        setBeneficios(apiBeneficio);
    }

    const agregarClaveFormulario = (e) => {
        const { name, value } = e.target;
        
        // Aplicar restricciones en tiempo real
        let valorFiltrado = value;
        
        if (name === 'nom_tip_seg' || name === 'descrip_tip_seg') {
            // Para campos de texto: filtrar caracteres no válidos
            valorFiltrado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        } else if (name === 'pago_tip_seg' || name === 'suma_tip_seg') {
            // Para campos numéricos: permitir solo números y un punto decimal
            valorFiltrado = value.replace(/[^0-9.]/g, '');
            
            // Asegurar que solo haya un punto decimal
            const puntos = valorFiltrado.split('.');
            if (puntos.length > 2) {
                valorFiltrado = puntos[0] + '.' + puntos.slice(1).join('');
            }
            
            // Limitar decimales a 2 dígitos
            if (puntos.length === 2 && puntos[1].length > 2) {
                valorFiltrado = puntos[0] + '.' + puntos[1].substring(0, 2);
            }
        }
        
        // Actualizar formulario
        setFormulario({...formulario, [name]: valorFiltrado});
        
        // Validar campo
        const error = validarCampo(name, valorFiltrado);
        setErrores(prev => ({
            ...prev,
            [name]: error
        }));
    }

    const validarFormularioCompleto = () => {
        const nuevosErrores = {};
        let esValido = true;
        
        Object.keys(formulario).forEach(campo => {
            const error = validarCampo(campo, formulario[campo]);
            if (error) {
                nuevosErrores[campo] = error;
                esValido = false;
            }
        });
        
        setErrores(nuevosErrores);
        return esValido;
    };

    const guardarTipoSeguro = async (e) => {
        e.preventDefault();
        
        // Validar formulario completo
        if (!validarFormularioCompleto()) {
            toast.error("Por favor corrija los errores en el formulario ⚠️");
            return;
        }
        
        // Validar que todos los campos estén llenos
        if (!Object.values(formulario).every(valor => valor.trim() !== '')) {
            toast.error("Faltan campos por llenar ⚠️");
            return;
        }
        
        // Validar beneficios seleccionados
        if (listbeneficios.length === 0) {
            toast.error("Debe seleccionar mínimo un beneficio ⚠️");
            return;
        }
        
        try {
            const res = await SegurosAdminFun.guardarTipoSeguro(formulario, navigate);
            guardarBeneficios(res.data.id_tip_seg);
            swal.fire({
                title:"<label>Éxito</label>",
                text:"Nuevo Seguro creado",
                timer:3500,
            });
            mostrarSeccion("segurosAdmin");
        } catch (error) {
            swal.fire({
                title:"<label>Advertencia</label>",
                text:"Este seguro ya existe",
                timer:3500,
            });
        }
    };

    const guardarBeneficios = async (id) => {
        const valores = listbeneficios.map(b => [id, b.id_beneficios]);
        await SegurosAdminFun.guardarBeneficioSeguro(valores, navigate);
    };

    const cancelarOperacion = (e) => {
        e.preventDefault();
        
        if (Object.values(formulario).some(valor => valor !== '') || listbeneficios.length > 0) {
            swal.fire({
                title:"<label>Confirmación</label>",
                text:"¿Desea descartar los avances?",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Sí"
            }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    mostrarSeccion("segurosAdmin");
                }
            });
        } else {
            mostrarSeccion("segurosAdmin");
        }
    }

    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: 'transparent',
            },
        },
        headRow: {
            style: {
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderTop: 'none',
            },
        },
        headCells: {
            style: {
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                color: '#ffffff',
                letterSpacing: '0.5px',
            },
        },
        rows: {
            style: {
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: 'rgba(103, 126, 234, 0.05)',
                    transform: 'translateX(2px)',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '1rem',
                paddingRight: '1rem',
                fontSize: '0.95rem',
                color: '#2d3748',
            },
        },
        noData: {
            style: {
                background: 'white',
                color: '#718096',
                fontStyle: 'italic',
                padding: '3rem',
                textAlign: 'center',
            },
        },
    };

    return (
        <div className="crear-seguro-container">
            <div className="crear-seguro-form">
                <form onSubmit={guardarTipoSeguro}>
                    <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
                    <h2 className="crear-seguro-title">Nuevo Seguro</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nom_tip_seg">Nombre del seguro</label>
                            <input 
                                type="text" 
                                name="nom_tip_seg" 
                                id="nom_tip_seg" 
                                value={formulario.nom_tip_seg}
                                onChange={agregarClaveFormulario}
                                className={errores.nom_tip_seg ? 'error' : ''}
                                placeholder="Solo letras y espacios"
                                maxLength="100"
                            />
                            {errores.nom_tip_seg && (
                                <span className="error-message">{errores.nom_tip_seg}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="descrip_tip_seg">Descripción</label>
                            <textarea 
                                name="descrip_tip_seg" 
                                id="descrip_tip_seg" 
                                value={formulario.descrip_tip_seg}
                                onChange={agregarClaveFormulario}
                                className={errores.descrip_tip_seg ? 'error' : ''}
                                placeholder="Solo letras y espacios (mínimo 10 caracteres)"
                                maxLength="500"
                                rows="4"
                            />
                            {errores.descrip_tip_seg && (
                                <span className="error-message">{errores.descrip_tip_seg}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="categoria">Categoría</label>
                            <Select
                                options={categorias}
                                onChange={(e) => cargarBeneficios(e)}
                                placeholder="Seleccione una categoría"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="beneficios">Beneficios</label>
                            <div className="beneficios-table-container">
                                <DataTable
                                    columns={comulasBeneficios}
                                    data={beneficios}
                                    noDataComponent="No hay categoría seleccionada"
                                    customStyles={customStyles}
                                    persistTableHead
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pago_tip_seg">Prima mensual o anual (costo base)</label>
                            <div className="input-with-currency">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="text"
                                    placeholder="50.00"
                                    name="pago_tip_seg"
                                    id="pago_tip_seg"
                                    value={formulario.pago_tip_seg}
                                    onChange={agregarClaveFormulario}
                                    className={errores.pago_tip_seg ? 'error' : ''}
                                />
                            </div>
                            {errores.pago_tip_seg && (
                                <span className="error-message">{errores.pago_tip_seg}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="suma_tip_seg">Suma asegurada máxima</label>
                            <div className="input-with-currency">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="text"
                                    placeholder="50000.00"
                                    name="suma_tip_seg"
                                    id="suma_tip_seg"
                                    value={formulario.suma_tip_seg}
                                    onChange={agregarClaveFormulario}
                                    className={errores.suma_tip_seg ? 'error' : ''}
                                />
                            </div>
                            {errores.suma_tip_seg && (
                                <span className="error-message">{errores.suma_tip_seg}</span>
                            )}
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn-guardar">Guardar</button>
                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={cancelarOperacion}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CrearSeguroAdmin;