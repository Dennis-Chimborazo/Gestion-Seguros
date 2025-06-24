import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import CargarTablas from "../cargando/CargarTablas";
import InfoCard from "../cargando/InfoCards";
import AgenteFun from "./AgenteFun";
import { FaUserEdit } from "react-icons/fa";
import stylesmod from "../estilos/modalDependientes.module.css";
import AgenteInformacion from "./AgenteInformacion";

export function Agentes({ mostrarSeccion }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [clientes, setClientes] = useState();
    const [filtroCli, setFiltroCli] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const datAgentes = await AgenteFun.obtenerAgentes(navigate)
                setFiltroCli(datAgentes.rows);
                setClientes(datAgentes.rows);
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
        { name: "Correo", selector: row => row.email_agente },
        {
            name: "Opciones", cell: (row, index) =>
            (<div>
                <FcFinePrint size={25}
                    data-testid={`icono-cliente-${index}`}
                    onClick={() => mostrarInformacion(row)} />
                <FaUserEdit size={25}
                    data-testid={`icono-cliente-${index}`}
                    onClick={() => EditarAgente(row)} />
            </div>
            ), ignoreRowClick: true
        },
    ];
    const mostrarInformacion = (row) => {
        localStorage.setItem("AgenteInformacion", JSON.stringify({
            edit: true,
            agente: row
        }));
        abrirModal();
    }

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = clientes.filter((a) =>
                a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
            );
            setFiltroCli(filtro);
        }
    };

    const borrarFiltro = () => {
        setFiltroCli(clientes);
    }

    const EditarAgente = (row) => {
        localStorage.setItem("editAgente", JSON.stringify({
            edit: true,
            agente: row
        }));
        mostrarSeccion("EditarAgente");
    }

    return (
        <div>
            <form action="" method="get">
                <div>
                    <h2>Agentes </h2>
                    <div>
                        <label htmlFor="buscar"> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese numero de cedula" onChange={filtrarClientes} />
                        <FcClearFilters  data-testid="boton-borrar-filtro" size={25} onClick={borrarFiltro} />
                        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '20px 0' }}>
                            <InfoCard
                                text="Nuevo Agente"
                                color="#00AEEF" // Color azul de la imagen
                                onClick={() => mostrarSeccion('crearAgentes')}
                            />
                            <InfoCard
                                text="Validaciones pendientes"
                                color="#4CAF50" // Color verde de la imagen
                                onClick={() => mostrarSeccion('AgentePendiente')}
                            />
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
                        persistTableHead >
                    </DataTable>}
            </form>
            {isModalOpen && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                        <AgenteInformacion cerrarModal={cerrarModal} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default Agentes;