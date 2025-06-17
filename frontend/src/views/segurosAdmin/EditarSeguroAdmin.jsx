import React, { useEffect, useState } from "react";
import Select from "react-select";
import SegurosAdminFun from "./SegurosAdminFun";
import DataTable from "react-data-table-component";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import "../estilos/EditarSeguroAdmin.css";


export function EditarSeguroAdmin({ mostrarSeccion }) {
     
     const [categorias, setCategorias] = useState([]);
     const [categoriaCombo, setCategoriaCombo] = useState([]);
     const [beneficios, setBeneficios] = useState([]);
     const [formulario, setFormulario] = useState({ nom_tip_seg: '', descrip_tip_seg: '', id_estado: '', id_tip_seg: '' });
     const [listbeneficios, setListBeneficios] = useState([]);
     const [beneficiosFijos, setBeneficiosFijos] = useState([]);
     const navigate = useNavigate();
     const [seguro, setSeguro] = useState();

     useEffect(() => {

         const cargarDatos = async () => {
             let api = await SegurosAdminFun.categoria(navigate);
             const apiConv = api.map((datos) => ({
                 value: datos.id_categoria,
                 label: datos.nom_categoria,
             }));
             setCategorias(apiConv);
             const editData = JSON.parse(localStorage.getItem("editSeguro"));
             if (editData && editData.seguro) {
                 setFormulario(editData.seguro);
                 setSeguro(editData.seguro)
                 const seguroBeneficios = await SegurosAdminFun.SeguroBeneficios(editData.seguro.id_tip_seg, navigate)
                 let categoriaBus = apiConv.filter(item => item.value === seguroBeneficios[0].id_categoria);
                 setCategoriaCombo(categoriaBus);
                 let apiBeneficio = await SegurosAdminFun.beneficios(seguroBeneficios[0].id_categoria, navigate);
                 setBeneficios(apiBeneficio);
                 const soloIds = seguroBeneficios.map(item => item.id_beneficios);
                 setListBeneficios(soloIds);
                 setBeneficiosFijos(soloIds)
                 localStorage.removeItem("AgenteInformacion");
             }
         }
         cargarDatos();
     }, [navigate]);

     const comulasBeneficios = [
         {
             name: "Seleccionar",
             cell: (row, index) => {
                 const isFijo = beneficiosFijos.includes(row.id_beneficios);
                 const isChecked = isFijo || listbeneficios.includes(row.id_beneficios);

                 return (
                     <input
                         type="checkbox"
                         data-testid={`checkbox-${index}`}
                         checked={isChecked}
                         disabled={isFijo} // solo desactiva los beneficios fijos
                         onChange={(e) => selecionBeneficio(e, row)}
                     />
                 );
             },
             button: true,
         },
         {
             name: "Descripción",
             selector: (row) => row.nom_beneficios,
             sortable: true,
         },
     ];

     const selecionBeneficio = (e, row) => {
         const id = row.id_beneficios;

         if (beneficiosFijos.includes(id)) return;

         setListBeneficios((prev) => {
             const exists = prev.includes(id);
             if (exists) {
                 return prev.filter((item) => item !== id);
             } else {
                 return [...prev, id];
             }
         });
     };

     const cargarBeneficios = async (val) => {
         setListBeneficios([]);
         setCategoriaCombo(val);
         let apiBeneficio = await SegurosAdminFun.beneficios(val.value, navigate);
         setBeneficios(apiBeneficio);
     }
     const agregarClaveFormulario = (e) => {
         setFormulario({ ...formulario, [e.target.name]: e.target.value })
     }
     const vefCambioBeneficios = (arr1, arr2) => {
         if (arr1.length !== arr2.length) return false;

         const sorted1 = [...arr1].sort();
         const sorted2 = [...arr2].sort();

         return sorted1.every((val, i) => val === sorted2[i]);
     };
     const actualizarTipoSeguro = async (e) => {
         e.preventDefault();
        if (String(formulario.descrip_tip_seg || '').trim() !== '') {
             const cambiosFormulario = formulario.descrip_tip_seg !== seguro.descrip_tip_seg;
             const cambiosBeneficios = !vefCambioBeneficios(beneficiosFijos, listbeneficios);
             if (cambiosFormulario || cambiosBeneficios) {
                 swal.fire({
                     title: "<label>Confirmacion</label>",
                     text: "Desea aplicar los cambios",
                     showDenyButton: true,
                     denyButtonText: "No",
                     confirmButtonText: "Si"
                 }).then(async (respuesta) => {

                     if (respuesta.isConfirmed) {
                         if (cambiosFormulario) {
                             await SegurosAdminFun.actualizarTipoSeguro(formulario, navigate)
                             swal.fire({
                                 title: "<label>Exito</label>",
                                 text: "Se ha aplicado los cambios correctamente",
                                 timer: 3500,
                         })
                             if (cambiosBeneficios) {
                                 await SegurosAdminFun.borrarBeneficios({ id: formulario.id_tip_seg }, navigate)
                                 guardarBeneficios(formulario.id_tip_seg)
                             }
                             mostrarSeccion("segurosAdmin")

                         } else {
                             await SegurosAdminFun.borrarBeneficios({ id: formulario.id_tip_seg }, navigate)
                             guardarBeneficios(formulario.id_tip_seg)
                             mostrarSeccion("segurosAdmin")
                         }
                     }
                 });
             }

             else {
                 swal.fire({
                     title: "<label>Advertencia</label>",
                     text: "No se han realizado ningun Cambio",
                     timer: 3500,
                 })
             }

         } else {
             toast.error("Falta la descripción del seguro ");
         }
     }
     const guardarBeneficios = async (id) => {
         const valores = listbeneficios.map(b => [id, b]);
         await SegurosAdminFun.guardarBeneficioSeguro(valores, navigate);
     };
     const actualizarEstado = async (e) => {
         e.preventDefault();
         const data = { id: formulario.id_tip_seg };
         swal.fire({
             title: "<label>Advertencia</label>",
             text: "Desea desactivar este tipo de seguro",
             showDenyButton: true,
             denyButtonText: "No",
             confirmButtonText: "Si"
         }).then(async (respuesta) => {
             if (respuesta.isConfirmed) {
                 await SegurosAdminFun.actualizarEstado(data, navigate);
                 swal.fire({
                     title: "<label>Exito</label>",
                     text: "Seguro desactivado Completamente",
                     timer: 3500,
                 })
                 mostrarSeccion("segurosAdmin")
             }
         });
     }
     const cancelar = () => {
         const algunCampoLleno = Object.values(formulario).some(valor => String(valor || '').trim() !== '');
         if (algunCampoLleno) {
             swal.fire({
                 title: "⚠️ <label>Advertencia</label>",
                 text: "Desea descartar los cambios",
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
         <div className="editar-seguro-container">
             <form className="editar-seguro-form" onSubmit={actualizarTipoSeguro}>
                 <div className="editar-seguro-header">
                     <h2 className="editar-seguro-title">Editar Seguro</h2>
                 <button type="button" className="btn-desactivar" onClick={actualizarEstado}>
                     Desactivar Seguro
                 </button>

                 <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
                 
                 

                 
</div>
                 <div className="form-row">
                    <div className="form-group">
                         <label className="form-label">Nombre del seguro</label>
                         <input className="form-input" type="text" name="nom_tip_seg" id="nom_tip_seg" value={seguro?.nom_tip_seg || ''} readOnly />
                     </div>
                    <div className="form-group">
                         <label className="form-label">Descripción</label>
                         <textarea className="form-textarea" name="descrip_tip_seg" id="descrip_tip_seg" onChange={agregarClaveFormulario} value={formulario?.descrip_tip_seg || ''} />
                     </div>
                 </div>
                 <div className="form-row">
                    <div className="form-group">
                         <label className="form-label">Categoría</label>
                         <Select classNamePrefix="react-select" options={categorias} onChange={cargarBeneficios} value={categoriaCombo} isDisabled={true} />
                     </div>
                 </div>
                 <div className="form-group">
                     <label className="form-label">Beneficios</label>
                     <DataTable
                         columns={comulasBeneficios}
                         data={beneficios}
                         noDataComponent="No hay categoría seleccionada"
                         customStyles={customStyles}
                         persistTableHead
                     />
                 </div>
                 <div className="form-row">
                    <div className="form-group">
                         <label className="form-label">Prima mensual o anual (costo base)</label>
                         <input className="form-input" type="text" placeholder="Ej.: $50/mes" name="pago_tip_seg" id="pago_tip_seg" value={seguro?.pago_tip_seg || ''} readOnly />
                     </div>

                    <div className="form-group">
                         <label className="form-label">Suma asegurada máxima</label>
                         <input className="form-input" type="text" placeholder="En caso de fallecimiento" name="suma_tip_seg" id="suma_tip_seg" value={seguro?.suma_tip_seg || ''} readOnly />
                     </div>
                 </div>
                 <div className="button-group">
                     <button type="submit" className="btn-guardar">Guardar</button>
                     <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                 </div>
             </form>
         </div>
     );
 }
export default EditarSeguroAdmin;