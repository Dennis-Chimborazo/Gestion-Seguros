import React, {useEffect,useState} from "react";
import Select from "react-select";
import SegurosAdminFun from "./SegurosAdminFun.js";
import DataTable from "react-data-table-component";
import { useNavigate,useLocation } from "react-router-dom";
import {Toaster,toast} from "sonner";
import swal from "sweetalert2";
import styles from "../estilos/Seguros.module.css"; 

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

    },[]);

    const comulasBeneficios = [
        {
          name: "Seleccionar",
          cell: (row) => (
            <input
              type="checkbox"
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

        if (listbeneficios.length==0) {
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
      }

    }

    const guardarBeneficios = async (id) => {
      const valores = listbeneficios.map(b => [id, b.id_beneficios]);
      const res = await SegurosAdminFun.guardarBeneficioSeguro(valores, navigate);
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


  
  const cancelar = () => {
    const algunCampoLleno = Object.values(formulario).some(valor => valor.trim() !== '');
    if (algunCampoLleno) {
        swal.fire({
            title: "⚠️ <label>Advertencia</label>",
            text: "Desea descartar los datos ingresados",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Si"
        }).then(respuesta => {
            if (respuesta.isConfirmed) {
                mostrarSeccion("segurosAdmin")
            }
        });

    } else {
        mostrarSeccion("segurosAdmin")
    }
};
  
  const customStyles = {
    header: {
        style: {
            minHeight: '56px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#0077b6',

        },
    },
    headRow: {
        style: {
            backgroundColor: '#0077b6',
            borderTop: '1px solid #dddddd',

        },
    },
    headCells: {
        style: {
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'capitalize',
            paddingLeft: '8px',
            paddingRight: '8px',
            color: '#ffffff',
        },
    },
    rows: {
        style: {
            backgroundColor: '#ffffff',
            '&:nth-of-type(even)': {
                backgroundColor: '#f9f9f9', // Color alternativo para filas pares
            },
            '&:hover': {
                backgroundColor: '#ffe3e3', // Color al pasar el cursor
            },
        },
    },
    cells: {
        style: {
            paddingLeft: '8px',
            paddingRight: '8px',
        },
    },
    pagination: {
        style: {
            borderTop: '1px solid #dddddd',
            backgroundColor: '#ffffff',
            padding: '8px',
        },

    },
};


  return (
    <div className={styles.container}>
      <form onSubmit={guardarTipoSeguro}>
  
        <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
        <h2>Nuevo Seguro</h2>
  
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="nom_tip_seg">Nombre del seguro</label>
            <input type="text" name="nom_tip_seg" id="nom_tip_seg" onChange={agregarClaveFormulario} />
          </div>
  
          <div className={styles.formGroup}>
            <label htmlFor="descrip_tip_seg">Descripción</label>
            <textarea name="descrip_tip_seg" id="descrip_tip_seg" onChange={agregarClaveFormulario}></textarea>
          </div>
        </div>
  
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="categoria">Categoría</label>
            <Select
              options={categorias}
              onChange={(e) => cargarBeneficios(e)}
            />
          </div>
        </div>
  
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="beneficios">Beneficios</label>
            <DataTable
              columns={comulasBeneficios}
              data={beneficios}
              noDataComponent="No hay categoría seleccionada"
              customStyles={customStyles}
              persistTableHead
            />
          </div>
        </div>
  
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="pago_tip_seg">Prima mensual o anual (costo base)</label>
            <input
              type="text"
              placeholder="Ej.: $50/mes"
              name="pago_tip_seg"
              id="pago_tip_seg"
              onChange={agregarClaveFormulario}
            />
          </div>
  
          <div className={styles.formGroup}>
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
  
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.btnGuardar}>Guardar</button>
          <button
            type="button"
            className={styles.btnCancelar}
            onClick={cancelar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
  
}
export default CrearSeguroAdmin;