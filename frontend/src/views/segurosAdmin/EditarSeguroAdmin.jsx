import React, {useEffect,useState} from "react";
import Select from "react-select";
import SegurosAdminFun from "./SegurosAdminFun";
import DataTable from "react-data-table-component";
import { useNavigate,useLocation } from "react-router-dom";
import {Toaster,toast} from "sonner";
import swal from "sweetalert2";

export function EditarSeguroAdmin({ mostrarSeccion }){
                        
    const [categorias,setCategorias]= useState([]);
    const [categoriaCombo,setCategoriaCombo]= useState([]);
    const [beneficios,setBeneficios]= useState([]);
    const [formulario,setFormulario]= useState({ nom_tip_seg:'',descrip_tip_seg:'',pago_tip_seg:'',suma_tip_seg:'',id_estado:'',id_tip_seg:''});
    const [listbeneficios,setListBeneficios]= useState([]);
    const [nom_tip_seg,setNom_tip_seg]=useState('');
    const [descrip_tip_seg,setDescrip_tip_seg]=useState('');
    const [pago_tip_seg,setpago_tip_seg]=useState('');
    const [suma_tip_seg,setsuma_tip_seg]=useState('');
    const [seguroActual,setSeguroActual]= useState([]);
    const [beneficiosActuales,setBeneficiosActuales]= useState([]);


    const navigate= useNavigate();

    useEffect(()=>{
       
        const serugo= async()=>{
             let api= await SegurosAdminFun.categoria(navigate);
            const apiConv = api.map((datos) => ({
                value: datos.id_categoria,
                label: datos.nom_categoria,
              }));
            setCategorias(apiConv);
            const editData = JSON.parse(localStorage.getItem("editSeguro"));
            setFormulario({...formulario,nom_tip_seg:editData.seguro.nom_tip_seg,
                descrip_tip_seg:editData.seguro.descrip_tip_seg,
                pago_tip_seg:editData.seguro.pago_tip_seg,
                suma_tip_seg:editData.seguro.suma_tip_seg,
                id_estado:editData.seguro.id_estado,
                id_tip_seg:editData.seguro.id_tip_seg,});
            setNom_tip_seg(editData.seguro.nom_tip_seg)
            setDescrip_tip_seg(editData.seguro.descrip_tip_seg)
            setpago_tip_seg(editData.seguro.pago_tip_seg)
            setsuma_tip_seg(editData.seguro.suma_tip_seg)

            const seguroBeneficios= await SegurosAdminFun.SeguroBeneficios(editData.seguro.id_tip_seg,navigate)
            let categoriaBus = apiConv.filter(item => item.value === seguroBeneficios[0].id_categoria);
            setCategoriaCombo(categoriaBus);
            let apiBeneficio= await SegurosAdminFun.beneficios(seguroBeneficios[0].id_categoria,navigate);
            setBeneficios(apiBeneficio);
            const soloIds = seguroBeneficios.map(item => item.id_beneficios);
            setListBeneficios(soloIds);
            setBeneficiosActuales(soloIds);
            setSeguroActual(editData);
        }

        serugo();

    },[]);
    const comulasBeneficios = [
    {
        name: "Seleccionar",
        cell: (row) => (
        <input
            type="checkbox"
            checked={listbeneficios.includes(row.id_beneficios)}
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
        setListBeneficios((prev) => {
            const exists = prev.includes(row.id_beneficios);
            if (exists) {
            return prev.filter((item) => item !== row.id_beneficios);
            } else {
            return [...prev, row.id_beneficios];
            }
        });
    };

      
    const cargarBeneficios=async(val)=>{
            setListBeneficios([]);
            setCategoriaCombo(val);
            let apiBeneficio= await SegurosAdminFun.beneficios(val.value,navigate);
            setBeneficios(apiBeneficio);
        }
    const agregarClaveFormulario  =(e)=>{
    setFormulario({...formulario,[e.target.name]:e.target.value})
    document.getElementById(e.target.name).value = e.target.value;
  }

      const vefCambioBeneficios = (arr1, arr2) => {
            if (arr1.length !== arr2.length) return false;

            const sorted1 = [...arr1].sort();
            const sorted2 = [...arr2].sort();

            return sorted1.every((val, i) => val === sorted2[i]);
            };

  const guardarTipoSeguro= async(e)=>{
    e.preventDefault()
    if (Object.values(formulario).every(valor => valor !== '')) {

      if (listbeneficios.length==0) {
      toast.error("Debe seleccionar minimo un beneficio ⚠️");
        
      }else{
        const cambiosFormulario = Object.keys(formulario).some((key) => formulario[key] !== seguroActual.seguro[key]);
        const cambiosBeneficios = !vefCambioBeneficios(beneficiosActuales, listbeneficios);
        if (cambiosFormulario||cambiosBeneficios) {
             swal.fire({
                title:"<label>Confirmacion</label>",
                text:"Desea aplicar los cambios",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
             }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    if (cambiosFormulario) {
                        try {
                            const api = await SegurosAdminFun.actualizarTipoSeguro(formulario,navigate)
                        swal.fire({
                                title:"<label>Exito</label>",
                                text:"Se ha aplicado los cambios correctamente",
                                timer:3500,})
                        if (cambiosBeneficios) {
                            const data={ id: formulario.id_tip_seg }
                            const api= await SegurosAdminFun.borrarBeneficios(data,navigate)
                            guardarBeneficios(formulario.id_tip_seg )
                        }
                            mostrarSeccion("segurosAdmin")
                            
                        } catch (error) {
                             swal.fire({
                                title:"<label>Advertencia</label>",
                                text:"El nombre ya se encuentra registrado",
                                timer:3500,})
                        }
                        }else{
                            const data={ id: formulario.id_tip_seg }
                            const api= await SegurosAdminFun.borrarBeneficios(data,navigate)
                            guardarBeneficios(formulario.id_tip_seg )
                            mostrarSeccion("segurosAdmin")
                        }
                }
        });
        } else {
            swal.fire({
                        title:"<label>Advertencia</label>",
                        text:"No se han realizado ningun Cambio",
                        timer:3500,})
        }
      }
    }else{
      toast.error("Faltan campos por llenar ⚠️");
    }
    

  }
 const guardarBeneficios = async (id) => {
   const valores = listbeneficios.map(b => [id, b]);
   const res = await SegurosAdminFun.guardarBeneficioSeguro(valores, navigate);
};

const actualzarEstado = async(e)=>{
    e.preventDefault()
    const data={ id: formulario.id_tip_seg }
      swal.fire({
                title:"<label>Advertencia</label>",
                text:"Desea desactivar este tipo de seguro",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
            }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    const res= await SegurosAdminFun.actualizarEstado(data,navigate);
                     swal.fire({
                        title:"<label>Exito</label>",
                        text:"Seguro desactivado Completamente",
                        timer:3500,})
        
                    mostrarSeccion("segurosAdmin")
                }
        });
}
const cancelarOperacion = (e)=>{
      e.preventDefault()
        swal.fire({
                title:"<label>Confirmacion</label>",
                text:"Seguro desea cancelar ",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
            }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    mostrarSeccion("segurosAdmin")
                }
            });
    }

    return(
        <div>
            <form action="" method="">
        <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

               <h2>Editar Seguro</h2>
                <div>
                    <div> <button onClick={actualzarEstado}> Desactivar Seguro</button></div>

                    <div>
                    <label htmlFor="">Nombre del seguro</label>
                    <input type="text" name="nom_tip_seg" id="nom_tip_seg"  onChange={(e)=>{agregarClaveFormulario(e); setNom_tip_seg(e.target.value)}} value={nom_tip_seg}/>
                    <label htmlFor="">Descripcion</label>
                    <textarea name="descrip_tip_seg" id="descrip_tip_seg"   onChange={(e)=>{agregarClaveFormulario(e); setDescrip_tip_seg(e.target.value)}} value={descrip_tip_seg}></textarea>
                    </div> 

                <div>
                    <label htmlFor="">Categoria</label>
                    
                    <Select
                    options={categorias} 
                    onChange={(e) => { cargarBeneficios(e);}}
                    value={categoriaCombo} />
                    <label htmlFor="">Beneficios</label>
                    <DataTable
                    columns={comulasBeneficios} 
                    data={beneficios}
                    noDataComponent="No hay categoria selecionada"
                    persistTableHead  />
                    
                </div>
                <div>
                    <label htmlFor="">Pagos</label><br />
                    <label htmlFor="">Prima mensual o anual (costo base)</label>
                    <input type="text" placeholder="Ej.: $50/mes" name="pago_tip_seg" id="pago_tip_seg"  onChange={(e)=>{agregarClaveFormulario(e); setpago_tip_seg(e.target.value)}} value={pago_tip_seg}/>
                    <label htmlFor="">Suma asegurada máxima</label>
                    <input type="text" placeholder=" En caso de fallecimiento" name="suma_tip_seg" id="suma_tip_seg"  onChange={(e)=>{agregarClaveFormulario(e); setsuma_tip_seg(e.target.value)}} value={suma_tip_seg}/>
                </div>

                <div>
                  <button onClick={guardarTipoSeguro}>Editar</button>
                  <button onClick={cancelarOperacion}>cancelar </button>
                </div>

                </div>
            </form>
            </div>
    );
}
export default EditarSeguroAdmin;