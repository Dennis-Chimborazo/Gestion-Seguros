import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import CargarTablas from "../cargando/CargarTablas";
import stylesmod from "../estilos/modalDependientes.module.css";
import AgenteFun from "./AgenteFun";
import ModalCorreoAgente from "./ModalCorreoAgente";
import { SlRefresh } from "react-icons/sl";

export function AgentesPendientes({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState();
    const [filtroCli, setFiltroCli] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);
    const [formulario, setFormulario] = useState({})
    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataClientes = await AgenteFun.obtenerAgentesPendientes(navigate);
                setFiltroCli(dataClientes.rows);
                setClientes(dataClientes.rows);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();
    }, []);

    const columasClientes = [
        { name: "Cedula/Pasaporte", selector: row => row.ced_agente },
        { name: "Nombre", selector: row => row.nom_agente },
        { name: "Apellido", selector: row => row.ape_agente },
        { name: "Telefono", selector: row => row.email_agente },
        { name: "Celular", selector: row => row.dire_agente },
        { name: "Correo", selector: row => row.tel_agente },
        {
            name: "Reenviar Correo",
            cell: (row, index) => (
                <div>
                    <TfiEmail
                        data-testid={`icono-correo-${index}`}
                        size={25}
                        onClick={() => reenviarCorreo(row)}
                    />
                </div>
            ),
            ignoreRowClick: true
        },


    ];

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = clientes.filter((a) =>
                a.ced_agente && a.ced_agente.startsWith(e.target.value)
            );
            setFiltroCli(filtro);
        } else {
            setFiltroCli(clientes);
        }
    };

    const borrarFiltro = () => {
        setFiltroCli(clientes);
    }
    const reenviarCorreo = (row) => {
        localStorage.setItem("editCorreo", JSON.stringify({
            edit: true,
            agente: row
        }));
        abrirModal()
    }
    const refrescar = async () => {
        try {
            const dataClientes = await AgenteFun.obtenerAgentesPendientes(navigate);
            setFiltroCli(dataClientes.rows);
            setClientes(dataClientes.rows);
        } catch (error) {
            console.log("Ha ocurrido un error");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <form action="" method="get">
                <div>
                    <h2>Vadicacion de cuenta Pendiente </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese numero de cedula" onChange={filtrarClientes} />
                        <FcClearFilters data-testid="clear-filtro" size={25} onClick={borrarFiltro} />
                        <div>
                            <label htmlFor="" >Actualizar</label>
                            <SlRefresh data-testid="btn-actualizar" size={18} onClick={refrescar} />

                        </div>
                    </div>
                </div>
                {loading ? (<CargarTablas />) :
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasClientes}
                        data={filtroCli}
                        noDataComponent="No ha selecionado ninguna actividad"
                        persistTableHead
                    />}
            </form>
            {isModalOpen && (
                <div className={stylesmod.overlay}  data-testid="overlay-modal"> 
                    <div className={stylesmod.modal} data-testid="modal-contenido">
                        <button className={stylesmod.closeBtn} data-testid="btn-cerrar-modal" onClick={cerrarModal}>X</button>
                        <ModalCorreoAgente cerrarModal={cerrarModal} datosCliente={formulario} mostrarSeccion={mostrarSeccion} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default AgentesPendientes;