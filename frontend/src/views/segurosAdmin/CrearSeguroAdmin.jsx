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
    const [formulario,setFormulario]= useState({ nom_tip_seg:'',descrip_tip_seg:'',pago_tip_seg:'',suma_tip_seg:''});
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
      const agregarClaveFormulario  =(e)=>{
        setFormulario({...formulario,[e.target.name]:e.target.value})
    }

    const guardarTipoSeguro= async(e)=>{
      e.preventDefault()
      if (Object.values(formulario).every(valor => valor !== '')) {

        if (listbeneficios.length === 0) {
        toast.error("Debe seleccionar minimo un beneficio ⚠️");
        }else{
          try {
              const res = await SegurosAdminFun.guardarTipoSeguro(formulario, navigate);
              guardarBeneficios(res.data.id_tip_seg);
              swal.fire({
                      title:"<label>Exito</label>",
                      text:"Nuevo Seguro creado",
                      timer:3500,})
                      mostrarSeccion("segurosAdmin")
            } catch (error) {
                swal.fire({
                      title:"<label>Advertencia</label>",
                      text:"Este seguro ya existe",
                      timer:3500,})
            }
        }
      }else{
        toast.error("Faltan campos por llenar ⚠️");
      }    }

    const guardarBeneficios = async (id) => {
      const valores = listbeneficios.map(b => [id, b.id_beneficios]);
      await SegurosAdminFun.guardarBeneficioSeguro(valores, navigate);
    };
    const cancelarOperacion = (e)=>{
      e.preventDefault()
      console.log("cancelarOperacion")
      if (Object.values(formulario).some(valor => valor !== '')||listbeneficios.length>0) {
      console.log("if")

        swal.fire({
                title:"<label>Confirmacion</label>",
                text:"Desea descartar los Avances",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
            }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    mostrarSeccion("segurosAdmin")
                }
            });
      }else{
          mostrarSeccion("segurosAdmin")

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
              <input type="text" name="nom_tip_seg" id="nom_tip_seg" onChange={agregarClaveFormulario} />
            </div>
    
            <div className="form-group">
              <label htmlFor="descrip_tip_seg">Descripción</label>
              <textarea name="descrip_tip_seg" id="descrip_tip_seg" onChange={agregarClaveFormulario}></textarea>
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
              <input
                type="text"
                placeholder="Ej.: $50/mes"
                name="pago_tip_seg"
                id="pago_tip_seg"
                onChange={agregarClaveFormulario}
              />
            </div>
    
            <div className="form-group">
              <label htmlFor="suma_tip_seg">Suma asegurada máxima</label>
              <input
                type="text"
                placeholder="En caso de fallecimiento"
                name="suma_tip_seg"
                id="suma_tip_seg"
                onChange={agregarClaveFormulario}
              />
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