import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from '../estilos/ClientesArchivos.module.css';
import ClientesFun from "./ClientesFun";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";

export function ClientesArchivos({ mostrarSeccion }) {
    const [fotoError, setFotoError] = useState('');
    const [cedulaError, setCedulaError] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [cedulaPdf, setCedulaPdf] = useState(null);
    const [cliente, setCliente] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            const login = JSON.parse(localStorage.getItem("login"));
            const res = await ClientesFun.buscarcliente(login.user, navigate);
            setCliente(res[0]);
        };
        cargarDatos();
    }, []);

    const guardarArchivos = async () => {
        if (!fotoPerfil || !cedulaPdf) {
            toast.error("Por favor, selecciona ambos archivos antes de guardar.");
            return;
        }
        try {
            const formDataFoto = new FormData();
            formDataFoto.append('profilePhoto', fotoPerfil);  // archivo
            await ClientesFun.guardarArhivoImagen(formDataFoto, cliente.id_pers, navigate)
            const formDataPdf = new FormData();
            formDataPdf.append('cedulaPdf', cedulaPdf);
            await ClientesFun.guardarArhivoCedula(formDataPdf, cliente.id_pers, navigate)
            await ClientesFun.actualizarEstadoActivo({ id_pers: cliente.id_pers }, navigate)
            swal.fire({
                title: "<label>Exito</label>",
                text: "vaidación de cuenta completada",
                timer: 3500
            })
            navigate('/cliente', { replace: true });
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    };

    const CargarFoto = (e) => {
        const originalFile = e.target.files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        if (originalFile) {
            if (allowedTypes.includes(originalFile.type)) {
                const newFileName = `${cliente.id_pers}${cliente.cedr_cli}foto_perfil_${getFileExtension(originalFile.name)}`;
                const renamedFile = new File([originalFile], newFileName, {
                    type: originalFile.type,
                    lastModified: originalFile.lastModified,
                });
                setFotoPerfil(renamedFile); // Guarda el archivo renombrado en el estado
                setFotoError('');
            } else {
                setFotoPerfil(null);
                setFotoError('Por favor, sube una imagen válida (PNG, JPG, JPEG, WEBP).');
                e.target.value = '';
            }
        } else {
            setFotoPerfil(null);
            setFotoError('');
        }
    };
    const getFileExtension = (filename) => {
        return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1);
    };

    const cargarCedula = (e) => {
        const originalFile = e.target.files[0];
        if (originalFile) {
            if (originalFile.type === 'application/pdf') {
                const newFileName = `${cliente.id_pers}${cliente.cedr_cli}_cedula.pdf`;
                console.log(newFileName);
                const renamedFile = new File([originalFile], newFileName, {
                    type: originalFile.type,
                    lastModified: originalFile.lastModified,
                });
                setCedulaPdf(renamedFile); // Guarda el archivo renombrado en el estado
                setCedulaError('');
            } else {
                setCedulaPdf(null);
                setCedulaError('Por favor, sube un archivo PDF válido.');
                e.target.value = ''; // Limpiar input para poder seleccionar el mismo archivo si fue error
            }
        } else {
            setCedulaPdf(null);
            setCedulaError('');
        }
    };


    return (
        <div className={styles.mainContent}>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

            <div className={styles.uploadCard}>
                <p className={styles.welcomeMessage}>
                    👋 ¡Hola! Para completar tu registro y activar tu cuenta, por favor, sube los siguientes documentos:
                </p>

                <div className={styles.uploadSection}>
                    <span className={styles.icon}>📷</span> Foto de perfil en formato <strong>PNG, JPG o JPEG </strong>
                    <label className={styles.uploadLabel}>{ }</label>
                    <div className={styles.fileInputGroup}>
                        <input
                            id="fotoPerfilInput"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={CargarFoto}
                            className={styles.hiddenInput}
                        />
                        <label htmlFor="fotoPerfilInput" className={styles.customFileUpload}>
                            Seleccionar archivo
                        </label>
                        <span className={styles.fileName}>
                            {fotoPerfil ? fotoPerfil.name : 'Sin archivo seleccionado'}
                        </span>

                    </div>
                    {fotoError && <p className={styles.errorMessage}>{fotoError}</p>}
                    {fotoPerfil && (
                        <div className={styles.preview}>
                            <p className={styles.previewTitle}>Vista previa de la imagen:</p>
                            <img
                                src={URL.createObjectURL(fotoPerfil)}
                                alt="Foto de perfil"
                                className={styles.imagePreview}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.uploadSection}>
                    <span className={styles.icon}>🆔</span> Cédula escaneada en formato <strong>PDF</strong>

                    <div className={styles.fileInputGroup}>
                        <input
                            id="cedulaPdfInput"
                            type="file"
                            accept="application/pdf"
                            onChange={cargarCedula}
                            className={styles.hiddenInput}
                        />
                        <label htmlFor="cedulaPdfInput" className={styles.customFileUpload}>
                            Seleccionar archivo
                        </label>
                        <span className={styles.fileName}>
                            {cedulaPdf ? cedulaPdf.name : 'Sin archivo seleccionado'}
                        </span>

                    </div>
                    {cedulaError && <p className={styles.errorMessage}>{cedulaError}</p>}
                    {cedulaPdf && (
                        <div className={styles.preview}>
                            <embed
                                src={URL.createObjectURL(cedulaPdf)}
                                type="application/pdf"
                                width="100%"
                                height="300px"
                                className={styles.pdfPreview}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <button>Cancelar</button>
                    <button onClick={guardarArchivos}>Guardar</button>
                </div>
            </div>
        </div>
    );
}
export default ClientesArchivos;